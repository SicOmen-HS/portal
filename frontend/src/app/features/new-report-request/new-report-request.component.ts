import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataCatalogService } from '../../services/data-catalog.service';
import { TeamService } from '../../services/team.service';
import { OrderFormStepComponent } from '../../shared/components/order-form-step/order-form-step.component';
import { ProcessStepperComponent, ProcessStepView } from '../../shared/components/process-stepper/process-stepper.component';
import { ReviewEntry, ReviewSummaryComponent } from '../../shared/components/review-summary/review-summary.component';
import { highestInformationSecurityClassification, INFORMATION_SECURITY_CLASSIFICATION_LABELS, InformationSecurityClassification } from '../../models';

type DeliveryType = 'dashboard' | 'report' | 'both' | 'unsure';

interface DataOption { id: string; name: string; type: string; meta: string; classification: InformationSecurityClassification; }

@Component({
  selector: 'app-new-report-request',
  imports: [ReactiveFormsModule, RouterLink, OrderFormStepComponent, ProcessStepperComponent, ReviewSummaryComponent],
  templateUrl: './new-report-request.component.html',
  styleUrl: './new-report-request.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewReportRequestComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dataCatalog = inject(DataCatalogService);
  private readonly teamService = inject(TeamService);

  readonly serviceContextLabel = input('Rapporter och dashboards');
  readonly returnRoute = input<string[]>(['/tjanster', 'rapporter-och-dashboards']);

  protected readonly activeStep = signal(1);
  protected readonly completedStep = signal(0);
  protected readonly stage = signal<'editing' | 'review' | 'confirmed'>('editing');
  protected readonly deliveryType = signal<DeliveryType | ''>('');
  protected readonly dataKnowledge = signal('');
  protected readonly dataSearch = signal('');
  protected readonly selectedDataIds = signal<string[]>([]);
  protected readonly classificationLabels = INFORMATION_SECURITY_CLASSIFICATION_LABELS;

  private readonly informationMarts = toSignal(this.dataCatalog.getAllInformationMarts(), { initialValue: [] });
  private readonly datasets = toSignal(this.dataCatalog.getAllDatasets(), { initialValue: [] });
  protected readonly teams = toSignal(this.teamService.getAll(), { initialValue: [] });

  protected readonly dataOptions = computed<DataOption[]>(() => [
    ...this.informationMarts().map((item) => ({ id: item.id, name: item.name, type: 'Dataprodukt', meta: item.dataDomain, classification: item.classification })),
    ...this.datasets().map((item) => ({ id: item.id, name: item.name, type: 'Datamängd', meta: item.dataDomain, classification: item.classification })),
  ]);
  protected readonly filteredDataOptions = computed(() => {
    const term = this.dataSearch().trim().toLocaleLowerCase('sv');
    return this.dataOptions().filter((item) => !term || `${item.name} ${item.type} ${item.meta}`.toLocaleLowerCase('sv').includes(term));
  });
  protected readonly selectedData = computed(() => this.dataOptions().filter((item) => this.selectedDataIds().includes(item.id)));
  protected readonly selectedHighestClassification = computed(() => highestInformationSecurityClassification(this.selectedData().map((item) => item.classification)));
  protected readonly includesDashboard = computed(() => ['dashboard', 'both', 'unsure'].includes(this.deliveryType()));
  protected readonly includesReport = computed(() => ['report', 'both', 'unsure'].includes(this.deliveryType()));

  protected readonly form = this.formBuilder.nonNullable.group({
    deliveryType: ['', Validators.required], replacement: ['new'], workingTitle: ['', Validators.required], priority: ['normal'], desiredDate: [''],
    purposeType: ['analysis'], question: ['', [Validators.required, Validators.minLength(10)]], decisions: [''], audience: ['', Validators.required], usageFrequency: ['monthly'],
    dataKnowledge: ['', Validators.required], missingData: [''], knownSources: [''], historyNeed: ['unknown'],
    dashboardRefresh: ['daily'], reportDistribution: ['available'], reportInterval: ['monthly'], reportFormat: ['pdf'], platformPreference: ['none'], platformOther: [''], otherRequirements: [''],
    responsible: ['', Validators.required], addContacts: ['no'], contacts: [''], contactRole: ['business'], acceptanceOwner: ['same'], acceptanceOther: [''],
    accessAudience: ['owner'], sensitivity: ['no'], accessGroup: ['unknown'], finalComments: [''],
  });

  protected readonly processSteps: ProcessStepView[] = [
    { title: 'Typ av leverans', description: 'Välj rapport, dashboard eller båda och ange arbetsnamn.' },
    { title: 'Behov och målgrupp', description: 'Beskriv frågan, besluten och vilka som ska använda leveransen.' },
    { title: 'Dataunderlag', description: 'Välj befintlig data eller beskriv vad som saknas.' },
    { title: 'Uppdatering och distribution', description: 'Ange aktualitet, distribution, format och plattformspreferens.' },
    { title: 'Ansvar och kontakter', description: 'Ange en fiktiv ansvarig funktion och eventuella kontakter.' },
    { title: 'Behörighet och godkännande', description: 'Beskriv målgrupp och eventuella känslighetskrav.' },
    { title: 'Granska och skicka', description: 'Kontrollera hela beställningen före mockat inskick.' },
  ];

  protected chooseDeliveryType(type: DeliveryType): void { this.deliveryType.set(type); this.form.controls.deliveryType.setValue(type); }
  protected chooseDataKnowledge(value: string): void { this.dataKnowledge.set(value); this.form.controls.dataKnowledge.setValue(value); }
  protected toggleData(id: string): void { this.selectedDataIds.update((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  protected removeData(id: string): void { this.selectedDataIds.update((ids) => ids.filter((item) => item !== id)); }
  protected openStep(step: number): void { if (step <= this.completedStep() + 1) this.activeStep.set(step); }
  protected continueFrom(step: number): void { if (!this.stepValid(step)) return; this.completedStep.set(Math.max(this.completedStep(), step)); this.activeStep.set(Math.min(7, step + 1)); }
  protected showReview(): void { if (!this.stepValid(6)) return; this.completedStep.set(7); this.stage.set('review'); }
  protected editRequest(): void { this.stage.set('editing'); this.activeStep.set(1); }
  protected submitMockRequest(): void { this.stage.set('confirmed'); }
  protected reviewEntries(): ReviewEntry[] { return this.buildReviewEntries(); }

  private stepValid(step: number): boolean {
    const controls = this.form.controls;
    const fields = step === 1 ? [controls.deliveryType, controls.workingTitle]
      : step === 2 ? [controls.question, controls.audience]
      : step === 3 ? [controls.dataKnowledge]
      : step === 5 ? [controls.responsible] : [];
    fields.forEach((control) => control.markAsTouched());
    if (fields.some((control) => control.invalid)) return false;
    if (step === 3 && ['yes', 'partial'].includes(this.dataKnowledge()) && this.selectedDataIds().length === 0 && this.form.controls.missingData.value.trim().length < 5) return false;
    return true;
  }

  private buildReviewEntries(): ReviewEntry[] {
    const v = this.form.getRawValue();
    const expectedApproval = this.selectedDataIds().length
      ? 'Ansvariga för valda dataprodukter/datamängder kan behöva godkänna användningen.'
      : 'Utvecklingsteamet bedömer dataunderlaget; källsystems- eller dataansvariga kan behöva involveras.';
    return [
      { label: 'Typ av leverans', value: this.deliveryLabel(v.deliveryType) },
      { label: 'Ny eller befintlig', value: this.replacementLabel(v.replacement) },
      { label: 'Arbetsnamn', value: v.workingTitle },
      { label: 'Syfte och fråga', value: `${this.purposeLabel(v.purposeType)}\n${v.question}` },
      { label: 'Beslut eller åtgärder', value: v.decisions },
      { label: 'Målgrupp och användning', value: `${v.audience}\n${this.frequencyLabel(v.usageFrequency)}` },
      { label: 'Valda dataunderlag', value: this.selectedData().map((item) => `${item.type}: ${item.name}`).join('\n') || 'Inga valda' },
      { label: 'Högsta informationssäkerhetsklassning', value: this.selectedHighestClassification() ? this.classificationLabels[this.selectedHighestClassification()!] : 'Inga dataobjekt valda' },
      { label: 'Saknat/osäkert dataunderlag', value: v.missingData || this.dataKnowledgeLabel(v.dataKnowledge) },
      { label: 'Källor, begrepp och historik', value: `${v.knownSources || 'Inte angivet'}\n${this.historyLabel(v.historyNeed)}` },
      { label: 'Uppdatering/distribution', value: this.deliveryDetails(v) },
      { label: 'Ansvarig', value: v.responsible },
      { label: 'Kontakter', value: v.addContacts === 'yes' ? `${v.contacts} (${this.contactRoleLabel(v.contactRole)})` : 'Inga ytterligare kontakter' },
      { label: 'Målgrupp/behörighet', value: `${this.accessAudienceLabel(v.accessAudience)}\n${this.sensitivityLabel(v.sensitivity)}\nBehörighetsgrupp: ${this.yesNoUnknown(v.accessGroup)}` },
      { label: 'Förväntad godkännandeprocess', value: expectedApproval },
      { label: 'Övriga kommentarer', value: `${v.otherRequirements}\n${v.finalComments}`.trim() },
    ];
  }

  private deliveryDetails(v: ReturnType<typeof this.form.getRawValue>): string {
    const dashboard = this.includesDashboard() ? `Dashboard: ${this.refreshLabel(v.dashboardRefresh)}` : '';
    const report = this.includesReport() ? `Rapport: ${this.distributionLabel(v.reportDistribution)}, ${this.frequencyLabel(v.reportInterval)}, ${v.reportFormat.toUpperCase()}` : '';
    return [dashboard, report, `Plattform: ${v.platformPreference === 'other' ? v.platformOther : this.platformLabel(v.platformPreference)}`].filter(Boolean).join('\n');
  }
  private deliveryLabel(v: string): string { return ({ dashboard: 'Dashboard', report: 'Rapport', both: 'Både rapport och dashboard', unsure: 'Osäker' } as Record<string,string>)[v] ?? v; }
  private replacementLabel(v: string): string { return ({ new: 'Helt ny', existing: 'Ersätter eller bygger vidare på befintlig', unsure: 'Osäker' } as Record<string,string>)[v] ?? v; }
  private purposeLabel(v: string): string { return ({ operations: 'Följa upp drift eller process', kpi: 'Följa upp nyckeltal', analysis: 'Göra analys', management: 'Ledningsrapportering', formal: 'Formell återrapportering', other: 'Annat' } as Record<string,string>)[v] ?? v; }
  private frequencyLabel(v: string): string { return ({ daily: 'Dagligen', weekly: 'Veckovis', monthly: 'Månadsvis', need: 'Vid behov', other: 'Annat' } as Record<string,string>)[v] ?? v; }
  private dataKnowledgeLabel(v: string): string { return ({ yes: 'Data finns', partial: 'Behöver kompletteras', no: 'Data är okänd', missing: 'Hittar inte data' } as Record<string,string>)[v] ?? v; }
  private historyLabel(v: string): string { return ({ latest: 'Senaste status räcker', history: 'Historik över tid behövs', unknown: 'Vet inte' } as Record<string,string>)[v] ?? v; }
  private refreshLabel(v: string): string { return ({ realtime: 'Nära realtid', minutes: '5–30 minuter', hours: '1–2 timmar', several: 'Några gånger per dag', daily: 'En gång per dag', other: 'Annat/osäker' } as Record<string,string>)[v] ?? v; }
  private distributionLabel(v: string): string { return ({ scheduled: 'Schemalagd', available: 'Tillgänglig för nedladdning', both: 'Schemalagd och tillgänglig', unsure: 'Osäker' } as Record<string,string>)[v] ?? v; }
  private platformLabel(v: string): string { return ({ none: 'Ingen preferens', existing: 'Befintlig BI-miljö' } as Record<string,string>)[v] ?? v; }
  private contactRoleLabel(v: string): string { return ({ requester: 'Beställare', business: 'Verksamhetskontakt', technical: 'Teknisk kontakt', support: 'Förvaltning/support', recipient: 'Mottagare av utskick', other: 'Annat' } as Record<string,string>)[v] ?? v; }
  private accessAudienceLabel(v: string): string { return ({ owner: 'Endast ansvarig/beställare', team: 'Ett team eller en funktion', broad: 'En bredare målgrupp', unknown: 'Vet inte ännu' } as Record<string,string>)[v] ?? v; }
  private sensitivityLabel(v: string): string { return ({ no: 'Inga särskilda krav', sensitive: 'Känslig information', personal: 'Personuppgifter', unsure: 'Osäker' } as Record<string,string>)[v] ?? v; }
  private yesNoUnknown(v: string): string { return ({ yes: 'Ja', no: 'Nej', unknown: 'Vet inte' } as Record<string,string>)[v] ?? v; }
}

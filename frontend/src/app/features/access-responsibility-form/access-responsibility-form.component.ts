import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataCatalogService } from '../../services/data-catalog.service';
import { ReportingCatalogService } from '../../services/reporting-catalog.service';
import { SystemService } from '../../services/system.service';
import { TeamService } from '../../services/team.service';
import { OrderFormStepComponent } from '../../shared/components/order-form-step/order-form-step.component';
import { ProcessStepperComponent, ProcessStepView } from '../../shared/components/process-stepper/process-stepper.component';
import { ReviewEntry, ReviewSummaryComponent } from '../../shared/components/review-summary/review-summary.component';
import { INFORMATION_SECURITY_CLASSIFICATION_LABELS } from '../../models';

type ChangeKind = 'access' | 'responsibility';
type ResourceKind = 'bi' | 'data' | 'system' | 'other';

interface ResourceTypeOption {
  id: ResourceKind;
  label: string;
  description: string;
}

interface ResourceOption {
  id: string;
  label: string;
  type: string;
  meta?: string;
  classification?: string;
}

const RESOURCE_TYPES: ResourceTypeOption[] = [
  { id: 'bi', label: 'BI-tillämpning', description: 'Rapport, dashboard eller BI-dokument.' },
  { id: 'data', label: 'Dataprodukt eller datamängd', description: 'Befintlig data i portalens katalog.' },
  { id: 'system', label: 'System eller källsystem', description: 'System, verktyg eller teknisk källa.' },
  { id: 'other', label: 'Annat / jag hittar inte rätt objekt', description: 'Beskriv resursen med egna ord.' },
];

@Component({
  selector: 'app-access-responsibility-form',
  imports: [ReactiveFormsModule, RouterLink, OrderFormStepComponent, ProcessStepperComponent, ReviewSummaryComponent],
  templateUrl: './access-responsibility-form.component.html',
  styleUrl: './access-responsibility-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessResponsibilityFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly reportingCatalog = inject(ReportingCatalogService);
  private readonly dataCatalog = inject(DataCatalogService);
  private readonly systemService = inject(SystemService);
  private readonly teamService = inject(TeamService);

  readonly serviceContextLabel = input('Rapporter och dashboards');
  readonly returnRoute = input<string[]>(['/tjanster', 'rapporter-och-dashboards']);

  protected readonly resourceTypes = RESOURCE_TYPES;
  protected readonly classificationLabels = INFORMATION_SECURITY_CLASSIFICATION_LABELS;
  protected readonly activeStep = signal(1);
  protected readonly completedStep = signal(0);
  protected readonly stage = signal<'editing' | 'review' | 'confirmed'>('editing');
  protected readonly searchTerm = signal('');
  private readonly changeKind = signal<ChangeKind | ''>('');
  private readonly resourceKind = signal<ResourceKind | ''>('');
  protected readonly selectedResourceId = signal('');

  private readonly reportingAssets = toSignal(this.reportingCatalog.getAssets(), { initialValue: [] });
  private readonly informationMarts = toSignal(this.dataCatalog.getAllInformationMarts(), { initialValue: [] });
  private readonly datasets = toSignal(this.dataCatalog.getAllDatasets(), { initialValue: [] });
  private readonly systems = toSignal(this.systemService.getAll(), { initialValue: [] });
  protected readonly teams = toSignal(this.teamService.getAll(), { initialValue: [] });

  protected readonly form = this.formBuilder.nonNullable.group({
    changeKind: ['', Validators.required],
    resourceKind: ['', Validators.required],
    resourceId: [''],
    resourceDescription: [''],
    accessAction: ['add'],
    recipientKind: ['team'],
    recipient: ['', Validators.required],
    accessLevel: ['read'],
    customAccessLevel: [''],
    responsibilityType: ['business-owner'],
    responsibilityAction: ['replace'],
    responsibilityRoles: this.formBuilder.nonNullable.control<string[]>([]),
    effectiveMode: ['asap'],
    effectiveDate: [''],
    justification: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly processSteps: ProcessStepView[] = [
    { title: 'Välj ändring', description: 'Välj om begäran gäller behörighet/åtkomst eller ansvar/kontaktväg.' },
    { title: 'Identifiera resurs', description: 'Välj ett befintligt mockobjekt eller beskriv resursen med fritext.' },
    { title: 'Beskriv ändringen', description: 'Ange åtgärd, mottagare eller ansvarig, nivå eller roll och motivering.' },
    { title: 'Godkännande', description: 'Se vem som kan behöva granska eller acceptera ändringen.' },
    { title: 'Granska och skicka', description: 'Kontrollera sammanfattningen innan den mockade begäran skapas.' },
  ];

  protected readonly currentChangeKind = computed(() => this.changeKind());
  protected readonly selectedResourceKind = computed(() => this.resourceKind());
  protected readonly resourceOptions = computed<ResourceOption[]>(() => {
    switch (this.selectedResourceKind()) {
      case 'bi':
        return this.reportingAssets().map((item) => ({ id: item.id, label: item.name, type: 'BI-tillämpning', meta: item.responsibleLabel }));
      case 'data':
        return [
          ...this.informationMarts().map((item) => ({ id: item.id, label: item.name, type: 'Dataprodukt', meta: item.dataDomain, classification: this.classificationLabels[item.classification] })),
          ...this.datasets().map((item) => ({ id: item.id, label: item.name, type: 'Datamängd', meta: item.dataDomain, classification: this.classificationLabels[item.classification] })),
        ];
      case 'system':
        return this.systems().map((item) => ({ id: item.id, label: item.name, type: item.systemType, meta: item.authenticationModel }));
      default:
        return [];
    }
  });
  protected readonly filteredResources = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('sv');
    return this.resourceOptions().filter((item) => !term || `${item.label} ${item.type} ${item.meta ?? ''}`.toLocaleLowerCase('sv').includes(term));
  });
  protected readonly selectedResource = computed(() => this.resourceOptions().find((item) => item.id === this.selectedResourceId()));
  protected reviewEntries(): ReviewEntry[] { return this.buildReviewEntries(); }

  protected chooseChangeKind(kind: ChangeKind): void {
    this.changeKind.set(kind);
    this.form.controls.changeKind.setValue(kind);
  }

  protected chooseResourceKind(kind: ResourceKind): void {
    this.resourceKind.set(kind);
    this.form.controls.resourceKind.setValue(kind);
    this.form.controls.resourceId.setValue('');
    this.selectedResourceId.set('');
    this.searchTerm.set('');
  }

  protected chooseResource(id: string): void {
    this.selectedResourceId.set(id);
    this.form.controls.resourceId.setValue(id);
  }

  protected toggleResponsibilityRole(role: string, checked: boolean): void {
    const current = this.form.controls.responsibilityRoles.value;
    this.form.controls.responsibilityRoles.setValue(checked ? [...current, role] : current.filter((item) => item !== role));
  }

  protected continueFrom(step: number): void {
    if (!this.isStepValid(step)) return;
    this.completedStep.set(Math.max(this.completedStep(), step));
    this.activeStep.set(Math.min(step + 1, 5));
  }

  protected openStep(step: number): void {
    if (step <= this.completedStep() + 1) this.activeStep.set(step);
  }

  protected showReview(): void {
    if (!this.isStepValid(3)) return;
    this.completedStep.set(5);
    this.stage.set('review');
  }

  protected editRequest(): void {
    this.stage.set('editing');
    this.activeStep.set(1);
  }

  protected submitMockRequest(): void {
    this.stage.set('confirmed');
  }

  protected resourceSummary(): string {
    return this.selectedResource()?.label || this.form.controls.resourceDescription.value || 'Inte valt';
  }

  private isStepValid(step: number): boolean {
    if (step === 1) {
      this.form.controls.changeKind.markAsTouched();
      return this.form.controls.changeKind.valid;
    }
    if (step === 2) {
      this.form.controls.resourceKind.markAsTouched();
      const hasResource = this.selectedResourceKind() === 'other'
        ? this.form.controls.resourceDescription.value.trim().length >= 5
        : !!this.form.controls.resourceId.value || this.form.controls.resourceDescription.value.trim().length >= 5;
      return this.form.controls.resourceKind.valid && hasResource;
    }
    if (step === 3) {
      this.form.controls.recipient.markAsTouched();
      this.form.controls.justification.markAsTouched();
      return this.form.controls.recipient.valid && this.form.controls.justification.valid;
    }
    return true;
  }

  private buildReviewEntries(): ReviewEntry[] {
    const value = this.form.getRawValue();
    const resourceType = RESOURCE_TYPES.find((item) => item.id === value.resourceKind)?.label ?? '';
    const changeLabel = value.changeKind === 'access' ? 'Behörighet eller åtkomst' : 'Ansvar eller kontaktväg';
    const common: ReviewEntry[] = [
      { label: 'Ändringstyp', value: changeLabel },
      { label: 'Resurstyp', value: resourceType },
      { label: 'Valt objekt', value: this.resourceSummary() },
      ...(this.selectedResource()?.classification ? [{ label: 'Informationssäkerhetsklassning', value: this.selectedResource()!.classification! }] : []),
    ];
    if (value.changeKind === 'access') {
      return [...common,
        { label: 'Behörighetsåtgärd', value: this.accessActionLabel(value.accessAction) },
        { label: 'Gäller', value: `${this.recipientKindLabel(value.recipientKind)}: ${value.recipient}` },
        { label: 'Åtkomstnivå', value: value.accessLevel === 'other' ? value.customAccessLevel : this.accessLevelLabel(value.accessLevel) },
        { label: 'Motivering', value: value.justification },
        { label: 'Förväntad hantering', value: 'Objektansvarig granskar begäran och godkännande kan krävas innan ändringen genomförs.' },
      ];
    }
    return [...common,
      { label: 'Ansvarsområde', value: this.responsibilityTypeLabel(value.responsibilityType) },
      { label: 'Åtgärd', value: this.responsibilityActionLabel(value.responsibilityAction) },
      { label: 'Föreslagen ansvarig/kontakt', value: value.recipient },
      { label: 'Kompletterande roller', value: value.responsibilityRoles.join(', ') || 'Inga valda' },
      { label: 'Startdatum', value: value.effectiveMode === 'asap' ? 'Så snart som möjligt' : value.effectiveDate },
      { label: 'Motivering/överlämning', value: value.justification },
      { label: 'Förväntad hantering', value: 'Förvaltningskontakten granskar ändringen och föreslagen ny ansvarig kan behöva acceptera rollen.' },
    ];
  }

  private accessActionLabel(value: string): string { return ({ add: 'Lägg till behörighet', change: 'Ändra befintlig behörighet', remove: 'Ta bort behörighet' } as Record<string, string>)[value] ?? value; }
  private recipientKindLabel(value: string): string { return ({ person: 'Person eller funktion', team: 'Team', group: 'Behörighetsgrupp' } as Record<string, string>)[value] ?? value; }
  private accessLevelLabel(value: string): string { return ({ read: 'Läsa / använda', edit: 'Redigera / utveckla', publish: 'Publicera / förvalta', admin: 'Administrera' } as Record<string, string>)[value] ?? value; }
  private responsibilityTypeLabel(value: string): string { return ({ 'business-owner': 'Verksamhetsansvarig', 'technical-owner': 'Teknisk ansvarig', contact: 'Kontaktperson', approver: 'Godkännare för behörighet', support: 'Support- eller förvaltningskontakt', other: 'Annat ansvar' } as Record<string, string>)[value] ?? value; }
  private responsibilityActionLabel(value: string): string { return ({ add: 'Lägg till ansvarig', replace: 'Byt ansvarig', contact: 'Ändra kontaktväg' } as Record<string, string>)[value] ?? value; }
}

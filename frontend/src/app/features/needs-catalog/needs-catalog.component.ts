import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BiObjectSelectionChange, BiObjectSelectorComponent } from '../../shared/components/bi-object-selector/bi-object-selector.component';
import { ObjectSelectorComponent, SelectableObject } from '../../shared/components/object-selector/object-selector.component';
import { OrderFormStepComponent } from '../../shared/components/order-form-step/order-form-step.component';
import { ProcessStepperComponent, ProcessStepView } from '../../shared/components/process-stepper/process-stepper.component';
import { ReviewEntry, ReviewSummaryComponent } from '../../shared/components/review-summary/review-summary.component';
import { ReportingCatalogService } from '../../services/reporting-catalog.service';
import { SystemService } from '../../services/system.service';
import { reportingApprovalMessage } from '../../models';

interface ServiceAction {
  id: string;
  title: string;
  description: string;
  audience: string;
  useWhen: string;
  requirements: string[];
  prerequisites: string[];
  steps: string[];
  cta: string;
  icon: string;
  note?: string;
}

const ACTIONS: ServiceAction[] = [
  {
    id: 'create', title: 'Skapa ny rapport eller dashboard', icon: 'bi-plus-square',
    description: 'Ta ett nytt rapportbehov från idé till planerad leverans.',
    audience: 'För dig som saknar en rapport eller dashboard för ett återkommande behov.',
    useWhen: 'När ingen befintlig lösning täcker frågan och målgrupp, data och önskat resultat behöver beskrivas.',
    requirements: ['Vilket behov som ska lösas', 'Målgrupp och användningssätt', 'Känd data eller dataprodukt'],
    prerequisites: ['En utsedd beställare behöver kunna förtydliga behovet.'],
    steps: ['Beskriv behov', 'Välj data eller dataprodukt', 'Ange målgrupp', 'Granskning', 'Planering', 'Leverans'],
    cta: 'Starta beställning',
  },
  {
    id: 'change', title: 'Ändra innehåll eller utseende', icon: 'bi-layout-text-window-reverse',
    description: 'Ändra diagram, filter, flikar, mått, texter eller layout i en befintlig lösning.',
    audience: 'För dig som använder eller ansvarar för en befintlig rapport eller dashboard.',
    useWhen: 'När rapporten finns men innehåll, urval eller presentation behöver justeras.',
    requirements: ['Vilken rapport eller dashboard det gäller', 'Berörda flikar, vyer eller delar', 'Vad och varför du vill ändra', 'Önskad tidpunkt eller prioritet'],
    prerequisites: ['Rapporten behöver gå att identifiera.', 'Ändringen granskas mot befintlig data och förvaltning.'],
    steps: ['Välj rapport/dashboard', 'Välj flikar eller vyer', 'Beskriv ändring', 'Granskning', 'Återkoppling', 'Planering och leverans'],
    cta: 'Starta ändringsbegäran',
  },
  {
    id: 'data', title: 'Lägg till eller ändra data', icon: 'bi-database-add',
    description: 'Koppla befintlig data eller utred behov av en ny datakälla.',
    audience: 'För dig vars rapport behöver ett nytt mått, urval eller dataområde.',
    useWhen: 'När rapportens datainnehåll behöver utökas eller förändras.',
    requirements: ['Berörd rapport eller dashboard', 'Önskad data och användning', 'Känd datamängd eller dataprodukt om sådan finns'],
    prerequisites: ['Åtkomst och lämplighet behöver kontrolleras innan data kopplas in.'],
    steps: ['Välj rapport/dashboard', 'Välj befintlig data', 'Kontrollera åtkomst', 'Granskning', 'Modellering vid behov', 'Leverans'],
    cta: 'Välj rapport/dashboard',
    note: 'Om datan redan finns som datamängd eller dataprodukt kan den ofta kopplas till rapporten. Om datan saknas kan en ny dataintegrering, dataprodukt eller analysyta behöva beställas först.',
  },
  {
    id: 'access', title: 'Ändra behörighet', icon: 'bi-key',
    description: 'Lägg till eller ta bort åtkomst till en rapport eller dashboard.',
    audience: 'För dig som behöver ändra vilka användare eller grupper som har åtkomst.',
    useWhen: 'När rapporten redan finns och endast åtkomsten ska förändras.',
    requirements: ['Berörd rapport eller dashboard', 'Användare eller fiktiv grupp', 'Lägg till eller ta bort'],
    prerequisites: ['Begäran kan behöva godkännas av ansvarig ägare.'],
    steps: ['Välj rapport/dashboard', 'Ange användare eller grupp', 'Välj lägg till/ta bort', 'Kontroll av behörighet', 'Genomförande'],
    cta: 'Begär behörighet',
  },
  {
    id: 'owner', title: 'Ändra ägare eller kontaktväg', icon: 'bi-person-gear',
    description: 'Uppdatera ansvarig ägare eller den kontaktfunktion som visas.',
    audience: 'För dig som förvaltar en rapport där ansvar eller kontaktväg har ändrats.',
    useWhen: 'När ägarskap ska överlämnas eller kontaktinformationen inte längre stämmer.',
    requirements: ['Berörd rapport eller dashboard', 'Ny ägare eller kontaktfunktion', 'Bekräftelse av det nya ansvaret'],
    prerequisites: ['Den nya ansvarsfunktionen behöver bekräfta övertagandet.'],
    steps: ['Välj rapport/dashboard', 'Ange ny ägare eller kontaktfunktion', 'Bekräfta ansvar', 'Granskning', 'Uppdatering'],
    cta: 'Starta ändringsbegäran',
  },
  {
    id: 'problem', title: 'Rapportera problem', icon: 'bi-exclamation-circle',
    description: 'Beskriv ett fel, saknade värden eller oväntat beteende.',
    audience: 'För dig som inte kan använda en rapport eller ser något som verkar fel.',
    useWhen: 'När en befintlig rapport inte fungerar eller visar ett misstänkt resultat.',
    requirements: ['Berörd rapport eller dashboard', 'Vad som händer och förväntat resultat', 'Hur många som påverkas'],
    prerequisites: ['Undvik att bifoga personuppgifter eller känsliga data i felbeskrivningen.'],
    steps: ['Välj rapport/dashboard', 'Beskriv problem', 'Ange påverkan', 'Felsökning', 'Återkoppling'],
    cta: 'Rapportera problem',
  },
];

@Component({
  selector: 'app-needs-catalog',
  imports: [RouterLink, ReactiveFormsModule, ObjectSelectorComponent, OrderFormStepComponent, ProcessStepperComponent, ReviewSummaryComponent, BiObjectSelectorComponent],
  templateUrl: './needs-catalog.component.html',
  styleUrl: './needs-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeedsCatalogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly systemService = inject(SystemService);
  private readonly reportingCatalog = inject(ReportingCatalogService);
  protected readonly actions = ACTIONS;
  protected readonly selectedAction = signal<ServiceAction | null>(this.initialRouteAction());
  protected readonly formStage = signal<'editing' | 'review' | 'confirmed'>('editing');
  protected readonly activeFormStep = signal(1);
  protected readonly completedFormStep = signal(0);
  protected readonly reviewEntries = signal<ReviewEntry[]>([]);
  protected readonly reportScopes: SelectableObject[] = ['Översikt', 'Detaljvy', 'Filter', 'Diagram', 'Mått eller beräkning', 'Texter och rubriker', 'Layout', 'Export eller utskrift', 'Annat'].map((title, index) => ({ id: `scope-${index}`, title }));

  // BI-objektval (system/container/asset) för "Ändra innehåll eller utseende" –
  // en första, avgränsad tillämpning av den generiska BI-objektmodellen
  // (docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md).
  private readonly allSystems = toSignal(this.systemService.getAll(), { initialValue: [] });
  protected readonly biContainers = toSignal(this.reportingCatalog.getContainers(), { initialValue: [] });
  protected readonly biAssets = toSignal(this.reportingCatalog.getAssets(), { initialValue: [] });
  protected readonly biSystems = computed(() => {
    const systemIds = new Set(this.biContainers().map((container) => container.systemId));
    return this.allSystems().filter((system) => systemIds.has(system.id));
  });
  protected readonly biSystemId = signal('');
  protected readonly biContainerId = signal('');
  protected readonly biAssetId = signal('');
  protected readonly biAttempted = signal(false);
  protected readonly requesterIsResponsible = signal(false);
  protected readonly selectedBiSystem = computed(() => this.biSystems().find((system) => system.id === this.biSystemId()));
  protected readonly selectedBiAsset = computed(() => this.biAssets().find((asset) => asset.id === this.biAssetId()));
  protected readonly changeProcessSteps: ProcessStepView[] = [
    { title: 'Välj rapport/dashboard', description: 'Välj den eller de rapporter som ändringen gäller. Samma ändring kan gälla flera lösningar.' },
    { title: 'Välj flikar eller vyer', description: 'Ange vilka delar ändringen berör, till exempel översikt, filter, diagram eller mått.' },
    { title: 'Beskriv ändring', description: 'Beskriv vad du vill ändra och varför. Ett tydligt underlag gör bedömningen enklare.' },
    { title: 'Granskning', description: 'Utvecklingsteamet kontrollerar underlaget och eventuell påverkan på data, behörighet och användare.' },
    { title: 'Återkoppling', description: 'Du får besked om begäran kan planeras eller om mer information behövs.' },
    { title: 'Planering och leverans', description: 'När underlaget är tydligt planeras arbetet enligt teamets prioritering.' },
  ];
  protected readonly requestForm = this.formBuilder.nonNullable.group({
    scopeIds: this.formBuilder.nonNullable.control<string[]>([], Validators.required),
    changeDescription: ['', [Validators.required, Validators.minLength(10)]],
    reason: ['', Validators.required],
    usage: [''],
    reference: [''],
    timing: ['', Validators.required],
    priority: ['Normal', Validators.required],
    impact: ['', Validators.required],
    requester: ['Exempel beställare', Validators.required],
    contactFunction: ['Exempel kontaktfunktion', Validators.required],
    businessArea: ['Exempelteam Verksamhet', Validators.required],
    reportOwner: [''],
  });

  constructor() {
    // Landar man direkt på åtgärdsroutens URL (länk, bokmärke eller webbläsarens
    // bakåt/fram) körs aldrig selectAction(), så samma scroll/fokus som ett klick ger
    // måste sättas explicit här också.
    if (this.selectedAction()) {
      this.scrollTopAndFocus('#selected-view', '#change-action-button');
    }
  }

  selectAction(action: ServiceAction): void {
    if (action.id === 'change') {
      // "Ändra innehåll eller utseende" har en egen route (ADR-0002) så att den går att
      // dela, bokmärka och navigera till/från med webbläsarens bakåt/fram.
      this.router.navigate(['/tjanster', 'rapporter-och-dashboards', 'andra-innehall']);
      return;
    }
    this.selectedAction.set(action);
    this.resetRequest();
    this.scrollTopAndFocus('#selected-view', '#change-action-button');
  }

  showAllActions(): void {
    if (this.route.snapshot.data['actionId']) {
      this.router.navigate(['/tjanster', 'rapporter-och-dashboards']);
      return;
    }
    this.selectedAction.set(null);
    this.resetRequest();
    this.scrollTopAndFocus('#service-start', '#action-heading');
  }

  private initialRouteAction(): ServiceAction | null {
    const actionId = this.route.snapshot.data['actionId'] as string | undefined;
    return actionId ? ACTIONS.find((action) => action.id === actionId) ?? null : null;
  }

  private scrollTopAndFocus(topSelector: string, focusSelector: string): void {
    afterNextRender(
      () => {
        // behavior: 'auto' defers to the CSS scroll-behavior of the scrolling box, and
        // Bootstrap sets `:root { scroll-behavior: smooth }` globally. Overriding it inline
        // forces a real instant jump so the view doesn't animate to the wrong spot.
        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        document.querySelector<HTMLElement>(topSelector)?.scrollIntoView({ block: 'start' });
        root.style.scrollBehavior = previousScrollBehavior;
        document.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  reviewRequest(): void {
    if (this.requestForm.invalid || !this.biAssetId() || !this.requestForm.controls.scopeIds.value.length) {
      this.requestForm.markAllAsTouched();
      this.biAttempted.set(true);
      setTimeout(() => document.querySelector<HTMLElement>('.field-error')?.focus());
      return;
    }
    const value = this.requestForm.getRawValue();
    const titles = (ids: string[], items: SelectableObject[]) => ids.map((id) => items.find((item) => item.id === id)?.title).filter(Boolean).join(', ');
    this.reviewEntries.set([
      { label: 'Vald åtgärd', value: 'Ändra innehåll eller utseende' },
      { label: 'Rapport/dashboard', value: this.biSelectionSummary() },
      { label: 'Ansvarig', value: this.selectedBiAsset()?.responsibleLabel ?? '' },
      { label: 'Godkännande', value: this.processInfoText() },
      { label: 'Berörda delar', value: titles(value.scopeIds, this.reportScopes) },
      { label: 'Vad vill du ändra?', value: value.changeDescription },
      { label: 'Varför?', value: value.reason },
      { label: 'Hur används resultatet?', value: value.usage },
      { label: 'Tidpunkt, prioritet och påverkan', value: `${value.timing} · ${value.priority} · ${value.impact}` },
      { label: 'Kontakt och ansvar', value: `${value.requester} · ${value.contactFunction}\n${value.businessArea}${value.reportOwner ? ` · Ägare: ${value.reportOwner}` : ''}` },
    ]);
  }

  onBiSelectionChange(change: BiObjectSelectionChange): void {
    this.biSystemId.set(change.systemId);
    this.biContainerId.set(change.containerId);
    this.biAssetId.set(change.assetId);
  }

  protected biSelectionSummary(): string {
    const asset = this.selectedBiAsset();
    if (!asset) return '';
    return `${this.selectedBiSystem()?.name ?? ''} · ${asset.name}`;
  }

  protected processInfoText(): string {
    return reportingApprovalMessage(this.selectedBiAsset(), this.requesterIsResponsible());
  }

  openFormStep(step: number): void {
    if (step > this.completedFormStep() + 1 || this.formStage() === 'confirmed') return;
    this.formStage.set('editing');
    this.activeFormStep.set(step);
    setTimeout(() => document.querySelector<HTMLButtonElement>(`#form-step-${step} .step-heading`)?.focus({ preventScroll: true }));
  }

  continueForm(step: number): void {
    if (step === 1) {
      if (!this.biAssetId()) {
        this.biAttempted.set(true);
        setTimeout(() => document.querySelector<HTMLElement>('#form-step-1 .field-error')?.focus());
        return;
      }
      this.completedFormStep.update((value) => Math.max(value, step));
      this.openFormStep(2);
      return;
    }
    const controlsByStep = [
      [],
      [this.requestForm.controls.scopeIds],
      [this.requestForm.controls.changeDescription, this.requestForm.controls.reason],
      [this.requestForm.controls.timing, this.requestForm.controls.priority, this.requestForm.controls.impact],
      [this.requestForm.controls.requester, this.requestForm.controls.contactFunction, this.requestForm.controls.businessArea],
    ];
    const controls = controlsByStep[step - 1] ?? [];
    controls.forEach((control) => control.markAsTouched());
    const arraysInvalid = step === 2 && !this.requestForm.controls.scopeIds.value.length;
    if (arraysInvalid || controls.some((control) => control.invalid)) {
      setTimeout(() => document.querySelector<HTMLElement>(`#form-step-${step} .field-error`)?.focus());
      return;
    }
    this.completedFormStep.update((value) => Math.max(value, step));
    if (step === 5) { this.reviewRequest(); this.activeFormStep.set(6); return; }
    this.openFormStep(step + 1);
  }

  protected scopeSummary(): string { return this.selectedTitles(this.requestForm.controls.scopeIds.value, this.reportScopes); }
  protected descriptionSummary(): string { const value = this.requestForm.controls.changeDescription.value; return value.length > 70 ? `${value.slice(0, 70)}…` : value; }
  private selectedTitles(ids: string[], items: SelectableObject[]): string { return ids.map((id) => items.find((item) => item.id === id)?.title).filter(Boolean).join(', '); }

  editRequest(): void { this.formStage.set('editing'); this.activeFormStep.set(5); setTimeout(() => document.querySelector<HTMLButtonElement>('#form-step-5 .step-heading')?.focus()); }
  confirmRequest(): void { this.formStage.set('confirmed'); setTimeout(() => document.querySelector<HTMLElement>('#confirmation-heading')?.focus()); }

  private resetRequest(): void {
    this.formStage.set('editing');
    this.reviewEntries.set([]);
    this.activeFormStep.set(1);
    this.completedFormStep.set(0);
    this.biSystemId.set('');
    this.biContainerId.set('');
    this.biAssetId.set('');
    this.biAttempted.set(false);
    this.requesterIsResponsible.set(false);
    this.requestForm.reset({ scopeIds: [], changeDescription: '', reason: '', usage: '', reference: '', timing: '', priority: 'Normal', impact: '', requester: 'Exempel beställare', contactFunction: 'Exempel kontaktfunktion', businessArea: 'Exempelteam Verksamhet', reportOwner: '' });
  }
}

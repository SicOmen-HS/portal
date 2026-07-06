import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BiObjectSelectionChange, BiObjectSelectorComponent } from '../../shared/components/bi-object-selector/bi-object-selector.component';
import { ObjectSelectorComponent, SelectableObject } from '../../shared/components/object-selector/object-selector.component';
import { OrderFormStepComponent } from '../../shared/components/order-form-step/order-form-step.component';
import { ProcessStepperComponent, ProcessStepView } from '../../shared/components/process-stepper/process-stepper.component';
import { ReviewEntry, ReviewSummaryComponent } from '../../shared/components/review-summary/review-summary.component';
import { DataCatalogService } from '../../services/data-catalog.service';
import { ReportingCatalogService } from '../../services/reporting-catalog.service';
import { SystemService } from '../../services/system.service';
import { reportingApprovalMessage } from '../../models';

/** Ett sökbart resultat/valt objekt i sök- och lägg-till-mönstret för databehov. */
interface DataReferenceOption extends SelectableObject {
  group: 'Dataprodukt' | 'Datamängd';
}

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
    requirements: ['Berörd rapport eller dashboard', 'Önskad data och användning, om känd', 'Befintlig datamängd eller dataprodukt om sådan finns'],
    prerequisites: ['Åtkomst och lämplighet behöver kontrolleras innan data kopplas in.', 'Det går bra att inte veta exakt vilken data som behövs – beskriv då behovet istället.'],
    steps: ['Välj rapport/dashboard', 'Beskriv databehovet', 'Granskning', 'Berörda godkännanden', 'Utveckling och modellering', 'Leverans'],
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
  private readonly dataCatalog = inject(DataCatalogService);
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

  // Guidat flöde för "Lägg till eller ändra data" (AN-003, AB-011). Återanvänder samma
  // BI-objektval, kollapsande steg och sammanfattningskomponent som "Ändra innehåll
  // eller utseende", men med ett eget, kortare formulär (3 steg istället för 6) – se
  // handoffen för vilka delar som medvetet dupliceras istället för att brytas ut.
  protected readonly dataProcessSteps: ProcessStepView[] = [
    { title: 'Välj rapport/dashboard', description: 'Välj den rapport eller dashboard som databehovet gäller.' },
    { title: 'Beskriv databehovet', description: 'Välj befintlig data om den finns, eller beskriv vad du behöver. Det går bra att inte veta exakt vilka fält, mått eller begrepp som krävs.' },
    { title: 'Granskning', description: 'Utvecklingsteamet och dataförvaltningen kontrollerar åtkomst, lämplighet och eventuell påverkan på befintlig data.' },
    { title: 'Berörda godkännanden', description: 'Ägaren av datan, och rapportens ansvarige om rapporten också ska ändras, godkänner innan arbetet påbörjas.' },
    { title: 'Utveckling och modellering', description: 'Om datan saknas paketeras den som en ny datamängd eller dataprodukt och kopplas därefter in.' },
    { title: 'Leverans', description: 'Du får återkoppling när kopplingen eller ändringen är klar.' },
  ];
  protected readonly dataNeedTypes: SelectableObject[] = ['Nytt mått', 'Nytt urval', 'Ny datakälla', 'Nytt dataområde', 'Annat'].map((title, index) => ({ id: `need-${index}`, title }));
  protected readonly dataStage = signal<'editing' | 'confirmed'>('editing');
  protected readonly dataActiveStep = signal(1);
  protected readonly dataCompletedStep = signal(0);
  protected readonly dataStep2Attempted = signal(false);
  protected readonly dataReviewEntries = signal<ReviewEntry[]>([]);
  protected readonly dataBiSystemId = signal('');
  protected readonly dataBiContainerId = signal('');
  protected readonly dataBiAssetId = signal('');
  protected readonly dataBiAttempted = signal(false);
  protected readonly dataRequesterIsResponsible = signal(false);
  protected readonly selectedDataBiSystem = computed(() => this.biSystems().find((system) => system.id === this.dataBiSystemId()));
  protected readonly selectedDataBiAsset = computed(() => this.biAssets().find((asset) => asset.id === this.dataBiAssetId()));

  // Befintlig data att söka bland (sök- och lägg-till-mönster, inte en permanent
  // checkbox-lista) – återanvänder redan existerande DataCatalogService/mockdata,
  // ingen ny katalog eller informationsmodell.
  private readonly informationMarts = toSignal(this.dataCatalog.getAllInformationMarts(), { initialValue: [] });
  private readonly datasets = toSignal(this.dataCatalog.getAllDatasets(), { initialValue: [] });
  private readonly combinedDataOptions = computed<DataReferenceOption[]>(() => [
    ...this.informationMarts().map((mart) => ({ id: mart.id, title: mart.name, description: mart.description, group: 'Dataprodukt' as const })),
    ...this.datasets().map((dataset) => ({ id: dataset.id, title: dataset.name, description: dataset.description, group: 'Datamängd' as const })),
  ]);
  protected readonly dataSearchQuery = signal('');
  protected readonly dataSearchResults = computed<DataReferenceOption[]>(() => {
    const query = this.dataSearchQuery().trim().toLowerCase();
    if (!query) return [];
    const selectedIds = new Set(this.dataRequestForm.controls.dataReferenceIds.value);
    return this.combinedDataOptions()
      .filter((item) => !selectedIds.has(item.id))
      .filter((item) => `${item.title} ${item.description ?? ''}`.toLowerCase().includes(query))
      .slice(0, 8);
  });
  protected readonly selectedDataReferences = computed<DataReferenceOption[]>(() => {
    const options = this.combinedDataOptions();
    return this.dataRequestForm.controls.dataReferenceIds.value
      .map((id) => options.find((item) => item.id === id))
      .filter((item): item is DataReferenceOption => !!item);
  });

  protected readonly dataRequestForm = this.formBuilder.nonNullable.group({
    needTypeIds: this.formBuilder.nonNullable.control<string[]>([], Validators.required),
    dataReferenceIds: this.formBuilder.nonNullable.control<string[]>([]),
    dataNotFound: [false],
    dataUnknown: [false],
    // Frivilligt: användaren kan ange kända fält/mått/begrepp, men ska också kunna be
    // om hjälp utan att fylla i något här.
    description: ['', Validators.minLength(10)],
    otherKnownData: [''],
    alsoUpdateReport: this.formBuilder.nonNullable.control<'ja' | 'nej' | ''>('', Validators.required),
  });
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
    if (action.id === 'data') {
      // Samma ADR-0002-princip som "Ändra innehåll eller utseende": ett eget, riktigt
      // flöde ska ha en egen route.
      this.router.navigate(['/tjanster', 'rapporter-och-dashboards', 'lagg-till-data']);
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

  onDataBiSelectionChange(change: BiObjectSelectionChange): void {
    this.dataBiSystemId.set(change.systemId);
    this.dataBiContainerId.set(change.containerId);
    this.dataBiAssetId.set(change.assetId);
  }

  protected dataBiSelectionSummary(): string {
    const asset = this.selectedDataBiAsset();
    if (!asset) return '';
    return `${this.selectedDataBiSystem()?.name ?? ''} · ${asset.name}`;
  }

  protected dataProcessInfoText(): string {
    return reportingApprovalMessage(this.selectedDataBiAsset(), this.dataRequesterIsResponsible());
  }

  protected dataNeedTypeTitles(): string {
    const ids = this.dataRequestForm.controls.needTypeIds.value;
    return ids.map((id) => this.dataNeedTypes.find((item) => item.id === id)?.title).filter(Boolean).join(', ');
  }

  private dataReferenceTitles(ids: string[]): string {
    const options = this.combinedDataOptions();
    return ids.map((id) => options.find((item) => item.id === id)?.title).filter(Boolean).join(', ');
  }

  addDataReference(id: string): void {
    const current = this.dataRequestForm.controls.dataReferenceIds.value;
    if (!current.includes(id)) {
      this.dataRequestForm.controls.dataReferenceIds.setValue([...current, id]);
    }
    this.dataSearchQuery.set('');
  }

  removeDataReference(id: string): void {
    const current = this.dataRequestForm.controls.dataReferenceIds.value;
    this.dataRequestForm.controls.dataReferenceIds.setValue(current.filter((existingId) => existingId !== id));
  }

  /** Sant om något av de fyra sätten att ange databehov är ifyllt: typ, vald befintlig data, eller markering att datan saknas/är okänd. */
  protected dataStepHasSomeInput(): boolean {
    const value = this.dataRequestForm.getRawValue();
    return value.needTypeIds.length > 0 || value.dataReferenceIds.length > 0 || value.dataNotFound || value.dataUnknown;
  }

  protected dataStep2Invalid(): boolean {
    return !this.dataStepHasSomeInput() || !this.dataRequestForm.controls.alsoUpdateReport.value || this.dataRequestForm.controls.description.invalid;
  }

  protected dataStepSummary(): string {
    const parts: string[] = [];
    const types = this.dataNeedTypeTitles();
    if (types) parts.push(types);
    const refCount = this.dataRequestForm.controls.dataReferenceIds.value.length;
    if (refCount) parts.push(`${refCount} vald${refCount > 1 ? 'a' : ''} befintlig data`);
    if (this.dataRequestForm.controls.dataUnknown.value) parts.push('Vet inte vilken data');
    if (this.dataRequestForm.controls.dataNotFound.value) parts.push('Hittar inte datan');
    return parts.join(' · ');
  }

  openDataStep(step: number): void {
    if (step > this.dataCompletedStep() + 1 || this.dataStage() === 'confirmed') return;
    this.dataActiveStep.set(step);
    setTimeout(() => document.querySelector<HTMLButtonElement>(`#data-step-${step} .step-heading`)?.focus({ preventScroll: true }));
  }

  continueDataStep(step: number): void {
    if (step === 1) {
      if (!this.dataBiAssetId()) {
        this.dataBiAttempted.set(true);
        setTimeout(() => document.querySelector<HTMLElement>('#data-step-1 .field-error')?.focus());
        return;
      }
      this.dataCompletedStep.update((value) => Math.max(value, step));
      this.openDataStep(2);
      return;
    }
    if (step === 2) {
      this.dataRequestForm.controls.description.markAsTouched();
      if (this.dataStep2Invalid()) {
        this.dataStep2Attempted.set(true);
        setTimeout(() => document.querySelector<HTMLElement>('#data-step-2 .field-error')?.focus());
        return;
      }
      this.dataCompletedStep.update((value) => Math.max(value, step));
      this.reviewDataRequest();
      this.dataActiveStep.set(3);
    }
  }

  private reviewDataRequest(): void {
    const value = this.dataRequestForm.getRawValue();
    const dataStatusParts: string[] = [];
    if (value.dataNotFound) dataStatusParts.push('Hittar inte datan som behövs');
    if (value.dataUnknown) dataStatusParts.push('Vet inte vilken data som behövs');
    this.dataReviewEntries.set([
      { label: 'Rapport/dashboard', value: this.dataBiSelectionSummary() },
      { label: 'Ansvarig', value: this.selectedDataBiAsset()?.responsibleLabel ?? '' },
      { label: 'Godkännande', value: this.dataProcessInfoText() },
      { label: 'Typ av databehov', value: this.dataNeedTypeTitles() || 'Ingen typ vald' },
      { label: 'Vald befintlig data', value: this.dataReferenceTitles(value.dataReferenceIds) || 'Ingen vald' },
      { label: 'Status för databehov', value: dataStatusParts.join(', ') || 'Ingen avvikelse angiven' },
      { label: 'Kända fält, mått eller begrepp', value: value.description || 'Inga angivna' },
      { label: 'Annan känd data', value: value.otherKnownData || 'Ingen angiven' },
      { label: 'Rapporten/dashboarden behöver också ändras', value: value.alsoUpdateReport === 'ja' ? 'Ja' : 'Nej' },
    ]);
  }

  editDataRequest(): void {
    this.dataStage.set('editing');
    this.dataActiveStep.set(3);
    setTimeout(() => document.querySelector<HTMLButtonElement>('#data-step-3 .step-heading')?.focus());
  }

  confirmDataRequest(): void {
    this.dataStage.set('confirmed');
    setTimeout(() => document.querySelector<HTMLElement>('#data-confirmation-heading')?.focus());
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

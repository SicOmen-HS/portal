import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObjectSelectorComponent, SelectableObject } from '../../shared/components/object-selector/object-selector.component';
import { OrderFormStepComponent } from '../../shared/components/order-form-step/order-form-step.component';
import { ProcessStepperComponent, ProcessStepView } from '../../shared/components/process-stepper/process-stepper.component';
import { ReviewEntry, ReviewSummaryComponent } from '../../shared/components/review-summary/review-summary.component';

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
  imports: [RouterLink, ReactiveFormsModule, ObjectSelectorComponent, OrderFormStepComponent, ProcessStepperComponent, ReviewSummaryComponent],
  templateUrl: './needs-catalog.component.html',
  styleUrl: './needs-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeedsCatalogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly injector = inject(Injector);
  protected readonly actions = ACTIONS;
  protected readonly selectedAction = signal<ServiceAction | null>(null);
  protected readonly formStage = signal<'editing' | 'review' | 'confirmed'>('editing');
  protected readonly activeFormStep = signal(1);
  protected readonly completedFormStep = signal(0);
  protected readonly reviewEntries = signal<ReviewEntry[]>([]);
  protected readonly reports: SelectableObject[] = [
    { id: 'sales', title: 'Försäljningsdashboard demo', type: 'Dashboard', meta: 'Exempelteam Försäljning', description: 'Översikt av fiktiva försäljningsvärden.' },
    { id: 'finance', title: 'Månadsrapport ekonomi demo', type: 'Rapport', meta: 'Exempelteam Ekonomi', description: 'Fiktiv ekonomisk månadsuppföljning.' },
    { id: 'customer', title: 'Kundöversikt demo', type: 'Dashboard', meta: 'Exempel kontaktfunktion Kund', description: 'Fiktiv sammanställning av kundrelaterade mått.' },
    { id: 'operations', title: 'Operativ uppföljning demo', type: 'Rapport', meta: 'Exempelteam Verksamhet', description: 'Fiktiv operativ uppföljning för flera användare.' },
  ];
  protected readonly reportScopes: SelectableObject[] = ['Översikt', 'Detaljvy', 'Filter', 'Diagram', 'Mått eller beräkning', 'Texter och rubriker', 'Layout', 'Export eller utskrift', 'Annat'].map((title, index) => ({ id: `scope-${index}`, title }));
  protected readonly changeProcessSteps: ProcessStepView[] = [
    { title: 'Välj rapport/dashboard', description: 'Välj den eller de rapporter som ändringen gäller. Samma ändring kan gälla flera lösningar.' },
    { title: 'Välj flikar eller vyer', description: 'Ange vilka delar ändringen berör, till exempel översikt, filter, diagram eller mått.' },
    { title: 'Beskriv ändring', description: 'Beskriv vad du vill ändra och varför. Ett tydligt underlag gör bedömningen enklare.' },
    { title: 'Granskning', description: 'Utvecklingsteamet kontrollerar underlaget och eventuell påverkan på data, behörighet och användare.' },
    { title: 'Återkoppling', description: 'Du får besked om begäran kan planeras eller om mer information behövs.' },
    { title: 'Planering och leverans', description: 'När underlaget är tydligt planeras arbetet enligt teamets prioritering.' },
  ];
  protected readonly requestForm = this.formBuilder.nonNullable.group({
    reportIds: this.formBuilder.nonNullable.control<string[]>([], Validators.required),
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

  selectAction(action: ServiceAction): void {
    this.selectedAction.set(action);
    this.resetRequest();
    this.scrollTopAndFocus('#selected-view', '#change-action-button');
  }

  showAllActions(): void {
    this.selectedAction.set(null);
    this.resetRequest();
    this.scrollTopAndFocus('#service-start', '#action-heading');
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
    if (this.requestForm.invalid || !this.requestForm.controls.reportIds.value.length || !this.requestForm.controls.scopeIds.value.length) {
      this.requestForm.markAllAsTouched();
      setTimeout(() => document.querySelector<HTMLElement>('.field-error')?.focus());
      return;
    }
    const value = this.requestForm.getRawValue();
    const titles = (ids: string[], items: SelectableObject[]) => ids.map((id) => items.find((item) => item.id === id)?.title).filter(Boolean).join(', ');
    this.reviewEntries.set([
      { label: 'Vald åtgärd', value: 'Ändra innehåll eller utseende' },
      { label: 'Rapporter/dashboards', value: titles(value.reportIds, this.reports) },
      { label: 'Berörda delar', value: titles(value.scopeIds, this.reportScopes) },
      { label: 'Vad vill du ändra?', value: value.changeDescription },
      { label: 'Varför?', value: value.reason },
      { label: 'Hur används resultatet?', value: value.usage },
      { label: 'Tidpunkt, prioritet och påverkan', value: `${value.timing} · ${value.priority} · ${value.impact}` },
      { label: 'Kontakt och ansvar', value: `${value.requester} · ${value.contactFunction}\n${value.businessArea}${value.reportOwner ? ` · Ägare: ${value.reportOwner}` : ''}` },
    ]);
  }

  openFormStep(step: number): void {
    if (step > this.completedFormStep() + 1 || this.formStage() === 'confirmed') return;
    this.formStage.set('editing');
    this.activeFormStep.set(step);
    setTimeout(() => document.querySelector<HTMLButtonElement>(`#form-step-${step} .step-heading`)?.focus({ preventScroll: true }));
  }

  continueForm(step: number): void {
    const controlsByStep = [
      [this.requestForm.controls.reportIds],
      [this.requestForm.controls.scopeIds],
      [this.requestForm.controls.changeDescription, this.requestForm.controls.reason],
      [this.requestForm.controls.timing, this.requestForm.controls.priority, this.requestForm.controls.impact],
      [this.requestForm.controls.requester, this.requestForm.controls.contactFunction, this.requestForm.controls.businessArea],
    ];
    const controls = controlsByStep[step - 1] ?? [];
    controls.forEach((control) => control.markAsTouched());
    const arraysInvalid = step === 1 && !this.requestForm.controls.reportIds.value.length || step === 2 && !this.requestForm.controls.scopeIds.value.length;
    if (arraysInvalid || controls.some((control) => control.invalid)) {
      setTimeout(() => document.querySelector<HTMLElement>(`#form-step-${step} .field-error`)?.focus());
      return;
    }
    this.completedFormStep.update((value) => Math.max(value, step));
    if (step === 5) { this.reviewRequest(); this.activeFormStep.set(6); return; }
    this.openFormStep(step + 1);
  }

  protected reportSummary(): string { return this.selectedTitles(this.requestForm.controls.reportIds.value, this.reports); }
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
    this.requestForm.reset({ reportIds: [], scopeIds: [], changeDescription: '', reason: '', usage: '', reference: '', timing: '', priority: 'Normal', impact: '', requester: 'Exempel beställare', contactFunction: 'Exempel kontaktfunktion', businessArea: 'Exempelteam Verksamhet', reportOwner: '' });
  }
}

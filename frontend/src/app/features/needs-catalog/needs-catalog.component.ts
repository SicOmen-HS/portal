import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink],
  templateUrl: './needs-catalog.component.html',
  styleUrl: './needs-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeedsCatalogComponent {
  protected readonly actions = ACTIONS;
  protected readonly selectedAction = signal<ServiceAction | null>(null);
  protected readonly submitted = signal(false);
  protected readonly reports = ['Försäljningsdashboard demo', 'Månadsrapport ekonomi demo', 'Kundöversikt demo', 'Operativ uppföljning demo'];
  protected readonly reportParts = ['Översikt', 'Detaljvy', 'Filter', 'Diagram', 'Mått', 'Texter', 'Behörighet'];

  selectAction(action: ServiceAction): void {
    this.selectedAction.set(action);
    this.submitted.set(false);
    setTimeout(() => {
      const backButton = document.querySelector<HTMLButtonElement>('#change-action-button');
      backButton?.focus({ preventScroll: true });
      document.querySelector<HTMLElement>('#selected-view')?.scrollIntoView({ block: 'start' });
    });
  }

  showAllActions(): void {
    this.selectedAction.set(null);
    this.submitted.set(false);
    setTimeout(() => {
      const heading = document.querySelector<HTMLElement>('#action-heading');
      heading?.focus({ preventScroll: true });
      document.querySelector<HTMLElement>('#service-start')?.scrollIntoView({ block: 'start' });
    });
  }

  submitMock(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
  }
}

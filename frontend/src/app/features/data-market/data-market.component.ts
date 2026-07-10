import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DataCatalogService } from '../../services/data-catalog.service';
import { DataMarketExplorerComponent } from './data-market-explorer.component';

interface DataMarketAction {
  title: string;
  description: string;
  icon: string;
  link?: string[];
  linkLabel: string;
  note?: string;
}

const ACTIONS: DataMarketAction[] = [
  { title: 'Utforska data', description: 'Sök bland dataprodukter och datamängder och förstå vad de innehåller.', icon: 'bi-search', link: ['/data'], linkLabel: 'Öppna Data & katalog' },
  { title: 'Begär åtkomst till data', description: 'Se förutsättningar och starta en ansökan om åtkomst till ett dataunderlag.', icon: 'bi-key', link: ['/bestall', 'order-type-access-group'], linkLabel: 'Visa åtkomstflöde' },
  { title: 'Förstå datakvalitet och styrning', description: 'Granska ägarskap, kvalitetssignaler, klassning och aktualitet för en dataprodukt.', icon: 'bi-shield-check', link: ['/data'], linkLabel: 'Utforska dataprodukter', note: 'Välj en dataprodukt för att se kvalitet och styrning.' },
  { title: 'Skapa eller förändra dataunderlag', description: 'Initiera en ny datamängd eller ett nytt dataunderlag – till exempel genom att kombinera flera befintliga datamängder – eller beskriv en förändring av befintlig data.', icon: 'bi-database-add', link: ['/bestall', 'order-type-change-dataset'], linkLabel: 'Beskriv dataförändring', note: 'Ny datamängd finns också i beställningskatalogen.' },
  { title: 'Använd data i rapport eller dashboard', description: 'Använd en eller flera datamängder eller dataprodukter i en rapport eller dashboard – gå vidare till tjänsten Rapporter och dashboards med ditt rapportbehov.', icon: 'bi-bar-chart-line', link: ['/tjanster', 'rapporter-och-dashboards', 'skapa-ny-rapport-dashboard'], linkLabel: 'Skapa rapport eller dashboard' },
  { title: 'Hantera behörighet och ansvar', description: 'Ändra åtkomst, ansvarig funktion eller kontaktväg för ett dataobjekt.', icon: 'bi-person-lock', link: ['/tjanster', 'datamarknad', 'behorighet-och-ansvar'], linkLabel: 'Hantera behörighet och ansvar' },
];

@Component({
  selector: 'app-data-market',
  imports: [RouterLink, DataMarketExplorerComponent],
  templateUrl: './data-market.component.html',
  styleUrl: './data-market.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataMarketComponent {
  private readonly dataCatalog = inject(DataCatalogService);
  protected readonly actions = ACTIONS;
  private readonly datasets = toSignal(this.dataCatalog.getAllDatasets(), { initialValue: [] });
  private readonly dataProducts = toSignal(this.dataCatalog.getAllInformationMarts(), { initialValue: [] });
  private readonly dataServices = toSignal(this.dataCatalog.getAllDataServices(), { initialValue: [] });
  protected readonly catalogSummary = computed(() => [
    { value: this.dataProducts().length, label: 'dataprodukter' },
    { value: this.datasets().length, label: 'datamängder' },
    { value: this.dataServices().length, label: 'datatjänster' },
  ]);
}

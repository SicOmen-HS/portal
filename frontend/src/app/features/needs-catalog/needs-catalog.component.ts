import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NeedResource {
  type: string;
  title: string;
  description: string;
  signal: string;
  routerLink: string[];
}

@Component({
  selector: 'app-needs-catalog',
  imports: [RouterLink],
  templateUrl: './needs-catalog.component.html',
  styleUrl: './needs-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeedsCatalogComponent {
  protected readonly viewMode = signal<'list' | 'cards'>('list');
  protected readonly selectedTypes = signal<string[]>([]);
  protected readonly filterTypes = ['Tjänst', 'Datamängd', 'Dataprodukt', 'Guide', 'Beställning'];
  protected readonly resources: NeedResource[] = [
    { type: 'Tjänst', title: 'Skapa visualisering och rapport', description: 'Få stöd från idé och dataval till en användbar rapport.', signal: 'Rekommenderad start', routerLink: ['/tjanster', 'service-order-dashboard'] },
    { type: 'Datamängd', title: 'Exempel Försäljningstransaktioner', description: 'Fiktiv datamängd för rapportering på övergripande nivå.', signal: 'Åtkomst krävs', routerLink: ['/data', 'dataset-sales-transactions-demo'] },
    { type: 'Dataprodukt', title: 'Försäljning – kund och order', description: 'Ägd och dokumenterad dataprodukt för stabil rapportering.', signal: 'Verifierad', routerLink: ['/data/dataprodukt', 'mart-sales-demo'] },
    { type: 'Guide', title: 'Kom igång med rapportering', description: 'Förstå arbetssätt, roller och vad du behöver förbereda.', signal: '5 min läsning', routerLink: ['/guider'] },
    { type: 'Beställning', title: 'Ny BI-tillämpning', description: 'Beställ en ny dashboard eller rapport med tydliga steg.', signal: '5 steg', routerLink: ['/bestall', 'order-type-new-bi-app'] },
  ];

  protected readonly filteredResources = computed(() => {
    const types = this.selectedTypes();
    return types.length ? this.resources.filter((resource) => types.includes(resource.type)) : this.resources;
  });

  toggleType(type: string, checked: boolean): void {
    this.selectedTypes.update((types) => checked ? [...types, type] : types.filter((value) => value !== type));
  }
}

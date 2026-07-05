import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DataCatalogService } from './data-catalog.service';
import { GuideService } from './guide.service';
import { OrderService } from './order.service';
import { SearchResultItem, SearchService } from './search.service';
import { ServiceOfferingService } from './service-offering.service';
import { SystemService } from './system.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: ServiceOfferingService, useValue: { getAll: () => of([]) } },
        { provide: SystemService, useValue: { getAll: () => of([]), getAllLinks: () => of([]) } },
        { provide: GuideService, useValue: { getAll: () => of([]) } },
        { provide: OrderService, useValue: { getAllOrderTypes: () => of([]) } },
        {
          provide: DataCatalogService,
          useValue: {
            getAllDatasets: () => of([]),
            getAllInformationMarts: () => of([]),
            getAllBusinessApplications: () => of([]),
          },
        },
      ],
    });
    service = TestBed.inject(SearchService);
  });

  it('ranks results matching more words before partial matches', () => {
    const results: SearchResultItem[] = [
      {
        id: 'system-demo', title: 'Exempelsystem', description: 'Skapa rapporter', type: 'System',
        category: 'Verktyg', routerLink: ['/system'], signals: [], owner: 'Exempelteam', access: 'Åtkomst kan krävas',
        accessCategory: 'Åtkomst krävs', lifecycleStatus: 'active', freshness: 'Aktiv',
        relatedGuides: [], relatedOrders: [], relatedSystems: [],
      },
      {
        id: 'dataset-demo', title: 'Försäljningstransaktioner',
        description: 'Underlag för rapportering', type: 'Datamängd', category: 'Försäljning',
        routerLink: ['/data', 'dataset-demo'],
        signals: ['Verifierad'], owner: 'Exempelteam', access: 'Åtkomst krävs',
        accessCategory: 'Åtkomst krävs', lifecycleStatus: 'active', freshness: 'Dagligen',
        relatedGuides: [], relatedOrders: [], relatedSystems: [],
      },
    ];

    expect(service.rank(results, 'rapport försäljning').map((item) => item.id)).toEqual([
      'dataset-demo',
      'system-demo',
    ]);
  });
});

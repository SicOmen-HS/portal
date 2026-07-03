import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ServiceOfferingService } from './service-offering.service';
import { SystemService } from './system.service';
import { GuideService } from './guide.service';
import { DataCatalogService } from './data-catalog.service';

export type SearchResultType = 'Tjänst' | 'System' | 'Guide' | 'Datamängd';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: SearchResultType;
  routerLink: string[];
}

/**
 * Sammanställer sökbara objekt från flera informationsobjekt så att
 * startsidans och headerns sökfunktion kan söka över hela portalen
 * (docs/12_Designsystem_och_UI.md: "Sök ska vara en central funktion").
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly serviceOfferings = inject(ServiceOfferingService);
  private readonly systems = inject(SystemService);
  private readonly guides = inject(GuideService);
  private readonly dataCatalog = inject(DataCatalogService);

  private readonly index$: Observable<SearchResultItem[]> = combineLatest([
    this.serviceOfferings.getAll(),
    this.systems.getAll(),
    this.guides.getAll(),
    this.dataCatalog.getAllDatasets(),
  ]).pipe(
    map(([services, systems, guides, datasets]) => [
      ...services.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.shortDescription,
          type: 'Tjänst',
          routerLink: ['/tjanster', item.id],
        })
      ),
      ...systems.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'System',
          routerLink: ['/system'],
        })
      ),
      ...guides.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: 'Guide',
          routerLink: ['/guider'],
        })
      ),
      ...datasets.map(
        (item): SearchResultItem => ({
          id: item.id,
          title: item.name,
          description: item.description,
          type: 'Datamängd',
          routerLink: ['/data'],
        })
      ),
    ])
  );

  search(query: string): Observable<SearchResultItem[]> {
    const normalized = query.trim().toLowerCase();
    return this.index$.pipe(
      map((items) =>
        normalized.length === 0
          ? []
          : items.filter(
              (item) =>
                item.title.toLowerCase().includes(normalized) ||
                item.description.toLowerCase().includes(normalized)
            )
      )
    );
  }
}

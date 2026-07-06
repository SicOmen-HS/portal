import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { ReportingAsset, ReportingContainer } from '../models';

/**
 * Läser den generiska BI-objektmodellens första, avgränsade steg
 * (ReportingContainer/ReportingAsset) från mockdata – se
 * docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md.
 */
@Injectable({ providedIn: 'root' })
export class ReportingCatalogService {
  private readonly mockData = inject(MockDataService);

  private readonly containers$: Observable<ReportingContainer[]> = this.mockData
    .load<ReportingContainer[]>('reporting-containers.mock.json')
    .pipe(shareReplay(1));

  private readonly assets$: Observable<ReportingAsset[]> = this.mockData
    .load<ReportingAsset[]>('reporting-assets.mock.json')
    .pipe(shareReplay(1));

  getContainers(): Observable<ReportingContainer[]> {
    return this.containers$;
  }

  getAssets(): Observable<ReportingAsset[]> {
    return this.assets$;
  }

  getContainersBySystem(systemId: string): Observable<ReportingContainer[]> {
    return this.containers$.pipe(map((items) => items.filter((item) => item.systemId === systemId)));
  }

  getAssetsByContainer(containerId: string): Observable<ReportingAsset[]> {
    return this.assets$.pipe(map((items) => items.filter((item) => item.containerId === containerId)));
  }
}

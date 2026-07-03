import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { SystemEntity, SystemLink } from '../models';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly mockData = inject(MockDataService);

  private readonly systems$: Observable<SystemEntity[]> = this.mockData
    .load<SystemEntity[]>('systems.mock.json')
    .pipe(shareReplay(1));

  private readonly links$: Observable<SystemLink[]> = this.mockData
    .load<SystemLink[]>('system-links.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<SystemEntity[]> {
    return this.systems$;
  }

  getById(id: string): Observable<SystemEntity | undefined> {
    return this.systems$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getByIds(ids: string[]): Observable<SystemEntity[]> {
    return this.systems$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }

  getAllLinks(): Observable<SystemLink[]> {
    return this.links$;
  }

  getLinksForSystem(systemId: string): Observable<SystemLink[]> {
    return this.links$.pipe(map((items) => items.filter((link) => link.relatedSystemId === systemId)));
  }

  getLinksByIds(ids: string[]): Observable<SystemLink[]> {
    return this.links$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }
}

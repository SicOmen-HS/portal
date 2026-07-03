import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { Guide } from '../models';

@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly mockData = inject(MockDataService);

  private readonly guides$: Observable<Guide[]> = this.mockData
    .load<Guide[]>('guides.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Guide[]> {
    return this.guides$;
  }

  getById(id: string): Observable<Guide | undefined> {
    return this.guides$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getByIds(ids: string[]): Observable<Guide[]> {
    return this.guides$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }

  getForService(serviceId: string): Observable<Guide[]> {
    return this.guides$.pipe(
      map((items) => items.filter((item) => item.relatedServiceIds?.includes(serviceId)))
    );
  }

  getForSystem(systemId: string): Observable<Guide[]> {
    return this.guides$.pipe(
      map((items) => items.filter((item) => item.relatedSystemIds?.includes(systemId)))
    );
  }
}

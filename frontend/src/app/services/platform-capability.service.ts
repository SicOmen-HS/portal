import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { PlatformCapability } from '../models';

@Injectable({ providedIn: 'root' })
export class PlatformCapabilityService {
  private readonly mockData = inject(MockDataService);

  private readonly platforms$: Observable<PlatformCapability[]> = this.mockData
    .load<PlatformCapability[]>('platforms.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<PlatformCapability[]> {
    return this.platforms$;
  }

  getById(id: string): Observable<PlatformCapability | undefined> {
    return this.platforms$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getByIds(ids: string[]): Observable<PlatformCapability[]> {
    return this.platforms$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }
}

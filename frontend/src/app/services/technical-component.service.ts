import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { TechnicalComponent } from '../models';

@Injectable({ providedIn: 'root' })
export class TechnicalComponentService {
  private readonly mockData = inject(MockDataService);

  private readonly components$: Observable<TechnicalComponent[]> = this.mockData
    .load<TechnicalComponent[]>('technical-components.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<TechnicalComponent[]> {
    return this.components$;
  }

  getByIds(ids: string[]): Observable<TechnicalComponent[]> {
    return this.components$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }
}

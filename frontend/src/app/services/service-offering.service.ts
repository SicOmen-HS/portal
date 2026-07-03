import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { ServiceOffering } from '../models';

@Injectable({ providedIn: 'root' })
export class ServiceOfferingService {
  private readonly mockData = inject(MockDataService);

  private readonly services$: Observable<ServiceOffering[]> = this.mockData
    .load<ServiceOffering[]>('services.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<ServiceOffering[]> {
    return this.services$;
  }

  getFeatured(): Observable<ServiceOffering[]> {
    return this.services$.pipe(map((items) => items.filter((item) => item.featured)));
  }

  getById(id: string): Observable<ServiceOffering | undefined> {
    return this.services$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getByIds(ids: string[]): Observable<ServiceOffering[]> {
    return this.services$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }
}

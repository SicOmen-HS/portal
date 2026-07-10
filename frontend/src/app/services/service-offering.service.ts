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

  /**
   * Exkluderar tjänster med visibility 'hidden', t.ex. konsoliderade tjänster
   * som ersatts av en annan canonical tjänst (se AN-008/AB-021). getById och
   * getByIds filtrerar inte på visibility, så tidigare nåbara direktlänkar
   * fortsätter fungera oförändrat.
   */
  getAll(): Observable<ServiceOffering[]> {
    return this.services$.pipe(map((items) => items.filter((item) => item.visibility !== 'hidden')));
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

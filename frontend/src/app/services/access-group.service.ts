import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { AccessGroup, MonitoringSubscription } from '../models';

@Injectable({ providedIn: 'root' })
export class AccessGroupService {
  private readonly mockData = inject(MockDataService);

  private readonly accessGroups$: Observable<AccessGroup[]> = this.mockData
    .load<AccessGroup[]>('access-groups.mock.json')
    .pipe(shareReplay(1));

  private readonly monitoringSubscriptions$: Observable<MonitoringSubscription[]> = this.mockData
    .load<MonitoringSubscription[]>('monitoring-subscriptions.mock.json')
    .pipe(shareReplay(1));

  getAllAccessGroups(): Observable<AccessGroup[]> {
    return this.accessGroups$;
  }

  getAccessGroupsByIds(ids: string[]): Observable<AccessGroup[]> {
    return this.accessGroups$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }

  getMonitoringSubscriptionsForMart(informationMartId: string): Observable<MonitoringSubscription[]> {
    return this.monitoringSubscriptions$.pipe(
      map((items) => items.filter((item) => item.relatedInformationMartId === informationMartId))
    );
  }
}

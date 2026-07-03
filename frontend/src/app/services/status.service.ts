import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { StatusItem } from '../models';

export interface OverallStatus {
  operational: boolean;
  headline: string;
  description: string;
  lastUpdated: string;
}

export interface StatusOverview {
  overall: OverallStatus;
  items: StatusItem[];
}

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly mockData = inject(MockDataService);

  private readonly status$: Observable<StatusOverview> = this.mockData
    .load<StatusOverview>('status.mock.json')
    .pipe(shareReplay(1));

  getStatus(): Observable<StatusOverview> {
    return this.status$;
  }
}

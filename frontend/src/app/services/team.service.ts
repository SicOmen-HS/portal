import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { Team } from '../models';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly mockData = inject(MockDataService);

  private readonly teams$: Observable<Team[]> = this.mockData
    .load<Team[]>('teams.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Team[]> {
    return this.teams$;
  }

  getById(id: string): Observable<Team | undefined> {
    return this.teams$.pipe(map((items) => items.find((item) => item.id === id)));
  }
}

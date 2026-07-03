import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { ContactPoint } from '../models';

@Injectable({ providedIn: 'root' })
export class ContactPointService {
  private readonly mockData = inject(MockDataService);

  private readonly contacts$: Observable<ContactPoint[]> = this.mockData
    .load<ContactPoint[]>('contacts.mock.json')
    .pipe(shareReplay(1));

  getAll(): Observable<ContactPoint[]> {
    return this.contacts$;
  }

  getById(id: string): Observable<ContactPoint | undefined> {
    return this.contacts$.pipe(map((items) => items.find((item) => item.id === id)));
  }
}

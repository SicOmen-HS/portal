import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import { OrderFlow, OrderType } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly mockData = inject(MockDataService);

  private readonly orderTypes$: Observable<OrderType[]> = this.mockData
    .load<OrderType[]>('order-types.mock.json')
    .pipe(shareReplay(1));

  private readonly orderFlows$: Observable<OrderFlow[]> = this.mockData
    .load<OrderFlow[]>('order-flows.mock.json')
    .pipe(shareReplay(1));

  getAllOrderTypes(): Observable<OrderType[]> {
    return this.orderTypes$;
  }

  getOrderTypeById(id: string): Observable<OrderType | undefined> {
    return this.orderTypes$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getOrderTypesByIds(ids: string[]): Observable<OrderType[]> {
    return this.orderTypes$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }

  getOrderFlowById(id: string): Observable<OrderFlow | undefined> {
    return this.orderFlows$.pipe(map((items) => items.find((item) => item.id === id)));
  }
}

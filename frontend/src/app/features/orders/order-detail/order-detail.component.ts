import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OrderService } from '../../../services/order.service';
import { ServiceOfferingService } from '../../../services/service-offering.service';
import { FULFILLMENT_MODE_LABELS, ORDER_STEP_EXECUTION_MODE_LABELS } from '../../../models';

@Component({
  selector: 'app-order-detail',
  imports: [AsyncPipe, RouterLink, EmptyStateComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly serviceOfferings = inject(ServiceOfferingService);

  protected readonly fulfillmentLabels = FULFILLMENT_MODE_LABELS;
  protected readonly stepModeLabels = ORDER_STEP_EXECUTION_MODE_LABELS;

  private readonly id$ = this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));

  protected readonly orderType = toSignal(
    this.id$.pipe(switchMap((id) => this.orderService.getOrderTypeById(id))),
    { initialValue: undefined }
  );

  protected readonly orderFlow$ = this.id$.pipe(
    switchMap((id) => this.orderService.getOrderTypeById(id)),
    switchMap((orderType) =>
      orderType ? this.orderService.getOrderFlowById(orderType.orderFlowId) : of(undefined)
    )
  );

  protected readonly relatedService$ = this.id$.pipe(
    switchMap((id) => this.orderService.getOrderTypeById(id)),
    switchMap((orderType) =>
      orderType?.relatedServiceId
        ? this.serviceOfferings.getById(orderType.relatedServiceId)
        : of(undefined)
    )
  );
}

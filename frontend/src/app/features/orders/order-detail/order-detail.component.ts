import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ContactCardComponent } from '../../../shared/components/contact-card/contact-card.component';
import { OrderService } from '../../../services/order.service';
import { ServiceOfferingService } from '../../../services/service-offering.service';
import { TeamService } from '../../../services/team.service';
import { ContactPointService } from '../../../services/contact-point.service';
import { FULFILLMENT_MODE_LABELS, ORDER_STEP_EXECUTION_MODE_LABELS } from '../../../models';
import { SystemUrlService } from '../../../core/links/system-url.service';

@Component({
  selector: 'app-order-detail',
  imports: [AsyncPipe, RouterLink, EmptyStateComponent, ContactCardComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly serviceOfferings = inject(ServiceOfferingService);
  private readonly teams = inject(TeamService);
  private readonly contacts = inject(ContactPointService);
  // Injiceras direkt i templaten (protected) för att slå upp documentationUrlKey/linkKey.
  protected readonly systemUrlService = inject(SystemUrlService);

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

  protected readonly ownerTeam$ = this.id$.pipe(
    switchMap((id) => this.orderService.getOrderTypeById(id)),
    switchMap((orderType) => (orderType?.ownerTeamId ? this.teams.getById(orderType.ownerTeamId) : of(undefined)))
  );

  protected readonly responsibleContact$ = this.ownerTeam$.pipe(
    switchMap((team) => (team?.contactPointId ? this.contacts.getById(team.contactPointId) : of(undefined)))
  );
}

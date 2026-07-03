import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { switchMap, of, map } from 'rxjs';
import { LifecycleBadgeComponent } from '../../../shared/components/lifecycle-badge/lifecycle-badge.component';
import { GuideCardComponent } from '../../../shared/components/guide-card/guide-card.component';
import { OrderCardComponent } from '../../../shared/components/order-card/order-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ServiceOfferingService } from '../../../services/service-offering.service';
import { PlatformCapabilityService } from '../../../services/platform-capability.service';
import { SystemService } from '../../../services/system.service';
import { GuideService } from '../../../services/guide.service';
import { OrderService } from '../../../services/order.service';
import { ContactPointService } from '../../../services/contact-point.service';
import { TechnicalComponentService } from '../../../services/technical-component.service';
import { VISIBILITY_LABELS } from '../../../models';

@Component({
  selector: 'app-service-detail',
  imports: [
    AsyncPipe,
    RouterLink,
    LifecycleBadgeComponent,
    GuideCardComponent,
    OrderCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly serviceOfferings = inject(ServiceOfferingService);
  private readonly platforms = inject(PlatformCapabilityService);
  private readonly systems = inject(SystemService);
  private readonly guides = inject(GuideService);
  private readonly orders = inject(OrderService);
  private readonly contacts = inject(ContactPointService);
  private readonly technicalComponents = inject(TechnicalComponentService);

  protected readonly visibilityLabels = VISIBILITY_LABELS;

  private readonly id$ = this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));

  protected readonly service = toSignal(
    this.id$.pipe(switchMap((id) => this.serviceOfferings.getById(id))),
    { initialValue: undefined }
  );

  protected readonly platforms$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) => (service ? this.platforms.getByIds(service.platformCapabilityIds) : of([])))
  );
  protected readonly relatedSystems$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) => (service ? this.systems.getByIds(service.relatedSystemIds) : of([])))
  );
  protected readonly relatedGuides$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) => (service ? this.guides.getByIds(service.guideIds) : of([])))
  );
  protected readonly relatedOrderTypes$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) => (service ? this.orders.getOrderTypesByIds(service.orderTypeIds) : of([])))
  );
  protected readonly contact$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) =>
      service?.contactPointId ? this.contacts.getById(service.contactPointId) : of(undefined)
    )
  );
  protected readonly technicalComponents$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) =>
      service ? this.technicalComponents.getByIds(service.technicalComponentIds) : of([])
    )
  );

  protected readonly relatedServices$ = this.id$.pipe(
    switchMap((id) => this.serviceOfferings.getById(id)),
    switchMap((service) =>
      service?.relatedServiceIds && service.relatedServiceIds.length > 0
        ? this.serviceOfferings.getByIds(service.relatedServiceIds)
        : of([])
    )
  );
}

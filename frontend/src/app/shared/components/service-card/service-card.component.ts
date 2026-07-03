import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceOffering } from '../../../models';
import { getCategoryIcon } from '../../utils/category-icon.util';
import { LifecycleBadgeComponent } from '../lifecycle-badge/lifecycle-badge.component';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, LifecycleBadgeComponent],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCardComponent {
  readonly service = input.required<ServiceOffering>();

  protected readonly icon = computed(() => getCategoryIcon(this.service().category));
}

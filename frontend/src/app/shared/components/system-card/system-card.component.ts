import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SystemEntity, SystemLink } from '../../../models';
import { LifecycleBadgeComponent } from '../lifecycle-badge/lifecycle-badge.component';

@Component({
  selector: 'app-system-card',
  imports: [LifecycleBadgeComponent],
  templateUrl: './system-card.component.html',
  styleUrl: './system-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemCardComponent {
  readonly system = input.required<SystemEntity>();
  readonly primaryLink = input<SystemLink | undefined>(undefined);
}

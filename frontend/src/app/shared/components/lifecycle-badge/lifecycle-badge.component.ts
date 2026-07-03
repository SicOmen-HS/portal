import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  LIFECYCLE_STATUS_LABELS,
  LIFECYCLE_STATUS_TONE,
  LifecycleStatus,
} from '../../../models';

@Component({
  selector: 'app-lifecycle-badge',
  imports: [NgClass],
  templateUrl: './lifecycle-badge.component.html',
  styleUrl: './lifecycle-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleBadgeComponent {
  readonly status = input.required<LifecycleStatus>();

  protected readonly label = computed(() => LIFECYCLE_STATUS_LABELS[this.status()]);
  protected readonly tone = computed(() => LIFECYCLE_STATUS_TONE[this.status()]);
}

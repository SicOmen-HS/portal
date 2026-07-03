import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type StatusBadgeTone = 'success' | 'info' | 'warning' | 'neutral' | 'danger';

const ICON_BY_TONE: Record<StatusBadgeTone, string> = {
  success: 'bi-check-circle-fill',
  info: 'bi-info-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  danger: 'bi-x-octagon-fill',
  neutral: 'bi-dash-circle',
};

/**
 * Generisk statusindikator. Visar alltid färg tillsammans med text och ikon,
 * eftersom färg inte får vara enda informationsbäraren (docs/12_Designsystem_och_UI.md).
 */
@Component({
  selector: 'app-status-badge',
  imports: [NgClass],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly tone = input.required<StatusBadgeTone>();
  readonly label = input.required<string>();

  protected readonly icon = computed(() => ICON_BY_TONE[this.tone()]);
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusService } from '../../services/status.service';
import { STATUS_SEVERITY_LABELS, STATUS_TYPE_LABELS, StatusType } from '../../models';

const STATUS_TYPE_TONE: Record<StatusType, StatusBadgeTone> = {
  incident: 'danger',
  maintenance: 'warning',
  informational: 'info',
  resolved: 'success',
};

@Component({
  selector: 'app-status-page',
  imports: [PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, DatePipe],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPageComponent {
  private readonly statusService = inject(StatusService);

  protected readonly statusOverview = toSignal(this.statusService.getStatus(), { initialValue: undefined });
  protected readonly typeLabels = STATUS_TYPE_LABELS;
  protected readonly severityLabels = STATUS_SEVERITY_LABELS;
  protected readonly typeTone = STATUS_TYPE_TONE;

  protected readonly activeItems = computed(
    () => this.statusOverview()?.items.filter((item) => item.statusType !== 'resolved') ?? []
  );
  protected readonly historyItems = computed(
    () => this.statusOverview()?.items.filter((item) => item.statusType === 'resolved') ?? []
  );
}

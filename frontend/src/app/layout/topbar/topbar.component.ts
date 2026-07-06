import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent, StatusBadgeTone } from '../../shared/components/status-badge/status-badge.component';

interface OpsDemoState {
  tone: StatusBadgeTone;
  message: string;
  /** Om läget ska länka vidare till statussidan ("· Läs mer"). */
  linked: boolean;
}

/**
 * Mockade driftlägen för topbarens statusindikator. Ingen riktig
 * driftstatusintegration finns ännu (docs/03_Informationsmodell.md: StatusItem),
 * så demoläget cyklas lokalt i komponenten via `cycleDemoStatus()`.
 */
const OPS_DEMO_STATES: readonly OpsDemoState[] = [
  { tone: 'success', message: 'Driftstatus: Normal', linked: false },
  { tone: 'warning', message: 'Planerat underhåll · Läs mer', linked: true },
  { tone: 'danger', message: 'Störning påverkar rapporter · Läs mer', linked: true },
];

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  readonly menuToggle = output<void>();

  private readonly demoIndex = signal(0);
  protected readonly opsStatus = computed(() => OPS_DEMO_STATES[this.demoIndex()]);

  cycleDemoStatus(): void {
    this.demoIndex.update((index) => (index + 1) % OPS_DEMO_STATES.length);
  }
}

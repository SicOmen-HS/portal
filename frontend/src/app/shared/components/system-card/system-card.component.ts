import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SystemEntity, SystemLink } from '../../../models';
import { LifecycleBadgeComponent } from '../lifecycle-badge/lifecycle-badge.component';
import { SystemUrlService } from '../../../core/links/system-url.service';

@Component({
  selector: 'app-system-card',
  imports: [LifecycleBadgeComponent],
  templateUrl: './system-card.component.html',
  styleUrl: './system-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemCardComponent {
  private readonly systemUrlService = inject(SystemUrlService);

  readonly system = input.required<SystemEntity>();
  readonly primaryLink = input<SystemLink | undefined>(undefined);

  // Komponenten känner bara till länkens urlKey, aldrig en faktisk URL.
  // SystemUrlService slår upp den riktiga adressen i runtime-konfigurationen.
  protected readonly resolvedUrl = computed(() =>
    this.systemUrlService.getUrl(this.primaryLink()?.urlKey)
  );
  protected readonly isLinkConfigured = computed(() =>
    this.systemUrlService.isConfigured(this.primaryLink()?.urlKey)
  );
}

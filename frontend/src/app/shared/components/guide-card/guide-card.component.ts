import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { GUIDE_TYPE_LABELS, Guide } from '../../../models';
import { SystemUrlService } from '../../../core/links/system-url.service';

@Component({
  selector: 'app-guide-card',
  templateUrl: './guide-card.component.html',
  styleUrl: './guide-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideCardComponent {
  private readonly systemUrlService = inject(SystemUrlService);

  readonly guide = input.required<Guide>();
  protected readonly guideTypeLabels = GUIDE_TYPE_LABELS;

  // Guiden pekar på en documentationUrlKey, inte en URL – se SystemUrlService.
  protected readonly documentationUrl = computed(() =>
    this.systemUrlService.getUrl(this.guide().documentationUrlKey)
  );
}

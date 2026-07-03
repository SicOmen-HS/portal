import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GUIDE_TYPE_LABELS, Guide } from '../../../models';

@Component({
  selector: 'app-guide-card',
  templateUrl: './guide-card.component.html',
  styleUrl: './guide-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideCardComponent {
  readonly guide = input.required<Guide>();
  protected readonly guideTypeLabels = GUIDE_TYPE_LABELS;
}

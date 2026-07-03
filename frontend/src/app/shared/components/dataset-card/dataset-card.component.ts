import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DATA_CLASSIFICATION_LABELS, Dataset } from '../../../models';
import { LifecycleBadgeComponent } from '../lifecycle-badge/lifecycle-badge.component';

@Component({
  selector: 'app-dataset-card',
  imports: [LifecycleBadgeComponent],
  templateUrl: './dataset-card.component.html',
  styleUrl: './dataset-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetCardComponent {
  readonly dataset = input.required<Dataset>();
  protected readonly classificationLabels = DATA_CLASSIFICATION_LABELS;
}

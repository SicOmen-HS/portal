import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { INFORMATION_SECURITY_CLASSIFICATION_LABELS, Dataset } from '../../../models';
import { LifecycleBadgeComponent } from '../lifecycle-badge/lifecycle-badge.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dataset-card',
  imports: [LifecycleBadgeComponent, RouterLink],
  templateUrl: './dataset-card.component.html',
  styleUrl: './dataset-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetCardComponent {
  readonly dataset = input.required<Dataset>();
  protected readonly classificationLabels = INFORMATION_SECURITY_CLASSIFICATION_LABELS;
}

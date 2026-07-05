import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SearchResultItem } from '../../../services/search.service';

@Component({
  selector: 'app-typed-result-card',
  imports: [],
  templateUrl: './typed-result-card.component.html',
  styleUrl: './typed-result-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypedResultCardComponent {
  readonly item = input.required<SearchResultItem>();
  readonly selected = input(false);
  readonly previewRequested = output<SearchResultItem>();
}

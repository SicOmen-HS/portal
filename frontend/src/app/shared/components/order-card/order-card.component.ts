import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FULFILLMENT_MODE_LABELS, OrderType } from '../../../models';
import { getCategoryIcon } from '../../utils/category-icon.util';

@Component({
  selector: 'app-order-card',
  imports: [RouterLink],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  readonly orderType = input.required<OrderType>();
  protected readonly fulfillmentLabels = FULFILLMENT_MODE_LABELS;
  protected readonly getCategoryIcon = getCategoryIcon;
}

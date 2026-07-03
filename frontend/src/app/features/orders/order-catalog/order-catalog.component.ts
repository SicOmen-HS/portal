import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { OrderCardComponent } from '../../../shared/components/order-card/order-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-catalog',
  imports: [PageHeaderComponent, SearchBoxComponent, OrderCardComponent, EmptyStateComponent],
  templateUrl: './order-catalog.component.html',
  styleUrl: './order-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCatalogComponent {
  private readonly orderService = inject(OrderService);

  private readonly orderTypes = toSignal(this.orderService.getAllOrderTypes(), { initialValue: [] });

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('');

  protected readonly categories = computed(() =>
    Array.from(new Set(this.orderTypes().map((order) => order.category))).sort()
  );

  protected readonly filteredOrderTypes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.orderTypes().filter((order) => {
      const matchesTerm =
        term.length === 0 ||
        order.name.toLowerCase().includes(term) ||
        order.description.toLowerCase().includes(term);
      const matchesCategory = category.length === 0 || order.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }
}

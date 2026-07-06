import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ServiceOfferingService } from '../../../services/service-offering.service';
import { LIFECYCLE_STATUS_LABELS, LifecycleStatus } from '../../../models';

@Component({
  selector: 'app-service-catalog',
  imports: [PageHeaderComponent, SearchBoxComponent, ServiceCardComponent, EmptyStateComponent, KeyValuePipe],
  templateUrl: './service-catalog.component.html',
  styleUrl: './service-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCatalogComponent {
  private readonly serviceOfferings = inject(ServiceOfferingService);
  private readonly route = inject(ActivatedRoute);

  private readonly services = toSignal(this.serviceOfferings.getAll(), { initialValue: [] });

  protected readonly searchTerm = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  protected readonly selectedCategory = signal<string>('');
  protected readonly selectedLifecycle = signal<LifecycleStatus | ''>('');
  protected readonly lifecycleLabels = LIFECYCLE_STATUS_LABELS;

  /**
   * Enkelt fokusläge för mockupen: 'featured' visar bara de tjänster som är
   * överenskomna och prioriterade just nu, 'all' visar även övriga spår och
   * idéer som inte ska tappas bort. Styrs enbart av mockdatans `featured`-fält,
   * ingen egen modell krävs.
   */
  protected readonly focusMode = signal<'featured' | 'all'>('featured');

  protected readonly categories = computed(() =>
    Array.from(new Set(this.services().map((service) => service.category))).sort()
  );

  protected readonly filteredServices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const lifecycle = this.selectedLifecycle();
    const onlyFeatured = this.focusMode() === 'featured';

    return this.services()
      .filter((service) => {
        const matchesTerm =
          term.length === 0 ||
          service.name.toLowerCase().includes(term) ||
          service.shortDescription.toLowerCase().includes(term) ||
          service.tags.some((tag) => tag.toLowerCase().includes(term));
        const matchesCategory = category.length === 0 || service.category === category;
        const matchesLifecycle = lifecycle.length === 0 || service.lifecycleStatus === lifecycle;
        const matchesFocus = !onlyFeatured || service.featured === true;
        return matchesTerm && matchesCategory && matchesLifecycle && matchesFocus;
      })
      .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }

  onLifecycleChange(value: string): void {
    this.selectedLifecycle.set(value as LifecycleStatus | '');
  }

  setFocusMode(mode: 'featured' | 'all'): void {
    this.focusMode.set(mode);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { GuideCardComponent } from '../../shared/components/guide-card/guide-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { GuideService } from '../../services/guide.service';

@Component({
  selector: 'app-guides',
  imports: [PageHeaderComponent, SearchBoxComponent, GuideCardComponent, EmptyStateComponent],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidesComponent {
  private readonly guideService = inject(GuideService);

  private readonly guides = toSignal(this.guideService.getAll(), { initialValue: [] });

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('');

  protected readonly categories = computed(() =>
    Array.from(new Set(this.guides().map((guide) => guide.category))).sort()
  );

  protected readonly filteredGuides = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.guides().filter((guide) => {
      const matchesTerm =
        term.length === 0 ||
        guide.title.toLowerCase().includes(term) ||
        guide.description.toLowerCase().includes(term);
      const matchesCategory = category.length === 0 || guide.category === category;
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

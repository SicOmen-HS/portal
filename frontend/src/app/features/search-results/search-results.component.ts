import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { TypedResultCardComponent } from '../../shared/components/typed-result-card/typed-result-card.component';
import { AccessCategory, SearchResultItem, SearchResultType, SearchService } from '../../services/search.service';
import { LIFECYCLE_STATUS_LABELS, LifecycleStatus } from '../../models';

@Component({
  selector: 'app-search-results',
  imports: [RouterLink, SearchBoxComponent, TypedResultCardComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  protected readonly lifecycleLabels = LIFECYCLE_STATUS_LABELS;
  protected readonly query = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')), { initialValue: '' });

  protected readonly selectedType = signal<SearchResultType | ''>('');
  protected readonly selectedCategory = signal('');
  protected readonly selectedStatus = signal<LifecycleStatus | ''>('');
  protected readonly selectedAccess = signal<AccessCategory | ''>('');
  protected readonly selectedOwner = signal('');
  protected readonly selectedResult = signal<SearchResultItem | undefined>(undefined);

  private readonly allResults = toSignal(this.searchService.getAll(), { initialValue: [] });

  private readonly matchedResults = computed(() => {
    const query = this.query().trim().toLowerCase();
    return query ? this.searchService.rank(this.allResults(), query) : this.allResults();
  });

  protected readonly types = computed(() => this.uniqueSorted(this.matchedResults().map((item) => item.type)));
  protected readonly categories = computed(() => this.uniqueSorted(this.matchedResults().map((item) => item.category)));
  protected readonly statuses = computed(() =>
    this.uniqueSorted(this.matchedResults().map((item) => item.lifecycleStatus)) as LifecycleStatus[]
  );
  protected readonly accessOptions = computed(() =>
    this.uniqueSorted(this.matchedResults().map((item) => item.accessCategory)) as AccessCategory[]
  );
  protected readonly owners = computed(() => this.uniqueSorted(this.matchedResults().map((item) => item.owner)));

  protected readonly hasActiveFilters = computed(() =>
    Boolean(this.selectedType() || this.selectedCategory() || this.selectedStatus() || this.selectedAccess() || this.selectedOwner())
  );

  protected readonly results = computed(() => {
    const type = this.selectedType();
    const category = this.selectedCategory();
    const status = this.selectedStatus();
    const access = this.selectedAccess();
    const owner = this.selectedOwner();
    return this.matchedResults().filter(
      (item) =>
        (!type || item.type === type) &&
        (!category || item.category === category) &&
        (!status || item.lifecycleStatus === status) &&
        (!access || item.accessCategory === access) &&
        (!owner || item.owner === owner)
    );
  });

  constructor() {
    effect(() => {
      const results = this.results();
      if (!this.selectedResult() || !results.some((item) => item.id === this.selectedResult()?.id)) {
        this.selectedResult.set(results[0]);
      }
    });
  }

  private uniqueSorted<T extends string>(values: T[]): T[] {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'sv'));
  }

  onSearch(value: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: value }, queryParamsHandling: 'merge' });
  }

  selectType(value: string): void { this.selectedType.set(value as SearchResultType | ''); }
  selectCategory(value: string): void { this.selectedCategory.set(value); }
  selectStatus(value: string): void { this.selectedStatus.set(value as LifecycleStatus | ''); }
  selectAccess(value: string): void { this.selectedAccess.set(value as AccessCategory | ''); }
  selectOwner(value: string): void { this.selectedOwner.set(value); }

  resetFilters(): void {
    this.selectedType.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('');
    this.selectedAccess.set('');
    this.selectedOwner.set('');
  }

  primaryActionLabel(item: SearchResultItem): string {
    return ({
      Datamängd: 'Begär åtkomst', Guide: 'Läs guide', Beställning: 'Starta beställning',
      System: 'Öppna system', Systemlänk: 'Visa systemlänk', Tjänst: 'Kom igång',
      Dataprodukt: 'Begär åtkomst', 'BI-tillämpning': 'Visa tillämpning',
    } as Record<SearchResultType, string>)[item.type];
  }
}

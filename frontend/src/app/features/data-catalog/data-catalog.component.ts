import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { DatasetCardComponent } from '../../shared/components/dataset-card/dataset-card.component';
import { LifecycleBadgeComponent } from '../../shared/components/lifecycle-badge/lifecycle-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DataCatalogService } from '../../services/data-catalog.service';
import { DATA_CLASSIFICATION_LABELS, DataClassification } from '../../models';
import { SystemUrlService } from '../../core/links/system-url.service';

@Component({
  selector: 'app-data-catalog-page',
  imports: [
    RouterLink,
    PageHeaderComponent,
    SearchBoxComponent,
    DatasetCardComponent,
    LifecycleBadgeComponent,
    EmptyStateComponent,
    KeyValuePipe,
  ],
  templateUrl: './data-catalog.component.html',
  styleUrl: './data-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataCatalogPageComponent {
  private readonly dataCatalog = inject(DataCatalogService);
  // Injiceras direkt i templaten (protected) för att slå upp documentationUrlKey
  // per dataprodukt (tekniskt InformationMart) – se SystemUrlService.
  protected readonly systemUrlService = inject(SystemUrlService);

  private readonly datasets = toSignal(this.dataCatalog.getAllDatasets(), { initialValue: [] });
  protected readonly informationMarts = toSignal(this.dataCatalog.getAllInformationMarts(), {
    initialValue: [],
  });
  protected readonly businessApplications = toSignal(this.dataCatalog.getAllBusinessApplications(), {
    initialValue: [],
  });

  protected readonly classificationLabels = DATA_CLASSIFICATION_LABELS;

  protected readonly searchTerm = signal('');
  protected readonly selectedDomain = signal('');
  protected readonly selectedClassification = signal<DataClassification | ''>('');

  protected readonly domains = computed(() =>
    Array.from(new Set(this.datasets().map((dataset) => dataset.dataDomain))).sort()
  );

  protected readonly filteredDatasets = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const domain = this.selectedDomain();
    const classification = this.selectedClassification();

    return this.datasets().filter((dataset) => {
      const matchesTerm =
        term.length === 0 ||
        dataset.name.toLowerCase().includes(term) ||
        dataset.description.toLowerCase().includes(term);
      const matchesDomain = domain.length === 0 || dataset.dataDomain === domain;
      const matchesClassification = classification.length === 0 || dataset.classification === classification;
      return matchesTerm && matchesDomain && matchesClassification;
    });
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onDomainChange(value: string): void {
    this.selectedDomain.set(value);
  }

  onClassificationChange(value: string): void {
    this.selectedClassification.set(value as DataClassification | '');
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  INFORMATION_SECURITY_CLASSIFICATION_LABELS,
  INFORMATION_SECURITY_CLASSIFICATION_ORDER,
  highestInformationSecurityClassification,
  Dataset,
  InformationMart,
  LIFECYCLE_STATUS_LABELS,
  TRUST_LEVEL_LABELS,
} from '../../models';
import { DataCatalogService } from '../../services/data-catalog.service';
import { LifecycleBadgeComponent } from '../../shared/components/lifecycle-badge/lifecycle-badge.component';

type MarketItemType = 'product' | 'dataset';

interface MarketItemView {
  id: string;
  type: MarketItemType;
  typeLabel: 'Dataprodukt' | 'Datamängd';
  name: string;
  description: string;
  domain: string;
  owner: string;
  updateFrequency: string;
  accessLabel: string;
  lifecycleStatus: Dataset['lifecycleStatus'];
  classification: Dataset['classification'];
  highestIncomingClassification?: Dataset['classification'];
  product?: InformationMart;
  dataset?: Dataset;
}

@Component({
  selector: 'app-data-market-explorer',
  imports: [RouterLink, LifecycleBadgeComponent],
  templateUrl: './data-market-explorer.component.html',
  styleUrl: './data-market-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataMarketExplorerComponent {
  private readonly dataCatalog = inject(DataCatalogService);
  private readonly products = toSignal(this.dataCatalog.getAllInformationMarts(), { initialValue: [] });
  private readonly datasets = toSignal(this.dataCatalog.getAllDatasets(), { initialValue: [] });

  protected readonly classificationLabels = INFORMATION_SECURITY_CLASSIFICATION_LABELS;
  protected readonly classifications = INFORMATION_SECURITY_CLASSIFICATION_ORDER;
  protected readonly lifecycleLabels = LIFECYCLE_STATUS_LABELS;
  protected readonly trustLabels = TRUST_LEVEL_LABELS;
  protected readonly query = signal('');
  protected readonly typeFilter = signal<'all' | MarketItemType>('all');
  protected readonly domainFilter = signal('');
  protected readonly classificationFilter = signal<'' | Dataset['classification']>('');
  protected readonly selectedId = signal('');

  protected readonly items = computed<MarketItemView[]>(() => [
    ...this.products().map((product) => ({
      id: product.id, type: 'product' as const, typeLabel: 'Dataprodukt' as const,
      name: product.name, description: product.purpose || product.description,
      domain: product.dataDomain, owner: product.owner,
      updateFrequency: product.updateFrequency || 'Inte angivet',
      accessLabel: product.accessModel || 'Kontakta ansvarig funktion',
      lifecycleStatus: product.lifecycleStatus, classification: product.classification,
      highestIncomingClassification: highestInformationSecurityClassification(
        (product.relatedDatasetIds ?? []).flatMap((id) => {
          const dataset = this.datasets().find((item) => item.id === id);
          return dataset ? [dataset.classification] : [];
        })
      ), product,
    })),
    ...this.datasets().map((dataset) => ({
      id: dataset.id, type: 'dataset' as const, typeLabel: 'Datamängd' as const,
      name: dataset.name, description: dataset.description, domain: dataset.dataDomain,
      owner: dataset.owner, updateFrequency: dataset.updateFrequency,
      accessLabel: dataset.accessModel, lifecycleStatus: dataset.lifecycleStatus,
      classification: dataset.classification, dataset,
    })),
  ]);

  protected readonly domains = computed(() => [...new Set(this.items().map((item) => item.domain))].sort());
  protected readonly filteredItems = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('sv');
    return this.items().filter((item) => {
      const searchable = `${item.name} ${item.description} ${item.domain} ${item.owner} ${item.accessLabel}`.toLocaleLowerCase('sv');
      return (!query || searchable.includes(query))
        && (this.typeFilter() === 'all' || item.type === this.typeFilter())
        && (!this.domainFilter() || item.domain === this.domainFilter())
        && (!this.classificationFilter() || item.classification === this.classificationFilter());
    });
  });
  protected readonly selectedItem = computed(() =>
    this.filteredItems().find((item) => item.id === this.selectedId()) || this.filteredItems()[0]
  );

  protected selectItem(id: string): void { this.selectedId.set(id); }
  protected setQuery(value: string): void { this.query.set(value); }
  protected setType(value: string): void { this.typeFilter.set(value as 'all' | MarketItemType); this.selectedId.set(''); }
  protected setDomain(value: string): void { this.domainFilter.set(value); this.selectedId.set(''); }
  protected setClassification(value: string): void { this.classificationFilter.set(value as '' | Dataset['classification']); this.selectedId.set(''); }
  protected clearFilters(): void { this.query.set(''); this.typeFilter.set('all'); this.domainFilter.set(''); this.classificationFilter.set(''); this.selectedId.set(''); }
  protected detailRoute(item: MarketItemView): string[] { return item.type === 'product' ? ['/data', 'dataprodukt', item.id] : ['/data', item.id]; }
}

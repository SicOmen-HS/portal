import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { DataCatalogService } from '../../services/data-catalog.service';
import { GuideService } from '../../services/guide.service';
import { OrderService } from '../../services/order.service';
import { SystemService } from '../../services/system.service';
import { INFORMATION_SECURITY_CLASSIFICATION_LABELS } from '../../models';

@Component({
  selector: 'app-data-detail',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './data-detail.component.html',
  styleUrl: './data-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(DataCatalogService);
  private readonly guides = inject(GuideService);
  private readonly orders = inject(OrderService);
  private readonly systems = inject(SystemService);
  protected readonly classificationLabels = INFORMATION_SECURITY_CLASSIFICATION_LABELS;

  protected readonly view$ = this.route.paramMap.pipe(
    switchMap((params) => this.catalog.getDatasetById(params.get('id') ?? '')),
    switchMap((dataset) =>
      dataset
        ? combineLatest([
            this.catalog.getAllInformationMarts(),
            this.catalog.getAllBusinessApplications(),
            this.guides.getByIds(dataset.relatedGuideIds ?? []),
            this.orders.getOrderTypesByIds(dataset.relatedOrderTypeIds ?? []),
            this.systems.getByIds(dataset.relatedSystemIds ?? []),
          ]).pipe(
            map(([marts, applications, relatedGuides, relatedOrderTypes, relatedSystems]) => ({
              dataset,
              marts: marts.filter((mart) => mart.relatedDatasetIds?.includes(dataset.id)),
              applications: applications.filter(
                (app) =>
                  marts.some((mart) => mart.relatedDatasetIds?.includes(dataset.id) && app.informationMartIds.includes(mart.id))
              ),
              relatedGuides,
              relatedOrderTypes,
              relatedSystems,
              targetAudience: Array.from(new Set(relatedGuides.flatMap((guide) => guide.targetAudience))),
            }))
          )
        : of({
            dataset: undefined,
            marts: [],
            applications: [],
            relatedGuides: [],
            relatedOrderTypes: [],
            relatedSystems: [],
            targetAudience: [] as string[],
          })
    )
  );
}

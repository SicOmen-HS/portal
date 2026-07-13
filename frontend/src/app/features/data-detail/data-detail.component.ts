import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { DataCatalogService } from '../../services/data-catalog.service';
import { GuideService } from '../../services/guide.service';
import { OrderService } from '../../services/order.service';
import { SystemService } from '../../services/system.service';
import { INFORMATION_SECURITY_CLASSIFICATION_LABELS } from '../../models';
import { DatasetFieldsPreviewComponent } from '../../shared/components/dataset-fields-preview/dataset-fields-preview.component';

@Component({
  selector: 'app-data-detail',
  imports: [AsyncPipe, RouterLink, DatasetFieldsPreviewComponent],
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
            this.getPreviewState(dataset.id, !!dataset.sampleFields?.length),
          ]).pipe(
            map(([marts, applications, relatedGuides, relatedOrderTypes, relatedSystems, previewState]) => ({
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
              previewRows: previewState.previewRows,
              previewError: previewState.previewError,
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
            previewRows: undefined as string[][] | undefined,
            previewError: false,
          })
    )
  );

  /**
   * Hämtar previewradernas tillstånd för dataset-detaljsidan (AB-027). Vid fel
   * (t.ex. lokalt API nere) visas ett kontrollerat felmeddelande i stället för
   * tabellen - ingen tyst fallback till den klientderiverade mockraden.
   */
  private getPreviewState(
    datasetId: string,
    hasSampleFields: boolean
  ): Observable<{ previewRows: string[][] | undefined; previewError: boolean }> {
    if (!hasSampleFields) {
      return of({ previewRows: undefined, previewError: false });
    }
    return this.catalog.getDatasetPreview(datasetId).pipe(
      map((preview) => ({ previewRows: preview?.rows, previewError: false })),
      catchError(() => of({ previewRows: undefined, previewError: true }))
    );
  }
}

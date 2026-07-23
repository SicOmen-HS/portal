import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, combineLatest, Observable, map, of, shareReplay } from 'rxjs';
import { RuntimeConfigService } from '../core/config/runtime-config.service';
import { MockDataService } from '../core/services/mock-data.service';
import {
  BusinessApplication,
  DataService as DataServiceOffering,
  Dataset,
  DatasetDeclaredOrigin,
  DatasetPreview,
  InformationMart,
} from '../models';
import { validateDataClassifications } from './data-classification-validation';

/**
 * Samlar datakatalogens objekt: Dataset, DataService, InformationMart och
 * BusinessApplication. Namnet DataCatalogService används för att undvika
 * namnkollision med Angulars @angular/common/http HttpClient-mönster och
 * med domänmodellen DataService.
 */
@Injectable({ providedIn: 'root' })
export class DataCatalogService {
  private readonly mockData = inject(MockDataService);
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  private readonly rawDatasets$ = this.mockData.load<Dataset[]>('datasets.mock.json');

  private readonly dataServices$: Observable<DataServiceOffering[]> = this.mockData
    .load<DataServiceOffering[]>('data-services.mock.json')
    .pipe(shareReplay(1));

  private readonly rawInformationMarts$ = this.mockData.load<InformationMart[]>('information-marts.mock.json');
  private readonly catalog$ = combineLatest([this.rawDatasets$, this.rawInformationMarts$]).pipe(
    map(([datasets, products]) => {
      validateDataClassifications(datasets, products);
      return { datasets, products };
    }),
    shareReplay(1)
  );
  private readonly datasets$ = this.catalog$.pipe(map((catalog) => catalog.datasets));
  private readonly informationMarts$ = this.catalog$.pipe(map((catalog) => catalog.products));

  private readonly businessApplications$: Observable<BusinessApplication[]> = this.mockData
    .load<BusinessApplication[]>('business-applications.mock.json')
    .pipe(shareReplay(1));

  getAllDatasets(): Observable<Dataset[]> {
    return this.datasets$;
  }

  getDatasetById(id: string): Observable<Dataset | undefined> {
    return this.datasets$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getDatasetsByIds(ids: string[]): Observable<Dataset[]> {
    return this.datasets$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }

  /**
   * Hämtar previewrader för en datamängd (AB-027). I mockläge
   * (features.useMockData: true, standard) härleds en syntetisk rad från
   * dataset.sampleFields, precis som tidigare - ingen faktisk nätverksanropslogik.
   * I lokalt API-läge hämtas riktiga fiktiva rader från backendens
   * GET /api/datasets/{id}/preview. Frontend ansluter aldrig direkt till SQL Server.
   * Fel vid API-anrop fångas medvetet inte här - se data-detail.component.ts för
   * kontrollerad felhantering utan tyst fallback till mockdata.
   */
  getDatasetPreview(id: string): Observable<DatasetPreview | undefined> {
    if (this.runtimeConfig.config().features.useMockData) {
      return this.getDatasetById(id).pipe(map((dataset) => this.deriveMockPreview(dataset)));
    }

    const apiBaseUrl = this.runtimeConfig.config().apiBaseUrl;
    return this.http.get<DatasetPreview>(`${apiBaseUrl}/datasets/${id}/preview`);
  }

  private deriveMockPreview(dataset: Dataset | undefined): DatasetPreview | undefined {
    if (!dataset?.sampleFields?.length) {
      return undefined;
    }
    return {
      datasetId: dataset.id,
      columns: dataset.sampleFields.map((field) => field.name),
      rows: [dataset.sampleFields.map((field) => field.exampleValue)],
    };
  }

  /**
   * Hämtar manuellt deklarerade, omedelbara uppströmskällor för en datamängd
   * (AB-031). I mockläge läses dataset.declaredOrigins direkt, utan härledning.
   * I lokalt API-läge hämtas listan från backendens
   * GET /api/datasets/{id}/declared-origins. Ett fel vid API-anropet ger en tom
   * lista - avsaknad av deklarerat ursprung är ett normalt, icke-felaktigt
   * tillstånd som döljer sektionen i UI:t, inte ett kontrollerat felmeddelande.
   */
  getDatasetOrigins(id: string): Observable<DatasetDeclaredOrigin[]> {
    if (this.runtimeConfig.config().features.useMockData) {
      return this.getDatasetById(id).pipe(map((dataset) => dataset?.declaredOrigins ?? []));
    }

    const apiBaseUrl = this.runtimeConfig.config().apiBaseUrl;
    return this.http
      .get<DatasetDeclaredOrigin[]>(`${apiBaseUrl}/datasets/${id}/declared-origins`)
      .pipe(catchError(() => of([])));
  }

  getAllDataServices(): Observable<DataServiceOffering[]> {
    return this.dataServices$;
  }

  getAllInformationMarts(): Observable<InformationMart[]> {
    return this.informationMarts$;
  }

  getInformationMartsByIds(ids: string[]): Observable<InformationMart[]> {
    return this.informationMarts$.pipe(map((items) => items.filter((item) => ids.includes(item.id))));
  }

  getInformationMartById(id: string): Observable<InformationMart | undefined> {
    return this.informationMarts$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  getAllBusinessApplications(): Observable<BusinessApplication[]> {
    return this.businessApplications$;
  }

  getBusinessApplicationsByIds(ids: string[]): Observable<BusinessApplication[]> {
    return this.businessApplications$.pipe(
      map((items) => items.filter((item) => ids.includes(item.id)))
    );
  }
}

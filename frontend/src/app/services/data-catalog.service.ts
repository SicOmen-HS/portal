import { Injectable, inject } from '@angular/core';
import { combineLatest, Observable, map, shareReplay } from 'rxjs';
import { MockDataService } from '../core/services/mock-data.service';
import {
  BusinessApplication,
  DataService as DataServiceOffering,
  Dataset,
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

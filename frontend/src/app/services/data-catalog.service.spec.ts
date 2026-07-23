import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { DataCatalogService } from './data-catalog.service';
import { MockDataService } from '../core/services/mock-data.service';
import { RuntimeConfigService } from '../core/config/runtime-config.service';
import { DEFAULT_RUNTIME_CONFIG } from '../core/config/runtime-config.model';
import { Dataset } from '../models';

/**
 * Testar getDatasetOrigins (AB-031): mockläge läser Dataset.declaredOrigins direkt,
 * ett känt dataset utan deklarerat ursprung ger tom lista, och API-läge anropar
 * backendens GET /api/datasets/{id}/declared-origins.
 */
describe('DataCatalogService - getDatasetOrigins', () => {
  const weatherDataset: Dataset = {
    id: 'dataset-weather-warning-events-demo',
    name: 'Vädervarningshändelser',
    description: 'Fiktiv datamängd för test.',
    dataDomain: 'Väder och klimat',
    owner: 'Exempelteam Väderdata',
    steward: 'Exempelförvaltare Väderdata',
    source: 'Lokal SQL Server-POC (exempel)',
    accessModel: 'Öppen för alla interna användare',
    classification: 'internal',
    updateFrequency: 'Vid behov i POC',
    metadataSource: 'Manuellt förvaltad innehållsfil (exempel)',
    lifecycleStatus: 'active',
    visibility: 'all-users',
    declaredOrigins: [
      {
        datasetId: 'dataset-weather-warning-events-demo',
        upstreamSchemaName: 'demo_dw',
        upstreamObjectName: 'weather_warning_event_source',
      },
    ],
  };

  const salesDataset: Dataset = {
    id: 'dataset-sales-transactions-demo',
    name: 'Exempel Försäljningstransaktioner',
    description: 'Fiktiv datamängd för test.',
    dataDomain: 'Försäljning',
    owner: 'Exempelteam Försäljningsanalys',
    steward: 'Exempelteam Dataplattform',
    source: 'Lokal SQL Server-POC (exempel)',
    accessModel: 'Öppen för alla interna användare',
    classification: 'internal',
    updateFrequency: 'Dagligen (exempel)',
    metadataSource: 'Manuellt förvaltad innehållsfil (exempel)',
    lifecycleStatus: 'active',
    visibility: 'all-users',
  };

  function configureMockMode(): DataCatalogService {
    const configSignal = signal({
      ...DEFAULT_RUNTIME_CONFIG,
      features: { ...DEFAULT_RUNTIME_CONFIG.features, useMockData: true },
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataCatalogService,
        {
          provide: MockDataService,
          useValue: {
            load: (fileName: string) =>
              fileName === 'datasets.mock.json' ? of([weatherDataset, salesDataset]) : of([]),
          },
        },
        { provide: RuntimeConfigService, useValue: { config: configSignal.asReadonly() } },
      ],
    });

    return TestBed.inject(DataCatalogService);
  }

  it('läser declaredOrigins direkt från dataset i mockläge', async () => {
    const service = configureMockMode();

    const origins = await firstValueFrom(service.getDatasetOrigins('dataset-weather-warning-events-demo'));

    expect(origins).toEqual([
      {
        datasetId: 'dataset-weather-warning-events-demo',
        upstreamSchemaName: 'demo_dw',
        upstreamObjectName: 'weather_warning_event_source',
      },
    ]);
  });

  it('ger en tom lista för ett känt dataset utan deklarerat ursprung', async () => {
    const service = configureMockMode();

    const origins = await firstValueFrom(service.getDatasetOrigins('dataset-sales-transactions-demo'));

    expect(origins).toEqual([]);
  });

  it('anropar backendens declared-origins-endpoint i lokalt API-läge', () => {
    const configSignal = signal({
      ...DEFAULT_RUNTIME_CONFIG,
      features: { ...DEFAULT_RUNTIME_CONFIG.features, useMockData: false },
      apiBaseUrl: 'http://localhost:5104/api',
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataCatalogService,
        { provide: MockDataService, useValue: { load: () => of([]) } },
        { provide: RuntimeConfigService, useValue: { config: configSignal.asReadonly() } },
      ],
    });

    const service = TestBed.inject(DataCatalogService);
    const httpMock = TestBed.inject(HttpTestingController);

    let result: unknown;
    service.getDatasetOrigins('dataset-weather-warning-events-demo').subscribe((value) => (result = value));

    const request = httpMock.expectOne(
      'http://localhost:5104/api/datasets/dataset-weather-warning-events-demo/declared-origins'
    );
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        datasetId: 'dataset-weather-warning-events-demo',
        upstreamSchemaName: 'demo_dw',
        upstreamObjectName: 'weather_warning_event_source',
      },
    ]);

    expect(result).toEqual([
      {
        datasetId: 'dataset-weather-warning-events-demo',
        upstreamSchemaName: 'demo_dw',
        upstreamObjectName: 'weather_warning_event_source',
      },
    ]);

    httpMock.verify();
  });
});

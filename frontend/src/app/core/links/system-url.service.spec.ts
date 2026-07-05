import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SystemUrlService } from './system-url.service';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { DEFAULT_RUNTIME_CONFIG } from '../config/runtime-config.model';

describe('SystemUrlService', () => {
  let service: SystemUrlService;

  function configure(systemUrls: Record<string, string>): void {
    const configSignal = signal({ ...DEFAULT_RUNTIME_CONFIG, systemUrls });

    TestBed.configureTestingModule({
      providers: [
        SystemUrlService,
        { provide: RuntimeConfigService, useValue: { config: configSignal.asReadonly() } },
      ],
    });

    service = TestBed.inject(SystemUrlService);
  }

  it('resolves a configured urlKey to its mapped URL', () => {
    configure({ OPENMETADATA_URL: 'https://example.local/openmetadata' });

    expect(service.getUrl('OPENMETADATA_URL')).toBe('https://example.local/openmetadata');
    expect(service.isConfigured('OPENMETADATA_URL')).toBe(true);
  });

  it('falls back to "#" for a missing urlKey without throwing', () => {
    configure({});

    expect(service.getUrl('UNKNOWN_KEY')).toBe('#');
    expect(service.isConfigured('UNKNOWN_KEY')).toBe(false);
  });

  it('falls back to "#" when no urlKey is provided', () => {
    configure({ OPENMETADATA_URL: 'https://example.local/openmetadata' });

    expect(service.getUrl(undefined)).toBe('#');
    expect(service.isConfigured(undefined)).toBe(false);
  });
});

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from './runtime-config.model';

const LOCAL_OVERRIDE_ERROR_MESSAGE =
  'Lokal konfigurationsfil runtime-config.local.json kunde inte läsas eller har ett ogiltigt format. ' +
  'Kontrollera att filen innehåller giltig JSON enligt strukturen i runtime-config.local.example.json, ' +
  'eller ta bort filen för att köra i versionshanterat standardläge.';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Kontrollerar minimal, förväntad form innan en lokal override slås ihop med grundkonfigurationen. */
function isValidLocalOverride(value: unknown): value is Partial<RuntimeConfig> {
  if (!isPlainObject(value)) {
    return false;
  }
  if ('features' in value && !isPlainObject(value['features'])) {
    return false;
  }
  if ('systemUrls' in value && !isPlainObject(value['systemUrls'])) {
    return false;
  }
  return true;
}

/** Slår ihop en lokal override med grundkonfigurationen utan att tappa övriga feature flags eller systemUrls-nycklar. */
function mergeRuntimeConfig(base: RuntimeConfig, override: Partial<RuntimeConfig>): RuntimeConfig {
  return {
    ...base,
    ...override,
    features: { ...base.features, ...(override.features ?? {}) },
    systemUrls: { ...base.systemUrls, ...(override.systemUrls ?? {}) },
  };
}

/**
 * Läser portalens runtime-konfiguration från assets/config/runtime-config.json.
 * Gör det möjligt att bygga frontend en gång och ändra konfiguration per miljö
 * utan att bygga om (docs/05_Konfiguration.md, docs/04_Systemarkitektur.md).
 *
 * Detta är projektets motsvarighet till den "AppConfigService" som beskrivs i
 * docs/13_Utvecklarguide.md – rollen (ladda och exponera publik frontend-
 * konfiguration) är densamma, bara namnet skiljer sig.
 *
 * SystemUrlService (core/links/) bygger vidare på denna tjänst för att slå
 * upp enskilda `urlKey`-värden mot `systemUrls`.
 *
 * Stöder även en valfri, ignorerad lokal override (assets/config/runtime-config.local.json,
 * se runtime-config.local.example.json) för det lokala SQL Server-preview-POC:t (AB-027).
 * Den versionshanterade runtime-config.json är fortsatt obligatorisk grundkonfiguration
 * med useMockData: true – den lokala filen slås ihop kontrollerat ovanpå den, utan att
 * ersätta hela features-objektet.
 */
@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly http = inject(HttpClient);
  private readonly configSignal = signal<RuntimeConfig>(DEFAULT_RUNTIME_CONFIG);

  /** Läsbar signal med aktuell konfiguration. Startar med säkra standardvärden innan load() slutförts. */
  readonly config = this.configSignal.asReadonly();

  async load(): Promise<void> {
    const baseConfig = await this.loadBaseConfig();
    const localOverride = await this.loadLocalOverride();
    this.configSignal.set(localOverride ? mergeRuntimeConfig(baseConfig, localOverride) : baseConfig);
  }

  private async loadBaseConfig(): Promise<RuntimeConfig> {
    try {
      return await firstValueFrom(this.http.get<RuntimeConfig>('assets/config/runtime-config.json'));
    } catch {
      // Saknad eller trasig grundkonfiguration ska inte krascha appen –
      // portalen fortsätter med säkra standardvärden (mockläge, inga länkar).
      return DEFAULT_RUNTIME_CONFIG;
    }
  }

  /**
   * Läser en valfri lokal override. Filen saknas normalt (versionshanteras inte,
   * se .gitignore) – det är standardläget och ska inte behandlas som ett fel.
   * Finns filen men går inte att tolka som giltig konfiguration ger detta ett
   * tydligt, kontrollerat konfigurationsfel istället för ett tyst felaktigt läge.
   */
  private async loadLocalOverride(): Promise<Partial<RuntimeConfig> | undefined> {
    let value: unknown;
    try {
      value = await firstValueFrom(this.http.get<unknown>('assets/config/runtime-config.local.json'));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return undefined;
      }
      console.error(LOCAL_OVERRIDE_ERROR_MESSAGE, error);
      throw new Error(LOCAL_OVERRIDE_ERROR_MESSAGE);
    }

    if (!isValidLocalOverride(value)) {
      console.error(LOCAL_OVERRIDE_ERROR_MESSAGE, value);
      throw new Error(LOCAL_OVERRIDE_ERROR_MESSAGE);
    }

    return value;
  }
}

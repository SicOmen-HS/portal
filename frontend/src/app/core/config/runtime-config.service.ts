import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from './runtime-config.model';

/**
 * Läser portalens runtime-konfiguration från assets/config/runtime-config.json.
 * Gör det möjligt att bygga frontend en gång och ändra konfiguration per miljö
 * utan att bygga om (docs/05_Konfiguration.md, docs/04_Systemarkitektur.md).
 */
@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly http = inject(HttpClient);
  private readonly configSignal = signal<RuntimeConfig>(DEFAULT_RUNTIME_CONFIG);

  readonly config = this.configSignal.asReadonly();

  async load(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<RuntimeConfig>('assets/config/runtime-config.json')
      );
      this.configSignal.set(config);
    } catch {
      // Om runtime-konfiguration saknas används säkra standardvärden.
      this.configSignal.set(DEFAULT_RUNTIME_CONFIG);
    }
  }
}

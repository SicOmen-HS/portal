import { Injectable, inject } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config.service';

/**
 * Löser upp innehållets länknycklar (`urlKey`, `documentationUrlKey`, `linkKey`)
 * till en faktisk URL via runtime-konfigurationens `systemUrls`-karta.
 *
 * Detta är mekanismen som gör att komponenter och mockdata aldrig behöver
 * innehålla en riktig URL direkt (docs/05_Konfiguration.md,
 * docs/13_Utvecklarguide.md#variabelstyrda-url:er-och-urlkey). Att byta miljö
 * innebär bara att byta värdena i runtime-config.json – ingen kod eller
 * mockdata behöver ändras.
 */
@Injectable({ providedIn: 'root' })
export class SystemUrlService {
  private readonly runtimeConfig = inject(RuntimeConfigService);

  /** Nycklar det redan har varnats för, så att konsolen inte svämmas över vid upprepad rendering. */
  private readonly warnedKeys = new Set<string>();

  /**
   * Returnerar URL:en för en given nyckel, eller en säker fallback ("#") om
   * nyckeln saknas eller inte är konfigurerad i den aktuella miljön.
   *
   * Att sakna en nyckel ska aldrig krascha portalen – i värsta fall blir
   * länken overksam, vilket är ett medvetet och säkert beteende.
   */
  getUrl(urlKey: string | undefined): string {
    if (!urlKey) {
      return '#';
    }

    const resolvedUrl = this.runtimeConfig.config().systemUrls[urlKey];
    if (resolvedUrl) {
      return resolvedUrl;
    }

    if (!this.warnedKeys.has(urlKey)) {
      this.warnedKeys.add(urlKey);
      // Avsiktligt endast en konsolvarning – aldrig ett kastat fel – eftersom
      // en saknad länk i en mockup/testmiljö inte ska hindra resten av sidan
      // från att fungera.
      console.warn(
        `[SystemUrlService] Ingen URL konfigurerad för urlKey "${urlKey}". ` +
          'Kontrollera systemUrls i runtime-config.json.'
      );
    }

    return '#';
  }

  /**
   * Anger om en nyckel faktiskt är konfigurerad, så att UI kan visa länken
   * som inaktiv/otillgänglig istället för en klickbar länk som leder till "#".
   */
  isConfigured(urlKey: string | undefined): boolean {
    if (!urlKey) {
      return false;
    }
    return Boolean(this.runtimeConfig.config().systemUrls[urlKey]);
  }
}

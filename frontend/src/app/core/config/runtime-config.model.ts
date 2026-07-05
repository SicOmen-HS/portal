/**
 * Publik frontend-konfiguration som läses vid uppstart.
 * Innehåller endast värden som är säkra att exponera i webbläsaren
 * (docs/05_Konfiguration.md). Inga hemligheter eller interna URL:er.
 *
 * Detta är projektets "AppConfigService"-indata (se docs/13_Utvecklarguide.md) –
 * namnet på tjänsten som laddar filen är RuntimeConfigService, men rollen är
 * densamma som beskrivs i utvecklarguiden.
 */
export interface RuntimeConfig {
  apiBaseUrl: string;
  applicationName: string;
  environmentLabel: string;
  features: {
    showStatusPanel: boolean;
    showDataCatalog: boolean;
    showOrderFlows: boolean;
    showTechnicalMetadata: boolean;
    useMockData: boolean;
  };
  /**
   * Mappar en innehållsnyckel (`urlKey`/`documentationUrlKey`/`linkKey` i mockdata)
   * till en faktisk URL för den aktuella miljön. Detta är den enda platsen där
   * riktiga URL:er ska förekomma – se SystemUrlService och
   * docs/13_Utvecklarguide.md#variabelstyrda-url:er-och-urlkey.
   */
  systemUrls: Record<string, string>;
}

/**
 * Säker startpunkt innan runtime-config.json har lästs klart, och säker
 * slutgiltig fallback om filen saknas eller är trasig. Ett tomt `systemUrls`
 * gör att SystemUrlService faller tillbaka till "#" för alla länkar istället
 * för att krascha eller visa ett odefinierat värde.
 */
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  apiBaseUrl: '/api',
  applicationName: 'Data- och analysportalen',
  environmentLabel: 'Lokal mockup',
  features: {
    showStatusPanel: true,
    showDataCatalog: true,
    showOrderFlows: true,
    showTechnicalMetadata: true,
    useMockData: true,
  },
  systemUrls: {},
};

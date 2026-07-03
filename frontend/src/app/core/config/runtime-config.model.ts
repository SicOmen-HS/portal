/**
 * Publik frontend-konfiguration som läses vid uppstart.
 * Innehåller endast värden som är säkra att exponera i webbläsaren
 * (docs/05_Konfiguration.md). Inga hemligheter eller interna URL:er.
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
}

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
};

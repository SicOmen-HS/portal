import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

export type ReportingContainerType = 'stream' | 'folder';

/** Vad containertypen heter för användaren, t.ex. i en granskningssammanfattning. */
export const REPORTING_CONTAINER_TYPE_LABELS: Record<ReportingContainerType, string> = {
  stream: 'Ström',
  folder: 'Mapp',
};

/** Prompttext för väljaren, per containertyp – se docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md. */
export const REPORTING_CONTAINER_SELECT_LABELS: Record<ReportingContainerType, string> = {
  stream: 'Välj ström',
  folder: 'Välj mapp',
};

/**
 * ReportingContainer beskriver den gruppering ett BI-källsystem själv använder för att
 * organisera rapport-/dashboardobjekt (Qlik Sense-ström, Grafana-mapp, SAP
 * BusinessObjects-mapp) – ett första, avgränsat steg av den generiska BI-objektmodellen
 * från docs/analysis/AN-002_urler_bi_objektmodell_integrationsstrategi.md
 * (docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md).
 */
export interface ReportingContainer {
  id: string;
  name: string;
  description: string;
  systemId: string;
  containerType: ReportingContainerType;
  /** Containerns id i källsystemet, skilt från portalens egna, stabila id. */
  sourceSystemNativeId: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
  /** Mockat tidsstämpel för när containern senast synkades in i portalens katalog. */
  lastSyncedAt: string;
}

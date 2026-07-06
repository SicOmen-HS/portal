import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

export type ReportingAssetType = 'qlik-app' | 'grafana-dashboard' | 'webi-document';

/** Vad assettypen heter för användaren, t.ex. i en granskningssammanfattning. */
export const REPORTING_ASSET_TYPE_LABELS: Record<ReportingAssetType, string> = {
  'qlik-app': 'App',
  'grafana-dashboard': 'Dashboard',
  'webi-document': 'Web Intelligence-dokument',
};

/** Prompttext för väljaren, per assettyp – se docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md. */
export const REPORTING_ASSET_SELECT_LABELS: Record<ReportingAssetType, string> = {
  'qlik-app': 'Välj app',
  'grafana-dashboard': 'Välj dashboard',
  'webi-document': 'Välj Web Intelligence-dokument',
};

/**
 * approvalPolicy är en förberedelse för ett framtida godkännandeflöde, inte ett
 * riktigt attestflöde. 'responsible-owner' innebär att ansvarig person/funktion
 * normalt behöver godkänna ändringen innan den går vidare.
 */
export type ApprovalPolicy = 'none' | 'responsible-owner';

export const APPROVAL_POLICY_LABELS: Record<ApprovalPolicy, string> = {
  none: 'Inget separat godkännande markerat',
  'responsible-owner': 'Godkännande från ansvarig krävs',
};

/**
 * ReportingAsset beskriver det körbara/visningsbara rapport- eller dashboardobjektet
 * en ändringsbegäran gäller (Qlik-app, Grafana-dashboard, SAP BusinessObjects Web
 * Intelligence-dokument) – ett första, avgränsat steg av den generiska
 * BI-objektmodellen från docs/analysis/AN-002_urler_bi_objektmodell_integrationsstrategi.md
 * (docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md).
 */
export interface ReportingAsset {
  id: string;
  name: string;
  description: string;
  containerId: string;
  assetType: ReportingAssetType;
  /** Objektets id i källsystemet, skilt från portalens egna, stabila id. */
  sourceSystemNativeId: string;
  ownerTeamId?: string;
  /** Fiktiv ansvarig person eller funktion – förberedelse för ett framtida godkännandeflöde. */
  responsibleLabel: string;
  approvalPolicy: ApprovalPolicy;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
  /** Mockat tidsstämpel för när objektet senast synkades in i portalens katalog. */
  lastSyncedAt: string;
}

/**
 * Mockad processtext för ett framtida godkännandeflöde, baserad enbart på det valda
 * objektets approvalPolicy och en lokal demo-flagga för om beställaren är markerad
 * som ansvarig. Delad mellan BiObjectSelectorComponent och den anropande sidan så att
 * texten är konsekvent utan att dupliceras (docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md).
 */
export function reportingApprovalMessage(asset: ReportingAsset | undefined, requesterIsResponsible: boolean): string {
  if (!asset) return '';
  if (requesterIsResponsible) {
    return 'Du är markerad som ansvarig i demo-läget. Godkännandesteget markeras som automatiskt godkänt.';
  }
  if (asset.approvalPolicy === 'responsible-owner') {
    return 'Godkännande från ansvarig krävs innan ändringen skickas vidare till levererande team.';
  }
  return 'Inget separat godkännande är markerat för detta objekt i mockdata.';
}

import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * InformationMart beskriver en strukturerad informationsprodukt eller
 * konsumtionsyta som bygger på Data Vault 2.1. Ska inte modelleras som en
 * vanlig teknisk komponent (03_Informationsmodell.md).
 *
 * I användargränssnittet visas detta objekt som "Dataprodukt", inte som
 * "Information Mart" – se docs/adr/0001-dataprodukt-som-anvandarbegrepp.md.
 * Interfacet, filnamnet och etablerade fältnamn behålls oförändrade eftersom
 * beslutet gäller användarspråk och presentation, inte den interna modellen.
 */

/** Tillitsnivå för en dataprodukt, visad hellre än ett ensamt procenttal. */
export type TrustLevel = 'high' | 'medium' | 'low';

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  high: 'Hög',
  medium: 'Medel',
  low: 'Låg',
};

export type TrustTone = 'success' | 'warning' | 'neutral';

export const TRUST_LEVEL_TONE: Record<TrustLevel, TrustTone> = {
  high: 'success',
  medium: 'warning',
  low: 'neutral',
};

/**
 * Styrnings- och kvalitetssignaler för en dataprodukt. Visas som flera
 * begripliga delsignaler istället för ett ensamt objektivt kvalitetstal
 * (docs/adr/0001-dataprodukt-som-anvandarbegrepp.md).
 */
export interface DataProductTrust {
  level: TrustLevel;
  /** Andel av förväntad dokumentation som finns, 0–100. */
  documentationCoverage: number;
  qualityChecksPassed: number;
  qualityChecksTotal: number;
  ownerAssigned: boolean;
  lineageAvailable: boolean;
  classificationAssigned: boolean;
  /** ISO-datum för senaste granskning. */
  lastReviewed: string;
}

/** Etiketter som alltid ska användas i användargränssnittet – se ADR-0001. */
export const DATA_PRODUCT_USER_LABEL = 'Dataprodukt';
export const DATA_PRODUCT_TECHNICAL_LABEL = 'Information Mart';

export interface InformationMart {
  id: string;
  name: string;
  description: string;
  /** Kort, användarnära syftesbeskrivning utöver `description`. */
  purpose?: string;
  targetAudience?: string[];
  dataDomain: string;
  owner: string;
  ownerTeamId?: string;
  /** Åtkomstläge, t.ex. "Åtkomst krävs via accessgrupp". */
  accessModel?: string;
  /** Aktualitet, t.ex. "Uppdateras dagligen (exempel)". */
  updateFrequency?: string;
  /** Teknisk modelltyp, t.ex. "Star schema (exempel)" – visas under tekniska detaljer. */
  modelType?: string;
  trust?: DataProductTrust;
  relatedDatasetIds?: string[];
  relatedBusinessApplicationIds?: string[];
  relatedAccessGroupIds?: string[];
  relatedGuideIds?: string[];
  relatedOrderTypeIds?: string[];
  /** Nyckel som slås upp mot systemUrls i runtime-config, se SystemUrlService. */
  documentationUrlKey?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

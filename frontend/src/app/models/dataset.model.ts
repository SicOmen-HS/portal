import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';
import { InformationSecurityClassification } from './information-security-classification.model';
import { DatasetFieldPreview } from './dataset-field-preview.model';
import { DatasetDeclaredOrigin } from './dataset-declared-origin.model';

/**
 * Dataset beskriver en datamängd som användare kan hitta, förstå,
 * begära åtkomst till eller konsumera (03_Informationsmodell.md).
 */
export interface Dataset {
  id: string;
  name: string;
  description: string;
  dataDomain: string;
  owner: string;
  steward: string;
  source: string;
  technicalSource?: string;
  accessModel: string;
  classification: InformationSecurityClassification;
  updateFrequency: string;
  relatedDataServiceIds?: string[];
  relatedSystemIds?: string[];
  relatedGuideIds?: string[];
  relatedOrderTypeIds?: string[];
  metadataSource: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
  /** Fältstruktur med fiktiva exempelvärden, visad före åtkomst är beviljad. Aldrig verklig eller anonymiserad produktionsdata. */
  sampleFields?: DatasetFieldPreview[];
  /**
   * Manuellt deklarerade, omedelbara uppströmskällor (AB-031) i mockläge. Visar det
   * registrerade tekniska ursprunget, inte full eller automatiskt upptäckt lineage,
   * och inte en relation till ett annat katalogobjekt.
   */
  declaredOrigins?: DatasetDeclaredOrigin[];
}

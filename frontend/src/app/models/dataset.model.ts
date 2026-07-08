import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';
import { InformationSecurityClassification } from './information-security-classification.model';

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
}

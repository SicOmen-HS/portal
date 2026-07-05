import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

export type DataClassification = 'open' | 'internal' | 'restricted' | 'confidential';

export const DATA_CLASSIFICATION_LABELS: Record<DataClassification, string> = {
  open: 'Öppen',
  internal: 'Intern',
  restricted: 'Begränsad',
  confidential: 'Konfidentiell',
};

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
  classification: DataClassification;
  updateFrequency: string;
  relatedDataServiceIds?: string[];
  relatedSystemIds?: string[];
  relatedGuideIds?: string[];
  relatedOrderTypeIds?: string[];
  metadataSource: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

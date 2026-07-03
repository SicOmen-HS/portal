import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * InformationMart beskriver en strukturerad informationsprodukt eller
 * konsumtionsyta som bygger på Data Vault 2.1. Ska inte modelleras som en
 * vanlig teknisk komponent (03_Informationsmodell.md).
 */
export interface InformationMart {
  id: string;
  name: string;
  description: string;
  dataDomain: string;
  owner: string;
  ownerTeamId?: string;
  relatedDatasetIds?: string[];
  relatedBusinessApplicationIds?: string[];
  relatedAccessGroupIds?: string[];
  documentationUrl?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

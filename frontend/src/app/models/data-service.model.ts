import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * DataService beskriver en användarnära tjänst eller åtkomstväg för att
 * konsumera, kombinera eller använda data. Skiljer sig från Dataset,
 * som beskriver själva datamängden (03_Informationsmodell.md).
 */
export interface DataService {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  relatedDatasetIds: string[];
  relatedPlatformCapabilityIds: string[];
  technicalComponentIds: string[];
  orderTypeId?: string;
  contactPointId?: string;
  accessRequirements?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

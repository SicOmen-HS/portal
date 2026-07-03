import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * PlatformCapability beskriver en större plattform eller förmåga som flera
 * tjänster kan tillhöra, t.ex. Dataplattform eller AI-plattform.
 */
export interface PlatformCapability {
  id: string;
  name: string;
  description: string;
  businessArea: string;
  ownerTeamId?: string;
  contactPointId?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

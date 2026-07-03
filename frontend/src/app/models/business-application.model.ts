import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * BusinessApplication beskriver en BI-tillämpning, t.ex. en Qlik Sense-app
 * eller dashboard, som konsumerar en eller flera Information Marts.
 */
export interface BusinessApplication {
  id: string;
  name: string;
  description: string;
  systemId?: string;
  informationMartIds: string[];
  ownerTeamId?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

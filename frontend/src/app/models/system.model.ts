import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * System beskriver ett system, verktyg eller en applikation som användaren
 * kan behöva nå eller förstå. Ett system är inte automatiskt en tjänst
 * (03_Informationsmodell.md).
 */
export interface SystemEntity {
  id: string;
  name: string;
  description: string;
  systemType: string;
  ownerTeamId?: string;
  contactPointId?: string;
  linkIds: string[];
  relatedServiceIds?: string[];
  platformCapabilityId?: string;
  authenticationModel?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
  /** Var informationen kommer ifrån, t.ex. "lokal portal-konfiguration". */
  source?: string;
}

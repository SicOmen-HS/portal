import { LifecycleStatus } from './lifecycle-status.model';

/**
 * AccessGroup beskriver en behörighetsgrupp kopplad till ett system eller
 * en informationsprodukt. Endast fiktiva exempelgrupper – aldrig verkliga
 * AD-grupper (00_Projektprinciper.md).
 */
export interface AccessGroup {
  id: string;
  name: string;
  description: string;
  relatedSystemId?: string;
  relatedInformationMartId?: string;
  ownerTeamId?: string;
  lifecycleStatus: LifecycleStatus;
}

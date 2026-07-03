import { LifecycleStatus } from './lifecycle-status.model';

/**
 * Team beskriver ansvarig grupp eller förvaltande enhet.
 * Används som metadata, inte som primär navigation (02_Verksamhetsbeskrivning.md).
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  responsibilityArea: string;
  contactPointId?: string;
  lifecycleStatus: LifecycleStatus;
}

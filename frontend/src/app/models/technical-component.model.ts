import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * TechnicalComponent beskriver en teknisk produkt eller byggsten.
 * Används som metadata/förvaltningsinformation, inte som användarnära navigation
 * (03_Informationsmodell.md, 07_AI_Instruktioner.md).
 */
export interface TechnicalComponent {
  id: string;
  name: string;
  description: string;
  componentType: string;
  platformCapabilityId?: string;
  ownerTeamId?: string;
  lifecycleStatus: LifecycleStatus;
  version?: string;
  /** Nyckel som slås upp mot systemUrls i runtime-config, se SystemUrlService. */
  documentationUrlKey?: string;
  visibility: Visibility;
}

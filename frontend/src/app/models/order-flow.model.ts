import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * OrderFlow beskriver ett övergripande beställningsflöde, formulär eller
 * process för att begära något. Flödet kan ligga i portalen eller peka
 * vidare till ett annat system (03_Informationsmodell.md).
 */
export interface OrderFlow {
  id: string;
  name: string;
  description: string;
  relatedServiceId?: string;
  ownerTeamId?: string;
  targetAudience: string[];
  /** Nyckel som slås upp mot systemUrls i runtime-config, se SystemUrlService – aldrig en verklig intern URL. */
  linkKey?: string;
  handlingInfo?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

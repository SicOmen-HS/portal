import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

/**
 * ServiceOffering beskriver en tjänst som användaren kan hitta, förstå,
 * beställa, använda eller få stöd kring. Ett av portalens viktigaste objekt
 * (03_Informationsmodell.md). Ska beskrivas utifrån användarens behov,
 * inte utifrån underliggande teknik.
 */
export interface ServiceOffering {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  targetAudience: string[];
  ownerTeamId?: string;
  contactPointId?: string;
  platformCapabilityIds: string[];
  relatedSystemIds: string[];
  technicalComponentIds: string[];
  guideIds: string[];
  orderTypeIds: string[];
  relatedServiceIds?: string[];
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
  tags: string[];
  lastUpdated: string;
  source: string;
  featured?: boolean;
  /** Egen ingångsväg när tjänsten har ett fördjupat, dedikerat sidflöde under /tjanster/<slug> istället för den generiska /tjanster/:id-sidan (ADR-0002). Används alltid som canonical route om satt. */
  detailRoute?: string[];
}

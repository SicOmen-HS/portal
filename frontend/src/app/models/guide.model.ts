import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

export type GuideType = 'getting-started' | 'how-to' | 'reference' | 'policy';

export const GUIDE_TYPE_LABELS: Record<GuideType, string> = {
  'getting-started': 'Kom igång',
  'how-to': 'Så gör du',
  reference: 'Referens',
  policy: 'Riktlinje',
};

/**
 * Guide beskriver stödmaterial som hjälper användaren att förstå,
 * komma igång med eller använda en tjänst, plattform eller ett system.
 */
export interface Guide {
  id: string;
  title: string;
  description: string;
  targetAudience: string[];
  guideType: GuideType;
  category: string;
  relatedServiceIds?: string[];
  relatedSystemIds?: string[];
  relatedPlatformCapabilityIds?: string[];
  /** Nyckel som slås upp mot systemUrls i runtime-config, se SystemUrlService. */
  documentationUrlKey: string;
  summary: string;
  ownerTeamId?: string;
  lastUpdated: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

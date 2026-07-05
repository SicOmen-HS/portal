import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

export type SystemLinkType = 'user' | 'admin' | 'documentation' | 'status' | 'order';

export const SYSTEM_LINK_TYPE_LABELS: Record<SystemLinkType, string> = {
  user: 'Användarlänk',
  admin: 'Administrationslänk',
  documentation: 'Dokumentationslänk',
  status: 'Statuslänk',
  order: 'Beställningslänk',
};

/**
 * SystemLink representerar en länk till ett system eller en resurs.
 *
 * Länken pekar aldrig direkt på en URL. Istället beskriver `urlKey` vilken
 * konfigurationsnyckel som ska slås upp i runtime-konfigurationens
 * `systemUrls` (se SystemUrlService och docs/13_Utvecklarguide.md). Det gör
 * att samma mockdata kan återanvändas i alla miljöer – bara `systemUrls`
 * behöver bytas när portalen flyttas.
 */
export interface SystemLink {
  id: string;
  name: string;
  description: string;
  linkType: SystemLinkType;
  /** Nyckel som slås upp mot systemUrls i runtime-config, t.ex. "OPENMETADATA_URL". */
  urlKey: string;
  opensInNewWindow: boolean;
  relatedSystemId?: string;
  targetAudience?: string;
  visibility: Visibility;
  lifecycleStatus: LifecycleStatus;
}

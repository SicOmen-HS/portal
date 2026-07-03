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
 * Repot innehåller endast platshållar-URL:er, se 05_Konfiguration.md.
 */
export interface SystemLink {
  id: string;
  name: string;
  description: string;
  linkType: SystemLinkType;
  /** Exempel-URL (t.ex. https://example.local/...) eller "#" – aldrig en verklig intern URL. */
  url: string;
  opensInNewWindow: boolean;
  relatedSystemId?: string;
  targetAudience?: string;
  visibility: Visibility;
  lifecycleStatus: LifecycleStatus;
}

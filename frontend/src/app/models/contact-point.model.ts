import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';

export type ContactType = 'support-channel' | 'mailbox' | 'ticket-queue' | 'team-contact' | 'documentation';

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  'support-channel': 'Supportkanal',
  mailbox: 'Funktionsbrevlåda',
  'ticket-queue': 'Ärendeväg',
  'team-contact': 'Teamkontakt',
  documentation: 'Dokumentationsyta',
};

/**
 * ContactPoint beskriver en kontaktväg för frågor, support, rådgivning eller förvaltning.
 */
export interface ContactPoint {
  id: string;
  name: string;
  description: string;
  contactType: ContactType;
  /** Konfigurationsnyckel eller platshållarvärde – inga verkliga interna kontaktuppgifter i repot. */
  contactValueKey: string;
  targetAudience: string;
  expectedResponseTime?: string;
  relatedTeamId?: string;
  visibility: Visibility;
  lifecycleStatus: LifecycleStatus;
}

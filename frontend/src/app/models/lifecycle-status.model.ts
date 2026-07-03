/**
 * Livscykelstatus enligt 03_Informationsmodell.md.
 * Tekniska värden är på engelska, visning i UI sker på svenska via LIFECYCLE_STATUS_LABELS.
 */
export type LifecycleStatus =
  | 'planned'
  | 'active'
  | 'under-introduction'
  | 'legacy'
  | 'deprecated'
  | 'retiring'
  | 'retired';

export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
  planned: 'Planerad',
  active: 'Aktiv',
  'under-introduction': 'Under införande',
  legacy: 'Legacy',
  deprecated: 'Avråds',
  retiring: 'Under avveckling',
  retired: 'Avvecklad',
};

export type LifecycleTone = 'success' | 'info' | 'warning' | 'neutral';

export const LIFECYCLE_STATUS_TONE: Record<LifecycleStatus, LifecycleTone> = {
  planned: 'info',
  active: 'success',
  'under-introduction': 'info',
  legacy: 'warning',
  deprecated: 'warning',
  retiring: 'warning',
  retired: 'neutral',
};

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  end?: boolean;
}

/**
 * Applikationslik sidomeny enligt docs/12_Designsystem_och_UI.md.
 * Navigationen speglar portalens informationsområden, inte organisationen.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Hem', path: '/', icon: 'bi-house', end: true },
  { label: 'Tjänster', path: '/tjanster', icon: 'bi-grid' },
  { label: 'System & länkar', path: '/system', icon: 'bi-diagram-3' },
  { label: 'Data & katalog', path: '/data', icon: 'bi-database' },
  { label: 'Guider & dokumentation', path: '/guider', icon: 'bi-book' },
  { label: 'Beställ & få tillgång', path: '/bestall', icon: 'bi-bag-check' },
  { label: 'Status & drift', path: '/status', icon: 'bi-activity' },
  { label: 'Kontakt & support', path: '/kontakt', icon: 'bi-headset' },
  { label: 'Om portalen', path: '/om-portalen', icon: 'bi-info-circle' },
];

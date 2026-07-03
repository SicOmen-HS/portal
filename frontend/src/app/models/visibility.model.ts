/**
 * Synlighetsnivåer enligt 03_Informationsmodell.md.
 */
export type Visibility =
  | 'all-users'
  | 'business-users'
  | 'developers'
  | 'data-scientists'
  | 'maintainers'
  | 'administrators'
  | 'hidden';

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  'all-users': 'Alla användare',
  'business-users': 'Verksamhetsanvändare',
  developers: 'Utvecklare',
  'data-scientists': 'Data scientists',
  maintainers: 'Förvaltare',
  administrators: 'Administratörer',
  hidden: 'Dold',
};

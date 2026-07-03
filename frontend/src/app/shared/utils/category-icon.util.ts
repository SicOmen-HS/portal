/**
 * Enkel mappning mellan kategori/område och Bootstrap Icons.
 * Ikoner ska stödja text, inte ersätta den (docs/12_Designsystem_och_UI.md).
 */
const CATEGORY_ICONS: Record<string, string> = {
  Data: 'bi-database',
  'Business Intelligence': 'bi-bar-chart-line',
  'AI och Machine Learning': 'bi-stars',
  'Generativ AI': 'bi-stars',
  Automation: 'bi-diagram-3',
  Behörighet: 'bi-shield-lock',
  Drift: 'bi-activity',
  Dokumentation: 'bi-book',
  Support: 'bi-headset',
  Beställning: 'bi-bag-check',
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? 'bi-grid';
}

import { Router } from '@angular/router';

/**
 * Delad navigering till den globala söksidan (/sok). Topbaren och startsidans
 * egna sökrutor ska leda hit istället för att var och en hårdkoda sin egen
 * routernavigering (docs/12_Designsystem_och_UI.md: "Sök är en central funktion").
 */
export function navigateToGlobalSearch(router: Router, query: string, extraParams: Record<string, string> = {}): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  router.navigate(['/sok'], { queryParams: { q: trimmed, ...extraParams } });
}

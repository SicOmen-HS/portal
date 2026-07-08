import { Routes } from '@angular/router';

/**
 * Varje sida lazy-loadas som en fristående standalone-komponent
 * (`loadComponent`) istället för att samlas i en NgModule. Det håller den
 * initiala bundlen liten och gör att en ny sida kan läggas till utan att
 * andra sidor påverkas – se docs/13_Utvecklarguide.md#lägga-till-ny-sida.
 *
 * Svenska URL-segment (t.ex. "tjanster", "bestall") används eftersom
 * portalens målgrupp är intern och UI-språket är svenska.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Data- och analysportalen',
  },
  {
    path: 'tjanster',
    loadComponent: () =>
      import('./features/services/service-catalog/service-catalog.component').then(
        (m) => m.ServiceCatalogComponent
      ),
    title: 'Tjänster – Data- och analysportalen',
  },
  // Canonical route för tjänsten Rapporter och dashboards (AN-002, ADR-0002).
  // Åtgärder med egna formulärflöden har dedikerade underroutes; övriga åtgärder är
  // ännu internt state på samma sida eller länkar till en separat portalägd yta.
  // /behov/rapport och den äldre id-baserade /tjanster/service-reports-dashboards-vägen
  // redirectar hit istället för att rendera en egen kopia av sidan.
  {
    path: 'tjanster/rapporter-och-dashboards',
    loadComponent: () => import('./features/needs-catalog/needs-catalog.component').then((m) => m.NeedsCatalogComponent),
    title: 'Rapporter och dashboards – Data- och analysportalen',
  },
  {
    path: 'tjanster/rapporter-och-dashboards/andra-innehall',
    loadComponent: () => import('./features/needs-catalog/needs-catalog.component').then((m) => m.NeedsCatalogComponent),
    title: 'Ändra innehåll eller utseende – Rapporter och dashboards – Data- och analysportalen',
    data: { actionId: 'change' },
  },
  {
    path: 'tjanster/rapporter-och-dashboards/lagg-till-data',
    loadComponent: () => import('./features/needs-catalog/needs-catalog.component').then((m) => m.NeedsCatalogComponent),
    title: 'Lägg till eller ändra data – Rapporter och dashboards – Data- och analysportalen',
    data: { actionId: 'data' },
  },
  {
    path: 'tjanster/rapporter-och-dashboards/behorighet-och-ansvar',
    loadComponent: () =>
      import('./features/access-responsibility-form/access-responsibility-form.component').then(
        (m) => m.AccessResponsibilityFormComponent
      ),
    title: 'Hantera behörighet och ansvar – Rapporter och dashboards – Data- och analysportalen',
  },
  {
    path: 'tjanster/rapporter-och-dashboards/skapa-ny-rapport-dashboard',
    loadComponent: () =>
      import('./features/new-report-request/new-report-request.component').then(
        (m) => m.NewReportRequestComponent
      ),
    title: 'Skapa ny rapport eller dashboard – Rapporter och dashboards – Data- och analysportalen',
  },
  {
    path: 'tjanster/datamarknad',
    loadComponent: () => import('./features/data-market/data-market.component').then((m) => m.DataMarketComponent),
    title: 'Datamarknad – Data- och analysportalen',
  },
  {
    path: 'tjanster/datamarknad/behorighet-och-ansvar',
    loadComponent: () =>
      import('./features/data-market/data-market-access.component').then((m) => m.DataMarketAccessComponent),
    title: 'Hantera behörighet och ansvar – Datamarknad – Data- och analysportalen',
  },
  { path: 'tjanster/service-reports-dashboards', redirectTo: 'tjanster/rapporter-och-dashboards' },
  {
    path: 'tjanster/:id',
    loadComponent: () =>
      import('./features/services/service-detail/service-detail.component').then(
        (m) => m.ServiceDetailComponent
      ),
    title: 'Tjänst – Data- och analysportalen',
  },
  {
    path: 'system',
    loadComponent: () => import('./features/systems/systems.component').then((m) => m.SystemsComponent),
    title: 'System & länkar – Data- och analysportalen',
  },
  {
    path: 'sok',
    loadComponent: () => import('./features/search-results/search-results.component').then((m) => m.SearchResultsComponent),
    title: 'Sök – Data- och analysportalen',
  },
  // Behovsingång, alias för tjänstens canonical route (ADR-0002) – ingen egen sida.
  { path: 'behov/rapport', redirectTo: 'tjanster/rapporter-och-dashboards' },
  {
    path: 'data',
    loadComponent: () =>
      import('./features/data-catalog/data-catalog.component').then((m) => m.DataCatalogPageComponent),
    title: 'Data & katalog – Data- och analysportalen',
  },
  {
    path: 'data/dataprodukt/:id',
    loadComponent: () =>
      import('./features/data-product-detail/data-product-detail.component').then(
        (m) => m.DataProductDetailComponent
      ),
    title: 'Dataprodukt – Data- och analysportalen',
  },
  {
    path: 'data/:id',
    loadComponent: () => import('./features/data-detail/data-detail.component').then((m) => m.DataDetailComponent),
    title: 'Datamängd – Data- och analysportalen',
  },
  {
    path: 'guider',
    loadComponent: () => import('./features/guides/guides.component').then((m) => m.GuidesComponent),
    title: 'Guider & dokumentation – Data- och analysportalen',
  },
  {
    path: 'bestall',
    loadComponent: () =>
      import('./features/orders/order-catalog/order-catalog.component').then(
        (m) => m.OrderCatalogComponent
      ),
    title: 'Beställ & få tillgång – Data- och analysportalen',
  },
  {
    path: 'bestall/:id',
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent
      ),
    title: 'Beställning – Data- och analysportalen',
  },
  {
    path: 'status',
    loadComponent: () => import('./features/status/status.component').then((m) => m.StatusPageComponent),
    title: 'Status & drift – Data- och analysportalen',
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./features/support/support.component').then((m) => m.SupportComponent),
    title: 'Kontakt & support – Data- och analysportalen',
  },
  {
    path: 'om-portalen',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
    title: 'Om portalen – Data- och analysportalen',
  },
  { path: '**', redirectTo: '' },
];

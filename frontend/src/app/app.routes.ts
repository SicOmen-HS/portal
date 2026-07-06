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
  {
    path: 'behov/rapport',
    loadComponent: () => import('./features/needs-catalog/needs-catalog.component').then((m) => m.NeedsCatalogComponent),
    title: 'Rapporter och dashboards – Data- och analysportalen',
  },
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

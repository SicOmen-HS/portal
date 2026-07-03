import { Routes } from '@angular/router';

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
    path: 'data',
    loadComponent: () =>
      import('./features/data-catalog/data-catalog.component').then((m) => m.DataCatalogPageComponent),
    title: 'Data & katalog – Data- och analysportalen',
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

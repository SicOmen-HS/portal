import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';
import { OrderCardComponent } from '../../shared/components/order-card/order-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ServiceOfferingService } from '../../services/service-offering.service';
import { OrderService } from '../../services/order.service';
import { StatusService } from '../../services/status.service';

interface ShortcutTile {
  title: string;
  description: string;
  icon: string;
  routerLink: string[];
}

const SHORTCUTS: ShortcutTile[] = [
  {
    title: 'Hitta data',
    description: 'Sök och utforska datamängder, Information Marts och datatjänster.',
    icon: 'bi-database',
    routerLink: ['/data'],
  },
  {
    title: 'Beställ dashboard',
    description: 'Beställ rapporter och färdiga dashboards.',
    icon: 'bi-bar-chart-line',
    routerLink: ['/tjanster', 'service-order-dashboard'],
  },
  {
    title: 'Beställ AI-yta',
    description: 'Beställ ytor för AI, ML och experiment.',
    icon: 'bi-stars',
    routerLink: ['/tjanster', 'service-order-ai-ml-yta'],
  },
  {
    title: 'Hitta system',
    description: 'Snabba länkar till system och plattformar.',
    icon: 'bi-diagram-3',
    routerLink: ['/system'],
  },
];

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    RouterLink,
    SearchBoxComponent,
    ServiceCardComponent,
    OrderCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly serviceOfferings = inject(ServiceOfferingService);
  private readonly orders = inject(OrderService);
  private readonly statusService = inject(StatusService);

  protected readonly shortcuts = SHORTCUTS;
  protected readonly featuredServices$ = this.serviceOfferings.getFeatured();
  protected readonly highlightedOrders$ = this.orders
    .getAllOrderTypes()
    .pipe(map((items) => items.slice(0, 3)));
  protected readonly status$ = this.statusService.getStatus();

  onSearch(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return;
    }
    this.router.navigate(['/tjanster'], { queryParams: { q: trimmed } });
  }
}

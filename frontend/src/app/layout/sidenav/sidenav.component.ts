import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  protected readonly primaryItems = NAV_ITEMS.filter((item) => item.primary);
  protected readonly secondaryItems = NAV_ITEMS.filter((item) => !item.primary);

  /** Om övriga menyval (utöver Hem och Tjänster) ska visas. */
  readonly expanded = input(false);

  readonly linkActivated = output<void>();
  readonly expandedToggle = output<void>();
}

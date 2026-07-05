import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidenavComponent, TopbarComponent, FooterComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly router = inject(Router);
  protected readonly mobileNavOpen = signal(false);
  protected readonly homeNavExpanded = signal(false);
  protected readonly isHome = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split('?')[0] === '/'),
      startWith(this.router.url.split('?')[0] === '/')
    ),
    { initialValue: true }
  );
  protected readonly navCollapsed = computed(() => this.isHome() && !this.homeNavExpanded());

  toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  toggleDesktopNav(): void { this.homeNavExpanded.update((expanded) => !expanded); }
}

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { StatusService } from '../../services/status.service';
import { navigateToGlobalSearch } from '../../core/search/search-navigation';

type MockupVariant = 'a' | 'b' | 'c';

interface NeedTile {
  title: string;
  description: string;
  icon: string;
  routerLink: string[];
}

interface SearchSuggestion {
  type: 'Behov' | 'Datamängd' | 'Guide' | 'Beställning' | 'System';
  title: string;
  description: string;
  routerLink: string[];
  action: string;
}

const NEEDS: NeedTile[] = [
  { title: 'Rapporter och dashboards', description: 'Välj åtgärd, se process och starta rätt väg.', icon: 'bi-bar-chart-line', routerLink: ['/tjanster', 'rapporter-och-dashboards'] },
  { title: 'Hitta data till en rapport', description: 'Utforska data och konsumtionsklara ytor.', icon: 'bi-database', routerLink: ['/data'] },
  { title: 'Få åtkomst eller ändra behörighet', description: 'Hitta rätt åtkomstväg och förutsättningar.', icon: 'bi-key', routerLink: ['/bestall', 'order-type-access-group'] },
  { title: 'Beställ AI- eller ML-yta', description: 'Förbered ett säkert, avgränsat experiment.', icon: 'bi-stars', routerLink: ['/bestall', 'order-type-ai-ml-yta'] },
  { title: 'Hitta guide eller dokumentation', description: 'Kom igång utan att känna till plattformen.', icon: 'bi-book', routerLink: ['/guider'] },
  { title: 'Hitta systemlänk', description: 'Öppna rätt verktyg via konfigurerade länkar.', icon: 'bi-box-arrow-up-right', routerLink: ['/system'] },
  { title: 'Skapa eller ändra larm', description: 'Fånga avvikelser innan användaren gör det.', icon: 'bi-bell', routerLink: ['/bestall', 'order-type-alarm'] },
  { title: 'Få hjälp av rätt kontaktväg', description: 'Beskriv behovet så guidar vi dig vidare.', icon: 'bi-headset', routerLink: ['/kontakt'] },
];

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, SearchBoxComponent, StatusBadgeComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './home-search.component.scss', './home-wide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly statusService = inject(StatusService);
  private readonly routeVariant = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('variant'))), { initialValue: 'b' });
  protected readonly variant = computed<MockupVariant>(() => ['a', 'b', 'c'].includes(this.routeVariant() ?? '') ? this.routeVariant() as MockupVariant : 'b');
  protected readonly searchFocused = signal(false);
  protected readonly suggestionQuery = signal('');
  protected readonly showIntroduction = signal(false);
  protected readonly needs = NEEDS;
  protected readonly status$ = this.statusService.getStatus();
  protected readonly variantLabel = computed(() => ({ a: 'Behovsstyrd arbetsyta', b: 'Minimal sökportal', c: 'Datamarknad' })[this.variant()]);
  protected readonly suggestions: SearchSuggestion[] = [
    { type: 'Behov', title: 'Jag vill göra något med en rapport', description: 'Välj åtgärd och se rätt process', routerLink: ['/tjanster', 'rapporter-och-dashboards'], action: 'Visa process' },
    { type: 'Datamängd', title: 'Exempel Försäljningstransaktioner', description: 'Försäljning · Åtkomst krävs', routerLink: ['/data', 'dataset-sales-transactions-demo'], action: 'Se datamängd' },
    { type: 'Guide', title: 'Så beställer du en dashboard', description: 'Kom igång · Steg för steg', routerLink: ['/guider'], action: 'Läs guide' },
    { type: 'Beställning', title: 'Ny BI-tillämpning', description: 'Business Intelligence · 5 steg', routerLink: ['/bestall', 'order-type-new-bi-app'], action: 'Starta beställning' },
    { type: 'System', title: 'Qlik Sense', description: 'Dashboard och självbetjäningsanalys', routerLink: ['/system'], action: 'Visa system' },
  ];
  protected readonly filteredSuggestions = computed(() => {
    const query = this.suggestionQuery().trim().toLowerCase();
    return this.suggestions.filter((item) => !query || `${item.title} ${item.description}`.toLowerCase().includes(query)).slice(0, 5);
  });

  onSearch(query: string): void {
    navigateToGlobalSearch(this.router, query, { variant: this.variant() });
  }

  openSuggestion(suggestion: SearchSuggestion): void {
    this.router.navigate(suggestion.routerLink);
  }

  onSuggestionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchFocused.set(false);
      event.preventDefault();
      return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const buttons = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('.suggestions button')
    );
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
    event.preventDefault();
  }
}

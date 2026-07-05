import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, SearchBoxComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();
  readonly showSearch = input(true);

  onSearch(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return;
    }
    this.router.navigate(['/sok'], { queryParams: { q: trimmed } });
  }
}

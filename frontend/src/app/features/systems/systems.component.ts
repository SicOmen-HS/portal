import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { SystemCardComponent } from '../../shared/components/system-card/system-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SystemService } from '../../services/system.service';
import { SystemLink } from '../../models';

@Component({
  selector: 'app-systems',
  imports: [PageHeaderComponent, SearchBoxComponent, SystemCardComponent, EmptyStateComponent],
  templateUrl: './systems.component.html',
  styleUrl: './systems.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemsComponent {
  private readonly systemService = inject(SystemService);

  private readonly systems = toSignal(this.systemService.getAll(), { initialValue: [] });
  private readonly links = toSignal(this.systemService.getAllLinks(), { initialValue: [] });

  protected readonly searchTerm = signal('');

  protected readonly filteredSystems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (term.length === 0) {
      return this.systems();
    }
    return this.systems().filter(
      (system) =>
        system.name.toLowerCase().includes(term) ||
        system.description.toLowerCase().includes(term) ||
        system.systemType.toLowerCase().includes(term)
    );
  });

  primaryLinkFor(systemId: string, linkIds: string[]): SystemLink | undefined {
    const systemLinks = this.links().filter((link) => linkIds.includes(link.id));
    return systemLinks.find((link) => link.linkType === 'user') ?? systemLinks[0];
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }
}

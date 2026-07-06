import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SelectableObject {
  id: string;
  title: string;
  type?: string;
  meta?: string;
  description?: string;
}

@Component({
  selector: 'app-object-selector',
  template: `
    <div class="objects" [class.compact]="compact()">
      @for (item of items(); track item.id) {
        <label [class.selected]="selectedIds().includes(item.id)">
          <input type="checkbox" [checked]="selectedIds().includes(item.id)" (change)="toggle(item.id)" />
          <span><strong>{{ item.title }}</strong>@if (item.type || item.meta) { <small>{{ item.type }}@if (item.type && item.meta) { · }{{ item.meta }}</small> }@if (item.description) { <small>{{ item.description }}</small> }</span>
        </label>
      }
    </div>
  `,
  styles: [`
    .objects { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
    label { display: flex; gap: var(--space-3); align-items: flex-start; border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); padding: var(--space-3); min-height: 4.75rem; cursor: pointer; background: white; }
    label.selected { border-color: #287581; box-shadow: 0 0 0 2px rgba(40,117,129,.14); background: #f3f8f8; }
    input { width: 1.15rem; height: 1.15rem; margin-top: .15rem; flex: 0 0 auto; } span, small { display: block; } small { color: var(--color-gray-600); margin-top: var(--space-1); }
    .compact { grid-template-columns: repeat(3, 1fr); } .compact label { min-height: 3rem; align-items: center; }
    input:focus-visible { outline: 3px solid #287581; outline-offset: 3px; }
    @media (max-width: 750px) { .objects, .compact { grid-template-columns: 1fr; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectSelectorComponent {
  readonly items = input.required<SelectableObject[]>();
  readonly selectedIds = input.required<string[]>();
  readonly compact = input(false);
  readonly selectionChange = output<string[]>();
  protected toggle(id: string): void { const values = this.selectedIds(); this.selectionChange.emit(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]); }
}

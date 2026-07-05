import { ChangeDetectionStrategy, Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Återanvändbar sökruta. Komponenten äger endast presentationen –
 * själva söklogiken hanteras av anropande sida/SearchService.
 */
@Component({
  selector: 'app-search-box',
  imports: [FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent implements OnInit {
  readonly placeholder = input('Sök i portalen...');
  readonly buttonLabel = input('Sök');
  readonly ariaLabel = input('Sök i portalen');
  readonly initialValue = input('');

  readonly queryChange = output<string>();
  readonly searchSubmit = output<string>();
  readonly focusChange = output<boolean>();

  protected value = '';

  ngOnInit(): void {
    this.value = this.initialValue();
  }

  onInput(newValue: string): void {
    this.value = newValue;
    this.queryChange.emit(newValue);
  }

  onSubmit(): void {
    this.searchSubmit.emit(this.value);
  }

  onFocus(): void { this.focusChange.emit(true); }
  onBlur(): void { window.setTimeout(() => this.focusChange.emit(false), 120); }
}

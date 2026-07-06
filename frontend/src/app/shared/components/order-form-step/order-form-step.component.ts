import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-order-form-step',
  template: `
    <section class="form-step" [class.active]="active()" [class.complete]="complete()" [class.locked]="locked()">
      <button class="step-heading" type="button" [disabled]="locked()" [attr.aria-expanded]="active()" [attr.aria-controls]="panelId()" (click)="open.emit()">
        <span class="state" aria-hidden="true">@if (complete()) { <i class="bi bi-check-lg"></i> } @else { {{ stepNumber() }} }</span>
        <span class="heading-text"><strong>{{ title() }}</strong>@if (!active() && summary()) { <small>{{ summary() }}</small> } @else if (locked()) { <small>Slutför föregående steg för att fortsätta</small> }</span>
        @if (complete() && !active()) { <span class="edit">Ändra</span> }
      </button>
      @if (active()) { <div class="step-panel" [id]="panelId()"><ng-content /></div> }
    </section>
  `,
  styles: [`
    .form-step { border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); background: white; overflow: hidden; }
    .form-step + .form-step { margin-top: var(--space-3); }
    .step-heading { width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--space-3); border: 0; background: white; padding: var(--space-4); text-align: left; color: inherit; }
    .step-heading:not(:disabled) { cursor: pointer; } .step-heading:focus-visible { outline: 3px solid #287581; outline-offset: -3px; }
    .state { display: grid; place-items: center; width: 2rem; height: 2rem; border: 2px solid #287581; border-radius: 50%; color: #287581; font-weight: 700; }
    .heading-text, .heading-text small { display: block; } .heading-text small { color: var(--color-gray-600); margin-top: var(--space-1); font-weight: 400; }
    .edit { color: var(--color-brand-red); font-weight: 700; } .active { border-color: #287581; box-shadow: 0 0 0 2px rgba(40,117,129,.12); }
    .active .step-heading { background: #f3f8f8; } .complete .state { color: white; background: #287581; } .locked .step-heading { background: var(--color-gray-100); color: var(--color-gray-600); }
    .step-panel { padding: var(--space-5); border-top: 1px solid var(--color-gray-300); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormStepComponent {
  readonly stepNumber = input.required<number>(); readonly title = input.required<string>(); readonly active = input(false);
  readonly complete = input(false); readonly locked = input(false); readonly summary = input(''); readonly open = output<void>();
  protected panelId(): string { return `order-form-step-${this.stepNumber()}`; }
}

import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

export interface ProcessStepView {
  title: string;
  description: string;
}

@Component({
  selector: 'app-process-stepper',
  template: `
    <section class="stepper" aria-labelledby="stepper-heading">
      <h2 id="stepper-heading">Så går det till</h2>
      <ol>
        @for (step of steps(); track step.title; let index = $index) {
          <li>
            <button type="button" (click)="toggle(index)" [attr.aria-expanded]="openStep() === index" [attr.aria-controls]="'step-help-' + index">
              <i class="bi bi-info-circle" aria-hidden="true"></i><span class="visually-hidden">Information om {{ step.title }}</span>
            </button>
            <span class="number" aria-hidden="true">{{ index + 1 }}</span>
            <strong>{{ step.title }}</strong>
            @if (openStep() === index) { <p [id]="'step-help-' + index">{{ step.description }}</p> }
          </li>
        }
      </ol>
    </section>
  `,
  styles: [`
    .stepper { margin-bottom: var(--space-7); } h2 { margin-bottom: var(--space-4); }
    ol { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-2); }
    li { position: relative; display: grid; justify-items: start; color: var(--color-gray-600); font-size: .82rem; min-width: 0; }
    li:not(:last-child)::after { content: ''; position: absolute; z-index: 0; height: 2px; background: #9ebfc4; top: 3.75rem; left: 2.35rem; right: calc(-1 * var(--space-2)); }
    .number { position: relative; z-index: 1; display: grid; place-items: center; width: 2rem; height: 2rem; color: white; background: #287581; border-radius: 50%; margin-bottom: var(--space-2); }
    button { border: 0; background: transparent; color: #287581; min-width: 2rem; min-height: 2.5rem; padding: 0; }
    button:focus-visible { outline: 3px solid #287581; outline-offset: 2px; }
    p { position: absolute; z-index: 2; top: 6rem; left: 0; width: min(18rem, 80vw); padding: var(--space-3); background: white; border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); box-shadow: 0 .5rem 1.5rem rgba(20,45,50,.14); color: var(--color-gray-700); }
    @media (max-width: 900px) { ol { grid-template-columns: repeat(3, 1fr); } li:nth-child(3n)::after { display: none; } }
    @media (max-width: 650px) { ol { grid-template-columns: 1fr; } li { grid-template-columns: auto auto 1fr; align-items: center; gap: var(--space-2); } li::after { display: none; } button { grid-column: 1; } .number { grid-column: 2; grid-row: 1; margin: 0; } strong { grid-column: 3; grid-row: 1; } p { position: static; grid-column: 1 / -1; width: auto; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessStepperComponent {
  readonly steps = input.required<ProcessStepView[]>();
  protected readonly openStep = signal<number | null>(null);
  protected toggle(index: number): void { this.openStep.update((current) => current === index ? null : index); }
}

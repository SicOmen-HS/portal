import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ReviewEntry { label: string; value: string; }

@Component({
  selector: 'app-review-summary',
  template: `<section class="review" aria-labelledby="review-heading"><p class="eyebrow">Granska</p><h2 id="review-heading" tabindex="-1">Sammanfattning före inskick</h2><dl>@for (entry of entries(); track entry.label) { <div><dt>{{ entry.label }}</dt><dd>{{ entry.value || 'Inte angivet' }}</dd></div> }</dl></section>`,
  styles: [`
    .review { background: #f3f7f8; border-top: 4px solid #287581; border-radius: var(--radius-md); padding: var(--space-5); }
    .eyebrow { color: var(--color-brand-red); font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }
    dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); margin: var(--space-4) 0 0; } dl div { background: white; padding: var(--space-3); border-radius: var(--radius-md); } dt { font-size: .8rem; color: var(--color-gray-600); } dd { margin: var(--space-1) 0 0; white-space: pre-wrap; }
    @media (max-width: 650px) { dl { grid-template-columns: 1fr; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewSummaryComponent { readonly entries = input.required<ReviewEntry[]>(); }

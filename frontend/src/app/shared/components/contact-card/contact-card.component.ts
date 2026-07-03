import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CONTACT_TYPE_LABELS, ContactPoint } from '../../../models';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCardComponent {
  readonly contact = input.required<ContactPoint>();
  protected readonly contactTypeLabels = CONTACT_TYPE_LABELS;
}

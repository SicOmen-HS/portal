import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccessResponsibilityFormComponent } from '../access-responsibility-form/access-responsibility-form.component';

@Component({
  selector: 'app-data-market-access',
  imports: [AccessResponsibilityFormComponent],
  template: `<app-access-responsibility-form serviceContextLabel="Datamarknad" [returnRoute]="['/tjanster', 'datamarknad']" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataMarketAccessComponent {}

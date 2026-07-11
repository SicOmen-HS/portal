import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatasetFieldPreview } from '../../../models';

/**
 * Visar ett dataobjekts fältstruktur och en syntetisk exempelrad härledd
 * från samma fältlista. Byggd för Dataset men skriven generiskt (objectLabel)
 * så mönstret kan återanvändas för InformationMart i ett senare AB.
 * Exempelvärdena är alltid fiktiva/syntetiska, oavsett dataobjektets
 * informationssäkerhetsklassning.
 */
@Component({
  selector: 'app-dataset-fields-preview',
  templateUrl: './dataset-fields-preview.component.html',
  styleUrl: './dataset-fields-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetFieldsPreviewComponent {
  readonly fields = input.required<DatasetFieldPreview[]>();
  readonly objectLabel = input<string>('dataobjektet');
}

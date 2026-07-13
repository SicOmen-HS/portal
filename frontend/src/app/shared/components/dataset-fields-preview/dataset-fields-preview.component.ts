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
  /**
   * Riktiga previewrader, t.ex. hämtade från ett lokalt API (AB-027). Saknas
   * denna input helt visas istället en syntetisk rad härledd från fields().
   */
  readonly previewRows = input<string[][] | undefined>(undefined);
  /**
   * Sant om en riktig previewkälla misslyckades. Visar då ett kontrollerat
   * felmeddelande istället för previewtabellen - ingen tyst fallback.
   */
  readonly previewError = input<boolean>(false);
}

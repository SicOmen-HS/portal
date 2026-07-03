import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-about',
  imports: [PageHeaderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly version = '0.1.0 (mockup)';
  protected readonly docs = [
    { file: '00_Projektprinciper.md', description: 'Projektets grundprinciper' },
    { file: '01_Projektvision.md', description: 'Varför portalen finns och vilken nytta den ska skapa' },
    { file: '02_Verksamhetsbeskrivning.md', description: 'Verksamhetsdomänen portalen är byggd för' },
    { file: '03_Informationsmodell.md', description: 'Portalens centrala informationsobjekt' },
    { file: '04_Systemarkitektur.md', description: 'Övergripande systemarkitektur' },
    { file: '05_Konfiguration.md', description: 'Principer för konfiguration och secrets' },
    { file: '06_Utvecklingsprinciper.md', description: 'Hur portalen ska utvecklas och struktureras' },
    { file: '12_Designsystem_och_UI.md', description: 'Design- och UI-principer' },
  ];
}

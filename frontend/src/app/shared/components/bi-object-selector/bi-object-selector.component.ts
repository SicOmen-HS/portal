import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ReportingAsset,
  ReportingContainer,
  reportingApprovalMessage,
  REPORTING_ASSET_SELECT_LABELS,
  REPORTING_CONTAINER_SELECT_LABELS,
  SystemEntity,
} from '../../../models';

export interface BiObjectSelectionChange {
  systemId: string;
  containerId: string;
  assetId: string;
}

/**
 * Hierarkiskt val av BI-system, container (ström/mapp) och rapport-/dashboardobjekt.
 * Etiketterna anpassas per containertyp/assettyp istället för att vara hårdkodade per
 * system, så komponenten fungerar oförändrad om ett fjärde BI-system läggs till – se
 * docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md.
 */
@Component({
  selector: 'app-bi-object-selector',
  template: `
    <div class="bi-object-selector">
      <label class="field">
        Välj system
        <select (change)="onSystemChange($any($event.target).value)">
          <option value="" [selected]="!systemId()">Välj system</option>
          @for (system of systems(); track system.id) {
            <option [value]="system.id" [selected]="system.id === systemId()">{{ system.name }}</option>
          }
        </select>
      </label>

      @if (systemId()) {
        <label class="field">
          {{ containerSelectLabel() }}
          <select (change)="onContainerChange($any($event.target).value)">
            <option value="" [selected]="!containerId()">{{ containerSelectLabel() }}</option>
            @for (container of filteredContainers(); track container.id) {
              <option [value]="container.id" [selected]="container.id === containerId()">{{ container.name }}</option>
            }
          </select>
        </label>
      }

      @if (containerId()) {
        <label class="field">
          {{ assetSelectLabel() }}
          <select (change)="onAssetChange($any($event.target).value)">
            <option value="" [selected]="!assetId()">{{ assetSelectLabel() }}</option>
            @for (asset of filteredAssets(); track asset.id) {
              <option [value]="asset.id" [selected]="asset.id === assetId()">{{ asset.name }}</option>
            }
          </select>
        </label>
      }

      @if (selectedAsset(); as asset) {
        <div class="bi-object-meta">
          <p><strong>Ansvarig:</strong> {{ asset.responsibleLabel }}</p>
          <p class="field-help">Den ansvariga personen eller funktionen kan behöva godkänna ändringen innan arbetet påbörjas.</p>
          <p class="field-help">Senast synkad (mockad): {{ asset.lastSyncedAt }}</p>
          <p class="approval-message">{{ approvalMessage() }}</p>
          <fieldset class="responsible-toggle">
            <legend>Är beställaren ansvarig för det valda objektet i den här demon?</legend>
            <label><input type="radio" name="requesterResponsible" [checked]="requesterIsResponsible()" (change)="requesterResponsibleChange.emit(true)" /> Ja</label>
            <label><input type="radio" name="requesterResponsible" [checked]="!requesterIsResponsible()" (change)="requesterResponsibleChange.emit(false)" /> Nej</label>
          </fieldset>
        </div>
      }

      <p class="field-help">Objekten är mockade i denna prototyp och motsvarar senare metadata från portalens read model.</p>
    </div>
  `,
  styles: [`
    .bi-object-selector { display: grid; gap: var(--space-4); }
    .field { display: grid; gap: var(--space-2); font-weight: 700; }
    .field select { border: 1px solid var(--color-gray-400); border-radius: var(--radius-md); padding: var(--space-3); font: inherit; font-weight: 400; background: white; }
    .field-help { color: var(--color-gray-600); font-weight: 400; margin: 0; }
    .bi-object-meta { background: #f3f8f8; border-radius: var(--radius-md); padding: var(--space-4); display: grid; gap: var(--space-2); }
    .bi-object-meta p { margin: 0; }
    .approval-message { font-weight: 700; }
    .responsible-toggle { border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); background: white; padding: var(--space-3) var(--space-4); display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); }
    .responsible-toggle legend { font-weight: 700; padding: 0 var(--space-2); }
    .responsible-toggle label { display: inline-flex; align-items: center; gap: var(--space-2); font-weight: 400; }
    .responsible-toggle input { width: 1.15rem; height: 1.15rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiObjectSelectorComponent {
  readonly systems = input.required<SystemEntity[]>();
  readonly containers = input.required<ReportingContainer[]>();
  readonly assets = input.required<ReportingAsset[]>();
  readonly systemId = input('');
  readonly containerId = input('');
  readonly assetId = input('');
  readonly requesterIsResponsible = input(false);
  readonly selectionChange = output<BiObjectSelectionChange>();
  readonly requesterResponsibleChange = output<boolean>();

  protected readonly filteredContainers = computed(() =>
    this.containers().filter((container) => container.systemId === this.systemId())
  );
  protected readonly filteredAssets = computed(() =>
    this.assets().filter((asset) => asset.containerId === this.containerId())
  );
  protected readonly selectedAsset = computed(() => this.assets().find((asset) => asset.id === this.assetId()));
  protected readonly approvalMessage = computed(() => reportingApprovalMessage(this.selectedAsset(), this.requesterIsResponsible()));

  protected readonly containerSelectLabel = computed(() => {
    const containerType = this.containers().find((container) => container.systemId === this.systemId())?.containerType;
    return containerType ? REPORTING_CONTAINER_SELECT_LABELS[containerType] : 'Välj container';
  });

  protected readonly assetSelectLabel = computed(() => {
    const assetType = this.assets().find((asset) => asset.containerId === this.containerId())?.assetType;
    return assetType ? REPORTING_ASSET_SELECT_LABELS[assetType] : 'Välj objekt';
  });

  onSystemChange(systemId: string): void {
    this.selectionChange.emit({ systemId, containerId: '', assetId: '' });
  }

  onContainerChange(containerId: string): void {
    this.selectionChange.emit({ systemId: this.systemId(), containerId, assetId: '' });
  }

  onAssetChange(assetId: string): void {
    this.selectionChange.emit({ systemId: this.systemId(), containerId: this.containerId(), assetId });
  }
}

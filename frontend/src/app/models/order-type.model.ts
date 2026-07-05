import { Visibility } from './visibility.model';
import { LifecycleStatus } from './lifecycle-status.model';
import { OrderStep } from './order-step.model';
import { OrderDependency } from './order-dependency.model';

export type FulfillmentMode = 'manual' | 'automated' | 'partially-automated';

export const FULFILLMENT_MODE_LABELS: Record<FulfillmentMode, string> = {
  manual: 'Manuell hantering',
  automated: 'Automatiserad hantering',
  'partially-automated': 'Delvis automatiserad hantering',
};

/**
 * OrderType beskriver en specifik typ av beställning användaren kan göra,
 * t.ex. "Ny datamängd" eller "Beställ larm" (03_Informationsmodell.md).
 * Skiljer sig från OrderFlow som beskriver själva flödet/processen.
 */
export interface OrderType {
  id: string;
  name: string;
  description: string;
  category: string;
  relatedServiceId?: string;
  relatedPlatformCapabilityId?: string;
  targetAudience: string[];
  ownerTeamId?: string;
  orderFlowId: string;
  prerequisites: string[];
  dependencies: OrderDependency[];
  requiresApproval: boolean;
  fulfillmentMode: FulfillmentMode;
  steps: OrderStep[];
  relatedResources?: string[];
  /** Nyckel som slås upp mot systemUrls i runtime-config, se SystemUrlService. */
  documentationUrlKey?: string;
  lifecycleStatus: LifecycleStatus;
  visibility: Visibility;
}

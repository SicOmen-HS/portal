export type OrderStepExecutionMode =
  | 'manual'
  | 'automated'
  | 'partially-automated'
  | 'external'
  | 'future-automation-candidate';

export const ORDER_STEP_EXECUTION_MODE_LABELS: Record<OrderStepExecutionMode, string> = {
  manual: 'Manuellt',
  automated: 'Automatiserat',
  'partially-automated': 'Delvis automatiserat',
  external: 'Externt',
  'future-automation-candidate': 'Framtida automatiseringskandidat',
};

/**
 * OrderStep beskriver ett steg som kan ingå i ett beställningsflöde
 * (03_Informationsmodell.md). Ordersteg kan återanvändas mellan flöden.
 */
export interface OrderStep {
  id: string;
  name: string;
  description: string;
  stepOrder: number;
  executionMode: OrderStepExecutionMode;
  userVisible: boolean;
  ownerTeamId?: string;
  systemsAffected?: string[];
}

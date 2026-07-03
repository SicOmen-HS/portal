export type StatusType = 'incident' | 'maintenance' | 'informational' | 'resolved';

export const STATUS_TYPE_LABELS: Record<StatusType, string> = {
  incident: 'Incident',
  maintenance: 'Planerat underhåll',
  informational: 'Information',
  resolved: 'Löst',
};

export type StatusSeverity = 'low' | 'medium' | 'high';

export const STATUS_SEVERITY_LABELS: Record<StatusSeverity, string> = {
  low: 'Låg påverkan',
  medium: 'Medelhög påverkan',
  high: 'Hög påverkan',
};

/**
 * StatusItem beskriver driftstatus, planerade avbrott, incidenter eller
 * annan statusinformation (03_Informationsmodell.md).
 */
export interface StatusItem {
  id: string;
  title: string;
  description: string;
  statusType: StatusType;
  severity: StatusSeverity;
  startTime: string;
  endTime?: string;
  impact: string;
  relatedServiceIds?: string[];
  relatedSystemIds?: string[];
  ownerTeamId?: string;
  lastUpdated: string;
}

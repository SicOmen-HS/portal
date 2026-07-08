/** Gemensam informationssäkerhetsklassning för katalogens dataobjekt (ADR-0006). */
export type InformationSecurityClassification =
  | 'open'
  | 'internal'
  | 'sensitive'
  | 'highly-sensitive';

export const INFORMATION_SECURITY_CLASSIFICATION_LABELS: Record<InformationSecurityClassification, string> = {
  open: 'Öppen data',
  internal: 'Intern data',
  sensitive: 'Känslig',
  'highly-sensitive': 'Mycket känslig',
};

export const INFORMATION_SECURITY_CLASSIFICATION_ORDER: readonly InformationSecurityClassification[] = [
  'open',
  'internal',
  'sensitive',
  'highly-sensitive',
];

export function highestInformationSecurityClassification(
  values: readonly InformationSecurityClassification[]
): InformationSecurityClassification | undefined {
  return values.reduce<InformationSecurityClassification | undefined>((highest, value) =>
    highest === undefined || INFORMATION_SECURITY_CLASSIFICATION_ORDER.indexOf(value) > INFORMATION_SECURITY_CLASSIFICATION_ORDER.indexOf(highest)
      ? value
      : highest, undefined);
}

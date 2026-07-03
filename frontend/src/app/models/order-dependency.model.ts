/**
 * OrderDependency beskriver ett beroende mellan beställningar, steg,
 * resurser eller system (03_Informationsmodell.md).
 */
export interface OrderDependency {
  id: string;
  name: string;
  description: string;
  dependencyType: string;
  /** Namn eller id på beroendets källa, t.ex. en OrderType eller resurs. */
  from: string;
  /** Namn eller id på beroendets mål. */
  to: string;
  mandatory: boolean;
  impactIfMissing: string;
}

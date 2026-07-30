export type FOCType =
  | "FakeOfConcept"
  | "FreedomOfConcept"
  | "FabricationOfConcept"
  | "FailureOfConcept"
  | "FrameworkOfConcept"
  | "FractionOfConcept"
  | "FallacyOfConcept"
  | "FringementOfConcept"
  | "FrictionOfConcept"
  | "FragmentationOfConcept"
  | "FinancialOfConcept"
  | "FragilityOfConcept"
  | "FandomOfConcept";

export interface FOCRiskProfile {
  category: FOCType;
  riskScore: number;
  rationale: string;
}

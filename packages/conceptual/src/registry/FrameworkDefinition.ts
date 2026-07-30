import type { FOCRiskProfile } from "../pocvsfoc/FOCRiskProfile.js";
import type { POCProfile } from "../pocvsfoc/POCProfile.js";

export interface FrameworkDefinition {
  frameworkName: string;
  purpose: string;
  authority: string[];
  dependencies: string[];
  contracts: string[];
  receiptsProduced: string[];
  receiptsConsumed: string[];
  implementations: string[];
  classification: string;
  currentPOCScore: number;
  currentFOCRisks: FOCRiskProfile[];
  recommendations: string[];
  pocvsfocProfile?: POCProfile;
}

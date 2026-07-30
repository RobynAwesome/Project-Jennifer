import type { FOCRiskProfile } from "./FOCRiskProfile.js";

export interface POCProfile {
  pocScore: number;
  strengths: string[];
  focRisks: FOCRiskProfile[];
  recommendations: string[];
}

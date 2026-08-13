export type RuntimeGateDecision = "ACCEPT" | "HOLD" | "REJECT";

export interface OperationalFOCGroupMatch {
  groupId: string;
  designation: string;
  detectionMechanism: string;
  defensiveLoop: string;
}

export interface POCFOCActionEvaluation {
  decision: RuntimeGateDecision;
  pocScore: number;
  reasons: string[];
  matchedFOCGroups: OperationalFOCGroupMatch[];
  sourceAuthority: string;
  sourceRef: string;
}

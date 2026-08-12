export interface VOCSourceReference {
  authorityOrigin: string;
  sourceRef: string;
  indexPath: string;
  classificationPath: string;
  manifestPath?: string;
}

export interface POCBranchDefinition {
  id: "POC";
  label: "Proof of Concept";
  groupCount: number | null;
}

export interface FOCGroupDefinition {
  groupId: string;
  designation: string;
  detectionMechanism: string;
  defensiveLoop: string;
}

export interface FOCBranchDefinition {
  id: "FOC";
  labels: string[];
  emergent: boolean;
  severeBreachCode: string | null;
  groups: FOCGroupDefinition[];
}

export interface VOCRegistry {
  parentFramework: "VOC";
  poc: POCBranchDefinition;
  foc: FOCBranchDefinition;
  source: VOCSourceReference;
}

export interface VOCParserInput {
  indexMarkdown: string;
  classificationMarkdown: string;
  manifestMarkdown?: string;
  sourceRef: string;
  authorityOrigin?: string;
  indexPath?: string;
  classificationPath?: string;
  manifestPath?: string;
}

export interface VOCParseReceipt {
  parser: "VOCRegistryParser";
  sourceAuthority: string;
  sourceRef: string;
  sourceHashes: {
    indexSha256: string;
    classificationSha256: string;
    manifestSha256: string | null;
  };
  pocParsed: boolean;
  focGroupsParsed: number;
  promotionStatus: "evidence-only";
}

export interface VOCParseResult {
  registry: VOCRegistry;
  receipt: VOCParseReceipt;
}

import test from "node:test";
import assert from "node:assert/strict";

import {
  ConceptualConvergenceProtocol,
  ConceptualEvaluationEngine,
  POCFOCActionEvaluator,
  POCvsFOCEvaluator,
  VOCRegistryParser,
  type FrameworkDefinition,
} from "./index.js";

const framework: FrameworkDefinition = {
  frameworkName: "Adaptive Governance",
  purpose: "Evaluate architectural proposals",
  authority: ["Constitutional Council"],
  dependencies: ["@jennifer/authority", "@jennifer/validation"],
  contracts: ["ConceptualIntegrityContract"],
  receiptsProduced: ["EvaluationReceipt", "FrameworkEvolutionReceipt"],
  receiptsConsumed: ["ValidationReport"],
  implementations: ["POCvsFOCEvaluator"],
  classification: "framework",
  currentPOCScore: 0.7,
  currentFOCRisks: [],
  recommendations: [],
};

const indexMarkdown = `
# VOC — VALIDATION OF CONCEPT
POC Proof of Concept
FOC Failure of / Freedom of Concept
`;

const manifestMarkdown = `
## VOC FRAMEWORK
POC Proof of Concept (1 group)
FOC Failure of Concept / Freedom of Concept
`;

const classificationMarkdown = `
FOC groups are **emergent, not predefined.**
Unauthorized context wiping = \`FOC_CONTEXT_CORRUPTION\`.

| Group ID | Failure Pattern Designation | Detection Mechanism | Automated Defensive Loop |
|----------|-----------------------------|---------------------|---------------------------|
| **FOC-G01** | \`NeuralFailureFirewall\` | 8th Deadly Sin Monitor | Immediate freeze of affected generation loops. |
| **FOC-G02** | \`ContextBleedAnomaly\` | CBP Telemetry Audit | Non-judgmental logging of ambient packet data. |
| **FOC-G03** | \`SemanticDriftLeak\` | Invariance Shift Check | Real-time reset of token alignment weights. |
| **FOC-G04** | \`GhostExecutionLoop\` | Run-time Resource Scan | Isolation of non-responsive background threads. |
| **FOC-G05** | \`ContextCorruptionBreach\` | Unauthorized Context Wiping | Immediate termination of active session parameters. |
`;

function parseVOC() {
  return new VOCRegistryParser().parse({
    indexMarkdown,
    classificationMarkdown,
    manifestMarkdown,
    sourceRef: "fd47792c6171b9f3e5795ef15d5bcd9a8547d64e",
  });
}

test("CEEP returns evaluation and framework evolution receipts", () => {
  const ceep = new ConceptualEvaluationEngine([new POCvsFOCEvaluator()]);

  const result = ceep.evaluate({
    subject: "Runtime Charter proposal",
    framework,
    supportingReceipts: ["validation-receipt-1"],
    evaluationRules: ["must-have-contracts", "must-have-authority"],
    contributor: "architect-1",
    evidenceLevel: "high",
  });

  assert.equal(result.evaluationReceipt.framework, framework.frameworkName);
  assert.equal(result.evaluationReceipt.evaluator, "POCvsFOC");
  assert.equal(result.evaluationReceipt.focRisks.length, 13);
  assert.ok(result.evaluationReceipt.pocScore >= 0);
  assert.ok(result.evaluationReceipt.pocScore <= 1);

  assert.equal(result.frameworkEvolutionReceipt.framework, framework.frameworkName);
  assert.equal(result.frameworkEvolutionReceipt.contributor, "architect-1");
});

test("CCP produces canonical receipt from framework evolution receipt", () => {
  const protocol = new ConceptualConvergenceProtocol();
  const ceep = new ConceptualEvaluationEngine([new POCvsFOCEvaluator()]);

  const result = ceep.evaluate({
    subject: "Constitutional protocol",
    framework,
    supportingReceipts: ["validation-receipt-2", "validation-receipt-3"],
    evaluationRules: ["constitutional-fit"],
    contributor: "architect-2",
    evidenceLevel: "high",
  });

  const canonicalReceipt = protocol.converge(result.frameworkEvolutionReceipt);

  assert.equal(canonicalReceipt.framework, framework.frameworkName);
  assert.equal(canonicalReceipt.evolutionReceiptId, result.frameworkEvolutionReceipt.receiptId);
  assert.ok(["Accepted", "Experimental", "Refine", "Rejected", "Deprecated"].includes(canonicalReceipt.decision));
});

test("VOC parser preserves Introduction-to-MCP POC branch and emergent FOC groups", () => {
  const result = parseVOC();

  assert.equal(result.registry.parentFramework, "VOC");
  assert.equal(result.registry.poc.label, "Proof of Concept");
  assert.equal(result.registry.poc.groupCount, 1);
  assert.deepEqual(result.registry.foc.labels, ["Failure of Concept", "Freedom of Concept"]);
  assert.equal(result.registry.foc.emergent, true);
  assert.equal(result.registry.foc.severeBreachCode, "FOC_CONTEXT_CORRUPTION");
  assert.equal(result.registry.foc.groups.length, 5);
  assert.equal(result.registry.foc.groups[4]?.groupId, "FOC-G05");
  assert.equal(result.registry.foc.groups[4]?.designation, "ContextCorruptionBreach");
  assert.equal(result.receipt.focGroupsParsed, 5);
  assert.equal(result.receipt.promotionStatus, "evidence-only");

  const matches = new VOCRegistryParser().matchFOCGroups(
    "FOC-G05 ContextCorruptionBreach Unauthorized Context Wiping",
    result.registry,
  );

  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.groupId, "FOC-G05");
});

test("POCFOCActionEvaluator rejects an action matching an operational FOC group", () => {
  const { registry } = parseVOC();
  const evaluator = new POCFOCActionEvaluator(registry, {
    minimumPOCScore: 0,
  });

  const result = evaluator.evaluate({
    subject: "Relationship memory mutation",
    framework,
    supportingReceipts: ["receipt-001"],
    evaluationRules: ["preserve-context"],
    observedFOCSignals: [
      "Detected ContextCorruptionBreach through Unauthorized Context Wiping",
    ],
  });

  assert.equal(result.decision, "REJECT");
  assert.equal(result.matchedFOCGroups.length, 1);
  assert.equal(result.matchedFOCGroups[0]?.groupId, "FOC-G05");
  assert.equal(result.sourceAuthority, "Kopano-Labs/Introduction-to-MCP");
});

test("POCFOCActionEvaluator can pass a non-matching action to the runtime gate", () => {
  const { registry } = parseVOC();
  const evaluator = new POCFOCActionEvaluator(registry, {
    minimumPOCScore: 0,
  });

  const result = evaluator.evaluate({
    subject: "Quest state mutation",
    framework,
    supportingReceipts: ["receipt-002"],
    evaluationRules: ["preserve-context"],
    observedFOCSignals: ["No registered operational failure pattern observed"],
  });

  assert.equal(result.decision, "ACCEPT");
  assert.equal(result.matchedFOCGroups.length, 0);
  assert.ok(result.pocScore >= 0);
  assert.ok(result.pocScore <= 1);
});

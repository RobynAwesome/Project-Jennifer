import test from "node:test";
import assert from "node:assert/strict";

import {
  ConceptualConvergenceProtocol,
  ConceptualEvaluationEngine,
  POCvsFOCEvaluator,
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

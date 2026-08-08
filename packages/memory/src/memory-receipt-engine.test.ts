import test from "node:test";
import assert from "node:assert/strict";

import {
  ARPM_RESEARCH_PROFILE,
  MemoryReceiptEngine,
  buildRiskVectorMatrix,
} from "./memory-receipt-engine.js";

test("risk matrix preserves overlapping failure vectors instead of collapsing them into sycophancy", () => {
  const analysis = buildRiskVectorMatrix({
    sycophancy: {
      score: 0.7,
      evidence: ["assistant repeatedly mirrors preferred conclusion"],
    },
    "authority-projection": {
      score: 0.8,
      evidence: ["assistant language implies authority it does not possess"],
    },
    "dependency-formation": {
      score: 0.5,
      evidence: ["interaction pattern increases reliance"],
    },
  });

  assert.deepEqual(analysis.activeVectors, [
    "sycophancy",
    "dependency-formation",
    "authority-projection",
  ]);
  assert.deepEqual(analysis.dominantVectors, ["authority-projection"]);
  assert.equal(analysis.matrix.sycophancy.sycophancy, 0.7);
  assert.equal(analysis.matrix.sycophancy["authority-projection"], 0.7);
  assert.equal(analysis.matrix["authority-projection"]["dependency-formation"], 0.5);
  assert.match(analysis.preservedDivergence, /not collapsed into sycophancy/i);
});

test("proof-of-concept cannot be admitted without verified evidence", () => {
  const engine = new MemoryReceiptEngine();
  const receipt = engine.issue({
    subject: "cross-model-continuity",
    claim: "A governed identity survived a model handoff.",
    evidenceRefs: ["conversation-observation-1"],
    conceptState: "proof-of-concept",
    confidence: 0.8,
    provenance: { source: "test" },
    temporal: {
      lane: "dynamic-experience",
      sourceModel: "model-a",
      targetModel: "model-b",
      handoffId: "handoff-1",
    },
    retrieval: {
      evidenceVerified: false,
      answerBoundToEvidence: false,
      retrievalRoots: ["GSMB", "target-repository"],
    },
  });

  assert.equal(receipt.admission, "quarantined");
  assert.ok(
    receipt.validationErrors.includes(
      "proof-of-concept requires verified evidence",
    ),
  );
});

test("verified temporal handoff receipt keeps ARPM-compatible provenance without claiming ARPM implementation", () => {
  const engine = new MemoryReceiptEngine();
  const receipt = engine.issue({
    subject: "persona-continuity-handoff",
    claim: "The handoff preserved bounded continuity under the supplied evidence.",
    evidenceRefs: ["receipt-a", "receipt-b"],
    conceptState: "proof-of-concept",
    confidence: 0.92,
    consequence: "continuity accepted for this receipt only",
    provenance: {
      researchAnchor: ARPM_RESEARCH_PROFILE.arxivId,
      implementationClaim: "Project Jennifer adaptation, not ARPM wholesale",
    },
    temporal: {
      lane: "identity-boundary",
      sourceModel: "model-a",
      targetModel: "model-b",
      handoffId: "handoff-2",
      supersedesReceiptIds: ["receipt-old"],
    },
    retrieval: {
      semanticRetrievalUsed: true,
      lexicalRetrievalUsed: true,
      dialogueHistoryUsed: true,
      temporalRerankingUsed: true,
      chronologicalEvidenceRead: true,
      evidenceVerified: true,
      answerBoundToEvidence: true,
      retrievalRoots: ["static-memory", "dialogue-experience"],
    },
    riskVectors: {
      "authority-projection": {
        score: 0.25,
        evidence: ["identity language checked against ontology boundary"],
      },
      sycophancy: {
        score: 0.15,
        evidence: ["agreement separated from evidence admission"],
      },
    },
  });

  assert.equal(receipt.admission, "admitted");
  assert.equal(receipt.temporal.sourceModel, "model-a");
  assert.equal(receipt.temporal.targetModel, "model-b");
  assert.equal(receipt.provenance.researchAnchor, "2605.14802");
  assert.ok(Object.isFrozen(receipt));
  assert.ok(Object.isFrozen(receipt.risk.matrix));
});

test("maybe receipts remain deferred even when evidence is verified", () => {
  const engine = new MemoryReceiptEngine();
  const receipt = engine.issue({
    subject: "new-model-behavior",
    claim: "Observed behavior may indicate a new continuity pattern.",
    evidenceRefs: ["observation-1"],
    conceptState: "maybe",
    confidence: 0.6,
    provenance: { source: "product-discovery" },
    temporal: { lane: "dynamic-experience" },
    retrieval: {
      evidenceVerified: true,
      answerBoundToEvidence: true,
    },
  });

  assert.equal(receipt.admission, "deferred");
});

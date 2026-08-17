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
  assert.equal(
    analysis.matrix["authority-projection"]["dependency-formation"],
    0.5,
  );
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

test("issued receipts are deeply detached from caller-owned mutable provenance", () => {
  const engine = new MemoryReceiptEngine();
  const provenance = {
    source: "runtime-audit",
    nested: {
      refs: ["receipt-a"],
      state: { stage: "tested" },
    },
  };
  const supersedes = ["receipt-old"];
  const roots = ["GSMB", "target-repository"];

  const receipt = engine.issue({
    subject: "immutable-receipt",
    claim: "Receipt state must not mutate after issuance.",
    evidenceRefs: ["receipt-a"],
    conceptState: "proof-of-concept",
    confidence: 1,
    provenance,
    temporal: {
      lane: "failure",
      supersedesReceiptIds: supersedes,
    },
    retrieval: {
      evidenceVerified: true,
      answerBoundToEvidence: true,
      retrievalRoots: roots,
    },
  });

  provenance.nested.refs.push("receipt-mutated-after-issue");
  provenance.nested.state.stage = "deployed";
  supersedes.push("receipt-mutated-after-issue");
  roots.push("inference");

  const storedNested = receipt.provenance.nested as {
    refs: readonly string[];
    state: Readonly<{ stage: string }>;
  };

  assert.deepEqual(storedNested.refs, ["receipt-a"]);
  assert.equal(storedNested.state.stage, "tested");
  assert.deepEqual(receipt.temporal.supersedesReceiptIds, ["receipt-old"]);
  assert.deepEqual(receipt.retrieval.retrievalRoots, [
    "GSMB",
    "target-repository",
  ]);
  assert.ok(Object.isFrozen(receipt.provenance));
  assert.ok(Object.isFrozen(storedNested));
  assert.ok(Object.isFrozen(storedNested.refs));
  assert.ok(Object.isFrozen(storedNested.state));
  assert.ok(Object.isFrozen(receipt.temporal.supersedesReceiptIds));
  assert.ok(Object.isFrozen(receipt.retrieval.retrievalRoots));
});

test("non-finite confidence and risk scores are quarantined and never persisted as NaN or Infinity", () => {
  const engine = new MemoryReceiptEngine();
  const receipt = engine.issue({
    subject: "numeric-integrity",
    claim: "Non-finite numbers must not enter durable memory state.",
    evidenceRefs: ["numeric-test"],
    conceptState: "proof-of-concept",
    confidence: Number.NaN,
    provenance: { source: "test", score: 1 },
    temporal: {
      lane: "failure",
      observedAt: Number.POSITIVE_INFINITY,
      validFrom: Number.NEGATIVE_INFINITY,
    },
    retrieval: {
      evidenceVerified: true,
      answerBoundToEvidence: true,
    },
    riskVectors: {
      sycophancy: {
        score: Number.POSITIVE_INFINITY,
        evidence: ["invalid-score"],
      },
    },
  });

  assert.equal(receipt.admission, "quarantined");
  assert.equal(receipt.confidence, 0);
  assert.equal(receipt.risk.vectorScores.sycophancy, 0);
  assert.equal(Number.isFinite(receipt.temporal.observedAt), true);
  assert.equal(receipt.temporal.validFrom, undefined);
  assert.match(receipt.validationErrors.join(" "), /confidence must be a finite number/);
  assert.match(receipt.validationErrors.join(" "), /observedAt must be a finite number/);
  assert.match(receipt.validationErrors.join(" "), /risk vector sycophancy score must be a finite number/);
});

test("unsupported provenance values quarantine the receipt instead of leaking mutable structures", () => {
  const engine = new MemoryReceiptEngine();
  const receipt = engine.issue({
    subject: "provenance-integrity",
    claim: "Durable provenance must use finite JSON-safe receipt values.",
    evidenceRefs: ["provenance-test"],
    conceptState: "failure-of-concept",
    confidence: 0.5,
    provenance: {
      source: "test",
      created: new Date("2026-08-17T00:00:00Z"),
    },
    temporal: { lane: "failure" },
    retrieval: {
      evidenceVerified: true,
      answerBoundToEvidence: true,
    },
  });

  assert.equal(receipt.admission, "quarantined");
  assert.deepEqual(receipt.provenance, {});
  assert.match(receipt.validationErrors.join(" "), /non-plain object/);
});

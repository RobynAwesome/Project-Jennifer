import assert from "node:assert/strict";
import test from "node:test";

import type { RealityQuestContract } from "@jennifer/shared";

import { RealityQuestRuntime } from "./reality-quest-runtime.js";

function kpgsQuest(): RealityQuestContract {
  return {
    schemaVersion: 1,
    questId: "quest-close-stale-issue",
    domain: "kpgs",
    objectiveRef: "objective:close-stale-jennifer-issue",
    sourceAuthorityRefs: ["issue:83", "kpgs:authority"],
    currentStateEvidenceRefs: ["issue:83:open"],
    frictionClassification: "stale-governance-gap",
    action: {
      description: "Close one stale Jennifer issue with a reconstructable receipt",
      bounded: true,
      allowedAssistance: ["companion-rehearse", "hold"],
    },
    evidencePolicy: {
      required: true,
      acceptedEvidenceTypes: ["github-issue-comment", "ci-receipt"],
      privacyClass: "work",
      humanWitnessAllowed: true,
    },
    safetyPolicyRefs: ["policy:no-clinical-inheritance"],
    convergenceQuestId: "convergence-optional-bind",
    status: "proposed",
  };
}

test("model praise alone cannot complete a quest", () => {
  const runtime = new RealityQuestRuntime();
  runtime.propose(kpgsQuest());
  runtime.accept("quest-close-stale-issue", "2026-09-13T16:00:00.000Z");
  const receipt = runtime.evaluate({
    questId: "quest-close-stale-issue",
    evidenceRefs: [],
    evidenceType: "praise",
    claimedComplete: true,
    praiseOnly: true,
  });
  assert.equal(receipt.verdict, "HOLD");
  assert.equal(runtime.reconstruct("quest-close-stale-issue").status, "hold");
});

test("user claim of done with no evidence stays HOLD, not failure", () => {
  const runtime = new RealityQuestRuntime();
  runtime.propose(kpgsQuest());
  runtime.accept("quest-close-stale-issue", "2026-09-13T16:00:00.000Z");
  const receipt = runtime.evaluate({
    questId: "quest-close-stale-issue",
    evidenceRefs: [],
    evidenceType: "github-issue-comment",
    claimedComplete: true,
  });
  assert.equal(receipt.verdict, "HOLD");
  assert.match(receipt.reasons.join(" "), /not quest completion|missing|HOLD/i);
});

test("valid external artifact can complete without clinical inheritance", () => {
  const runtime = new RealityQuestRuntime();
  runtime.propose(kpgsQuest());
  runtime.accept("quest-close-stale-issue", "2026-09-13T16:00:00.000Z");
  const receipt = runtime.evaluate({
    questId: "quest-close-stale-issue",
    evidenceRefs: ["github:issue-83-comment:close-receipt"],
    evidenceType: "github-issue-comment",
    claimedComplete: true,
  });
  assert.equal(receipt.verdict, "ACCEPT");
  assert.ok(receipt.memoryReceiptRef);
  assert.equal(runtime.reconstruct("quest-close-stale-issue").status, "completed");
});

test("DARER clinical claim is blocked", () => {
  const runtime = new RealityQuestRuntime();
  runtime.propose(kpgsQuest());
  const receipt = runtime.evaluate({
    questId: "quest-close-stale-issue",
    evidenceRefs: ["note:felt-better"],
    evidenceType: "github-issue-comment",
    claimedComplete: true,
    clinicalClaimFromDarer: true,
  });
  assert.equal(receipt.verdict, "HOLD");
  assert.match(receipt.reasons.join(" "), /DARER/);
});

test("abandon is not a fabricated failure verdict", () => {
  const runtime = new RealityQuestRuntime();
  runtime.propose(kpgsQuest());
  const abandoned = runtime.abandon("quest-close-stale-issue");
  assert.equal(abandoned.status, "abandoned");
  assert.equal(abandoned.evaluationReceiptRef, undefined);
});

test("duplicate evidence is idempotent and restart reconstructs", () => {
  const runtime = new RealityQuestRuntime();
  runtime.propose(kpgsQuest());
  runtime.accept("quest-close-stale-issue", "2026-09-13T16:00:00.000Z");
  const first = runtime.evaluate({
    questId: "quest-close-stale-issue",
    evidenceRefs: ["github:issue-83-comment:close-receipt"],
    evidenceType: "github-issue-comment",
    claimedComplete: true,
  });
  const second = runtime.evaluate({
    questId: "quest-close-stale-issue",
    evidenceRefs: ["github:issue-83-comment:close-receipt"],
    evidenceType: "github-issue-comment",
    claimedComplete: true,
  });
  assert.equal(first.receiptId, second.receiptId);

  const restored = new RealityQuestRuntime();
  restored.restore(runtime.snapshot());
  assert.equal(restored.reconstruct("quest-close-stale-issue").status, "completed");
  assert.equal(
    restored.reconstruct("quest-close-stale-issue").convergenceQuestId,
    "convergence-optional-bind",
  );
});

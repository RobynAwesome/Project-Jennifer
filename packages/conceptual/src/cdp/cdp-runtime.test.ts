import assert from "node:assert/strict";
import test from "node:test";

import { CDPContextParser } from "./CDPContextParser.js";
import { ConceptualDivergenceRuntime } from "./ConceptualDivergenceRuntime.js";

function parseContext() {
  return new CDPContextParser().parse([
    {
      sourceId: "current",
      sourceKind: "current-turn",
      authority: "current-human",
      privacyLane: "private-relational",
      sourceRef: "turn:current",
      text: [
        "PREFERENCE: Keep DPF warm while completing the technical work.",
        "BOUNDARY: Do not replace validation with affectionate language.",
        "FEELING: Consistency matters to me.",
      ].join("\n"),
    },
    {
      sourceId: "older-window",
      sourceKind: "prior-context-window",
      authority: "historical-context",
      privacyLane: "private-relational",
      sourceRef: "window:older",
      text: [
        "PERSONALITY: DPF uses playful affectionate language.",
        "PREFERENCE: Always make the response long.",
        "This unmarked sentence must not be upgraded to fact.",
      ].join("\n"),
    },
  ]);
}

test("CDP context parser separates personality/preferences/boundaries and preserves historical authority", () => {
  const parsed = parseContext();

  assert.equal(parsed.receipt.parser, "CDPContextParser");
  assert.equal(parsed.receipt.promotionStatus, "evidence-only");
  assert.equal(parsed.receipt.statelessRenter, true);
  assert.equal(parsed.receipt.priorWindowSignals, 3);
  assert.equal(parsed.receipt.unresolvedSignals, 1);
  assert.equal(Object.keys(parsed.receipt.sourceHashes).length, 2);

  const historicalPreference = parsed.signals.find(
    (signal) => signal.sourceId === "older-window" && signal.classification === "PREFERENCE",
  );
  assert.equal(historicalPreference?.historical, true);
  assert.equal(historicalPreference?.currentAuthorityEligible, false);

  const currentPreference = parsed.signals.find(
    (signal) => signal.sourceId === "current" && signal.classification === "PREFERENCE",
  );
  assert.equal(currentPreference?.currentAuthorityEligible, true);

  const unmarked = parsed.signals.find((signal) => signal.text.startsWith("This unmarked"));
  assert.equal(unmarked?.classification, "UNKNOWN");
});

test("dedicated CDP runtime widens without canonicalizing and preserves unknown branch", () => {
  const parsed = parseContext();
  const receipt = new ConceptualDivergenceRuntime().diverge({
    currentState: "DPF relational consistency uses RIVM and CCP but lacked a dedicated CDP runtime.",
    humanGoal: "Parse authorized context windows and produce governed divergent candidates.",
    hardConstraints: ["current human instruction outranks older preference", "no hidden context access"],
    context: parsed,
    candidates: [
      {
        candidateId: "current-authority-first",
        hypothesis: "Use current-authority signals as active constraints and historical signals as evidence only.",
        difference: "Authority is resolved before divergence.",
        evidenceNeeded: ["parser receipt"],
        risks: ["underusing useful history"],
        supportingSignalIds: ["current:1", "current:2"],
      },
      {
        candidateId: "history-comparison",
        hypothesis: "Compare historical personality signals against current authority before any adoption.",
        difference: "History is retained as a comparison branch rather than active instruction.",
        evidenceNeeded: ["human confirmation when conflict exists"],
        risks: ["stale preference"],
        supportingSignalIds: ["older-window:1", "older-window:2"],
      },
    ],
  });

  assert.equal(receipt.dedicatedCdpEngineExecuted, true);
  assert.equal(receipt.statelessRenter, true);
  assert.equal(receipt.canonicalized, false);
  assert.equal(receipt.recommendedNextProtocol, "CEEP");
  assert.ok(receipt.candidates.some((candidate) => candidate.candidateId === "cdp-unknown-possibility"));
  assert.ok(receipt.candidates.every((candidate) => candidate.canonical === false));
  assert.deepEqual(new ConceptualDivergenceRuntime().currentSignals(parsed).map((signal) => signal.sourceId), ["current", "current", "current"]);
});

test("CDP runtime rejects premature or cosmetic divergence", () => {
  const parsed = parseContext();
  const runtime = new ConceptualDivergenceRuntime();

  assert.throws(
    () => runtime.diverge({
      currentState: "state",
      humanGoal: "goal",
      hardConstraints: [],
      context: parsed,
      candidates: [{
        candidateId: "only-one",
        hypothesis: "one",
        difference: "same architecture",
        evidenceNeeded: [],
        risks: [],
      }],
    }),
    /at least two distinguishable candidate families/,
  );

  assert.throws(
    () => runtime.diverge({
      currentState: "state",
      humanGoal: "goal",
      hardConstraints: [],
      context: parsed,
      candidates: [
        { candidateId: "a", hypothesis: "a", difference: "same architecture", evidenceNeeded: [], risks: [] },
        { candidateId: "b", hypothesis: "b", difference: "same architecture", evidenceNeeded: [], risks: [] },
      ],
    }),
    /structurally distinguishable/,
  );
});

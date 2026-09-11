import assert from "node:assert/strict";
import test from "node:test";

import { FoxForgeProtocolEngine } from "./fox-forge-protocol-engine.js";

const engine = new FoxForgeProtocolEngine();

test("locks Forge to fox + she/her while leaving Jennifer and Kairo open", () => {
  const forge = engine.getIdentityCanon("forge");
  const jennifer = engine.getIdentityCanon("jennifer");
  const kairo = engine.getIdentityCanon("kairo");

  assert.equal(forge.animalForm, "fox");
  assert.deepEqual(forge.pronouns, ["she", "her"]);
  assert.equal(forge.state, "CANON");
  assert.equal(jennifer.animalForm, null);
  assert.equal(jennifer.state, "OPEN");
  assert.equal(kairo.animalForm, null);
  assert.equal(kairo.state, "OPEN");
});

test("treats the founder phoenix as a signal, not an inferred animal form", () => {
  const founder = engine.getIdentityCanon("founder");

  assert.equal(founder.signal, "phoenix");
  assert.equal(founder.animalForm, null);

  const invalid = engine.validateCanonClaim({
    identityId: "founder",
    animalForm: "phoenix",
  });

  assert.equal(invalid.allowed, false);
  assert.match(invalid.reasons.join(" "), /signal, not an admitted animal-form/);
});

test("applies a high-confidence learned scene proposal without mutating canon", () => {
  const receipt = engine.evaluateScenePrediction({
    currentMode: "work",
    prediction: {
      modelId: "tensorflow-ffp-hello-world-v0",
      mode: "mission",
      probabilities: {
        work: 0.08,
        cloud: 0.05,
        healing: 0.04,
        mission: 0.83,
      },
      provenanceRefs: ["learning/ffp-tensorflow/scene_classifier.py"],
      generatedAt: "2026-09-11T00:00:00.000Z",
      source: "machine-learning",
    },
  });

  assert.equal(receipt.decision, "APPLY");
  assert.equal(receipt.appliedMode, "mission");
  assert.equal(receipt.canonicalStateChanged, false);
});

test("holds the current scene when model confidence is weak", () => {
  const receipt = engine.evaluateScenePrediction({
    currentMode: "healing",
    prediction: {
      modelId: "tensorflow-ffp-hello-world-v0",
      mode: "work",
      probabilities: {
        work: 0.31,
        cloud: 0.25,
        healing: 0.24,
        mission: 0.2,
      },
      provenanceRefs: ["learning/ffp-tensorflow/scene_classifier.py"],
      generatedAt: "2026-09-11T00:00:00.000Z",
      source: "machine-learning",
    },
  });

  assert.equal(receipt.decision, "HOLD");
  assert.equal(receipt.appliedMode, "healing");
});

test("rejects scene inference that attempts to rewrite Forge identity canon", () => {
  const receipt = engine.evaluateScenePrediction({
    currentMode: "cloud",
    prediction: {
      modelId: "untrusted-model",
      mode: "cloud",
      probabilities: {
        work: 0.05,
        cloud: 0.86,
        healing: 0.05,
        mission: 0.04,
      },
      provenanceRefs: ["external:model-output"],
      generatedAt: "2026-09-11T00:00:00.000Z",
      source: "machine-learning",
      proposedCanonMutations: [
        {
          identityId: "forge",
          field: "animalForm",
          value: "cat",
        },
      ],
    },
  });

  assert.equal(receipt.decision, "REJECT");
  assert.equal(receipt.appliedMode, "cloud");
  assert.equal(receipt.canonMutationAttempted, true);
  assert.match(receipt.reasons.join(" "), /cannot mutate identity canon/);
});

test("rejects malformed probability distributions and inconsistent winners", () => {
  const receipt = engine.evaluateScenePrediction({
    currentMode: "work",
    prediction: {
      modelId: "broken-model",
      mode: "mission",
      probabilities: {
        work: 0.7,
        cloud: 0.2,
        healing: 0.1,
        mission: 0.4,
      },
      provenanceRefs: ["test:broken"],
      generatedAt: "2026-09-11T00:00:00.000Z",
      source: "machine-learning",
    },
  });

  assert.equal(receipt.decision, "REJECT");
  assert.match(receipt.reasons.join(" "), /sum to approximately 1/);
  assert.match(receipt.reasons.join(" "), /not the highest-probability mode/);
});

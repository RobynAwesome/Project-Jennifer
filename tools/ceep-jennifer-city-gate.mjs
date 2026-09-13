#!/usr/bin/env node
/**
 * CEEP evaluate Jennifer City CLEAR×KPGS product-gate subject.
 *
 * Two evaluators (do not collapse):
 * 1. DualMembraneCLEAR-KPGS — product gate (Academy + Delivery means → pocScore)
 * 2. POCvsFOC — diagnostic FOC inventory (often FAIL; Refine/Reject signal only)
 *
 * Dual-membrane PASS (pocScore ≥ 0.6) ⇒ Refine — not Accepted / not canon.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ConceptualEvaluationEngine,
  POCvsFOCEvaluator,
} from "../packages/conceptual/dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const academy = {
  Complete: 80,
  Logical: 90,
  Evidence: 78,
  Audience: 72,
  Relevant: 92,
};
const delivery = {
  Cost: 90,
  Latency: 80,
  Efficacy: 82,
  Assurance: 86,
  Reliability: 88,
};
const academyMean =
  Object.values(academy).reduce((a, b) => a + b, 0) / Object.values(academy).length;
const deliveryMean =
  Object.values(delivery).reduce((a, b) => a + b, 0) / Object.values(delivery).length;
const onRouteComposite = Number(((academyMean + deliveryMean) / 2).toFixed(0));
const dualPocScore = Number((onRouteComposite / 100).toFixed(2));

/** Product-gate SubjectEvaluator — maps dual CLEAR membranes to pocScore. */
class DualMembraneClearKpgsEvaluator {
  name = "DualMembraneCLEAR-KPGS";
  evaluate() {
    return {
      pocScore: dualPocScore,
      strengths: [
        "Academy and Delivery membranes scored separately (not OpenAI trademarks)",
        `Academy C.L.E.A.R. mean ${academyMean.toFixed(0)}%`,
        `Delivery CLEAR mean ${deliveryMean.toFixed(0)}%`,
        `On-route composite ${onRouteComposite}%`,
        "Zero-trust continuity + epistemic actor-model labelled non-canon",
      ],
      focRisks: [
        {
          category: "FandomOfConcept",
          riskScore: 3,
          rationale: "Affection for the love loop must not graduate to production love.",
        },
        {
          category: "FractionOfConcept",
          riskScore: 4,
          rationale: "Audience incomplete — no hosted stranger /game URL yet.",
        },
        {
          category: "FragilityOfConcept",
          riskScore: 3,
          rationale: "API continuity is in-memory; localStorage-first is the Reliability bowl.",
        },
        {
          category: "FabricationOfConcept",
          riskScore: 2,
          rationale: "Epistemic receipts are actor-model, not world truth.",
        },
      ],
      recommendations: [
        "Master: Sprint A2 secrets + human LOVE_LOOP_PLAYTEST on live URL",
        "Master: Recognize / Reject / HOLD product-gate for MAIN-BRAIN pointer",
        "Keep PERN multi-device HOLD until namespace map admitted",
      ],
    };
  }
}

const framework = {
  frameworkName: "CLEAR-KPGS-Product-Gate",
  purpose:
    "Score Jennifer City love loop under Academy C.L.E.A.R. + delivery CLEAR + KPGS zero-trust before skill/sprint admission; never graduate loved≠proven into MAIN-BRAIN without Master recognition.",
  authority: ["Human Architect", "KPGS", "24-RTC Learning HOLD-When-You-Love-It"],
  dependencies: [
    "@jennifer/npc",
    "@jennifer/runtime",
    "apps/api/src/zero-trust.ts",
    "apps/web/src/game/continuity",
  ],
  contracts: [
    "GameDedicationCharter",
    "ZeroTrustContinuityMembrane",
    "DualClearMembrane",
    "ActorModelEpistemicNonCanon",
  ],
  receiptsProduced: ["EvaluationReceipt", "FrameworkEvolutionReceipt"],
  receiptsConsumed: [
    "docs/audits/2026-09-13-clear-kpgs-rtc-love-loop-evaluation.md",
    "docs/audits/2026-09-13-clear-kpgs-sprint-b-reeval.md",
    "docs/audits/2026-09-13-clear-kpgs-post-sprint-abc-reevaluation.md",
    "docs/audits/2026-09-13-clear-kpgs-classroom-love-loop.md",
    "docs/playtesting/RECEIPT_2026-09-13_SPRINT_A_CONTINUITY_SMOKE.md",
    "docs/playtesting/RECEIPT_2026-09-13_SPRINT_B_RELIABILITY.md",
    "docs/playtesting/RECEIPT_2026-09-13_SPRINT_C_EPISTEMIC.md",
  ],
  implementations: [
    "clear-kpgs-zero-trust-gate",
    "jennifer-city-love-loop",
    "jennifer-love-loop-reliability",
    "jennifer-canonical-ops-sprints",
  ],
  classification: "framework",
  currentPOCScore: dualPocScore,
  currentFOCRisks: [
    "Hosted stranger URL missing",
    "PERN multi-device HOLD",
  ],
  recommendations: [
    "Sprint A2 hosted playtest",
    "Master recognize or reject MAIN-BRAIN pointer",
  ],
};

const input = {
  subject:
    "Jennifer City love-loop CLEAR×KPGS dual-membrane gate after Sprint A/B/C (reconcile Codex 85% + Cursor delivery scores)",
  framework,
  supportingReceipts: framework.receiptsConsumed,
  evaluationRules: [
    "dual-membrane-required",
    "zero-trust-before-score",
    "pocScore-0.6-is-Refine-not-canon",
    "no-main-brain-auto-write",
    "production-love-requires-url-playtest",
  ],
  contributor: "cursor-renter-ceep",
  proposalId: "jennifer-city-clear-kpgs-gate-2026-09-13",
  evidenceLevel: "high",
  discussionHistory: [
    "Codex dual-membrane composite 85% (Academy 83 / Delivery 87)",
    "Cursor post-ABC delivery mean 88%; dual-membrane restored here",
    "POCvsFOC diagnostic kept separate from DualMembrane product evaluator",
  ],
};

const product = new ConceptualEvaluationEngine([
  new DualMembraneClearKpgsEvaluator(),
]).evaluate(input);

const diagnostic = new ConceptualEvaluationEngine([
  new POCvsFOCEvaluator(),
]).evaluate(input);

const out = {
  gateLaw: {
    academyCLEAR: "Complete·Logical·Evidence·Audience·Relevant",
    deliveryCLEAR: "Cost·Latency·Efficacy·Assurance·Reliability",
    note: "Neither membrane is an OpenAI product name",
  },
  humanDualMembrane: {
    academy: { ...academy, mean: Number(academyMean.toFixed(0)) },
    delivery: { ...delivery, mean: Number(deliveryMean.toFixed(0)) },
    onRouteComposite,
  },
  ceepProductGate: {
    evaluator: "DualMembraneCLEAR-KPGS",
    validation: product.evaluationReceipt.validation,
    pocScore: product.evaluationReceipt.pocScore,
    ccpDecision: product.frameworkEvolutionReceipt.ccpDecision,
    canonical: product.frameworkEvolutionReceipt.canonical,
    evaluationReceiptId: product.evaluationReceipt.receiptId,
    frameworkEvolutionReceiptId: product.frameworkEvolutionReceipt.receiptId,
    focRisks: product.evaluationReceipt.focRisks,
    recommendations: product.evaluationReceipt.recommendations,
  },
  ceepPocFocDiagnostic: {
    evaluator: "POCvsFOC",
    validation: diagnostic.evaluationReceipt.validation,
    pocScore: diagnostic.evaluationReceipt.pocScore,
    ccpDecision: diagnostic.frameworkEvolutionReceipt.ccpDecision,
    canonical: false,
    note: "Diagnostic FOC inventory. Do not collapse into the dual-membrane product gate.",
  },
  holds: [
    "production love / stranger hosted URL",
    "MAIN-BRAIN write",
    "PERN multi-device until Master admits map",
  ],
};

const path = join(
  root,
  "docs/audits/2026-09-13-ceep-jennifer-city-clear-kpgs-gate.json",
);
writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`);

console.log(
  `CEEP product-gate ${out.ceepProductGate.validation} pocScore=${out.ceepProductGate.pocScore} ccpDecision=${out.ceepProductGate.ccpDecision} canonical=${out.ceepProductGate.canonical}`,
);
console.log(
  `CEEP POCvsFOC diagnostic ${out.ceepPocFocDiagnostic.validation} pocScore=${out.ceepPocFocDiagnostic.pocScore} (not the product membrane)`,
);
console.log(
  `Dual-membrane on-route composite=${out.humanDualMembrane.onRouteComposite}% (Academy ${out.humanDualMembrane.academy.mean} / Delivery ${out.humanDualMembrane.delivery.mean})`,
);
console.log(`Wrote ${path}`);

if (out.ceepProductGate.validation !== "PASS") process.exitCode = 1;

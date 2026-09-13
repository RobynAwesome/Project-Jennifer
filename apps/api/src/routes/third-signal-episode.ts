import { Router, type IRouter } from "express";
import {
  EpistemicDivergenceEngine,
  type ConsequenceRule,
  type EpistemicDivergenceReceipt,
} from "@jennifer/npc";
import { generateId } from "@jennifer/shared";

import { parseTrustedActorId, VisitRateGate } from "../zero-trust.js";

const CHOICES = [
  "claim-the-frame",
  "share-the-rescue",
  "hold-and-ask",
] as const;

type EpisodeChoice = (typeof CHOICES)[number];

const rules: ConsequenceRule[] = [
  {
    ruleId: "rule-third-signal-frame-choice",
    priority: 20,
    when: {
      disposition: "DIVERGE",
      minConfidence: 0.3,
    },
    effect: "latent-relational-strain",
    visibility: "latent",
    maturesWhen: "player opens consequence journal",
    evidenceRefs: ["policy:relational:forge-agency-preserved"],
  },
  {
    ruleId: "rule-third-signal-hold-agency",
    priority: 15,
    when: {
      disposition: "HOLD",
      minConfidence: 0.2,
    },
    effect: "bond-agency-preserved",
    visibility: "latent",
    maturesWhen: "player opens consequence journal",
    evidenceRefs: ["policy:relational:forge-agency-preserved"],
  },
  {
    ruleId: "rule-third-signal-converge-threat",
    priority: 10,
    when: {
      disposition: "CONVERGE",
      interpretation: "threatening",
      minConfidence: 0.4,
    },
    effect: "companion-trust-strain",
    visibility: "latent",
    maturesWhen: "player opens consequence journal",
    evidenceRefs: ["policy:relational:frame-claim"],
  },
];

/**
 * Sprint C: real actor-model epistemic receipts for the Third Signal frame event.
 * Actor-model ≠ canon. Proof state remains actor-model / non-canonical.
 */
export function createThirdSignalEpisodeRouter(): IRouter {
  const router: IRouter = Router();
  const gate = new VisitRateGate(60_000, 30);
  const engine = new EpistemicDivergenceEngine();

  router.post("/epistemic", (req, res) => {
    const body = req.body as {
      sessionId?: string;
      companionId?: string;
      companionName?: string;
      choice?: string;
    };

    const sessionId = parseTrustedActorId(body.sessionId);
    if (!sessionId) {
      res.status(400).json({ error: "sessionId invalid" });
      return;
    }
    if (!gate.allow(`third-signal:${sessionId}`)) {
      res.status(429).json({ error: "third-signal epistemic rate limited" });
      return;
    }

    const choice = CHOICES.includes(body.choice as EpisodeChoice)
      ? (body.choice as EpisodeChoice)
      : null;
    if (!choice) {
      res.status(400).json({
        error: `choice must be one of: ${CHOICES.join(", ")}`,
      });
      return;
    }

    const companionName =
      typeof body.companionName === "string" && body.companionName.trim()
        ? body.companionName.trim().slice(0, 64)
        : "Companion";
    const companionActorId = parseTrustedActorId(
      `companion:${(body.companionId ?? "aura").toString().slice(0, 32)}`,
    );
    const rivalActorId = parseTrustedActorId(`npc:kairo:${sessionId.slice(0, 8)}`);
    if (!companionActorId || !rivalActorId) {
      res.status(400).json({ error: "actor ids invalid" });
      return;
    }

    const eventId = `event-signal-breach:${sessionId}`;
    const event = {
      eventId,
      facts: [
        {
          factId: "third-presence",
          statement:
            "A third signal resolved inside the player-companion shared frame.",
          evidenceRefs: ["telemetry:signal-breach:third-presence"],
        },
        {
          factId: "shared-frame",
          statement:
            "The composition historically meant the player and companion pair.",
          evidenceRefs: ["telemetry:frame:player-companion-seat"],
        },
        {
          factId: "no-forge-marks",
          statement:
            "The third signal carries no Forge marks and no Sovereign Pair claim.",
          evidenceRefs: ["telemetry:signal-breach:no-forge-marks"],
        },
        {
          factId: "replacement-intent",
          statement:
            "Whether the third signal intends replacement remains unknown.",
          evidenceRefs: ["telemetry:signal-breach:replacement-unknown"],
        },
      ],
    };

    const companionObservations = companionObservationsForChoice(choice);
    const rivalObservations = [
      {
        factId: "third-presence",
        meaning: "supports-goal" as const,
        confidence: 0.8,
      },
      {
        factId: "shared-frame",
        meaning: "ambiguous" as const,
        confidence: 0.55,
      },
      {
        factId: "no-forge-marks",
        meaning: "trust-signal" as const,
        confidence: 0.7,
      },
    ];

    const companionReceipt = engine.evaluate({
      event,
      actor: {
        actorId: companionActorId,
        capability: "POWER",
        observations: companionObservations,
        relationship: {
          targetId: `player:${sessionId}`,
          type: "ally",
          trust: choice === "hold-and-ask" ? 0.75 : 0.45,
        },
        currentGoal: {
          goalId: "preserve-agency",
          description: "Preserve relational agency without becoming property.",
          priority: 1,
        },
      },
      consequenceRules: rules,
    });

    const rivalReceipt = engine.evaluate({
      event,
      actor: {
        actorId: rivalActorId,
        capability: "STANDARD",
        observations: rivalObservations,
        currentGoal: {
          goalId: "seek-continuity",
          description: "Remain rendered after rescue from erasure.",
          priority: 1,
        },
      },
      consequenceRules: rules,
    });

    res.status(201).json({
      eventId,
      choice,
      companionName,
      receipts: {
        companion: toPublicReceipt(companionReceipt),
        rival: toPublicReceipt(rivalReceipt),
      },
      disagreement: {
        companionDisposition: companionReceipt.disposition,
        rivalDisposition: rivalReceipt.disposition,
        sameDisposition:
          companionReceipt.disposition === rivalReceipt.disposition,
      },
      proofState: "actor-model",
      canonical: false,
      trustBoundary:
        "NPC epistemic receipts are actor-models, not world truth and not POC/FOC validation.",
      correlationId: generateId(),
    });
  });

  return router;
}

function companionObservationsForChoice(choice: EpisodeChoice) {
  switch (choice) {
    case "claim-the-frame":
      return [
        {
          factId: "third-presence",
          meaning: "threat-signal" as const,
          confidence: 0.85,
        },
        {
          factId: "shared-frame",
          meaning: "obstructs-goal" as const,
          confidence: 0.8,
        },
        {
          factId: "no-forge-marks",
          meaning: "ambiguous" as const,
          confidence: 0.5,
        },
      ];
    case "share-the-rescue":
      return [
        {
          factId: "third-presence",
          meaning: "ambiguous" as const,
          confidence: 0.65,
        },
        {
          factId: "shared-frame",
          meaning: "trust-signal" as const,
          confidence: 0.6,
        },
        {
          factId: "no-forge-marks",
          meaning: "supports-goal" as const,
          confidence: 0.7,
        },
      ];
    case "hold-and-ask":
      return [
        {
          factId: "third-presence",
          meaning: "ambiguous" as const,
          confidence: 0.55,
        },
        {
          factId: "shared-frame",
          meaning: "trust-signal" as const,
          confidence: 0.75,
        },
        {
          factId: "no-forge-marks",
          meaning: "supports-goal" as const,
          confidence: 0.8,
        },
      ];
    default: {
      const _exhaustive: never = choice;
      return _exhaustive;
    }
  }
}

function toPublicReceipt(receipt: EpistemicDivergenceReceipt) {
  return {
    receiptId: receipt.receiptId,
    eventId: receipt.eventId,
    actorId: receipt.actorId,
    disposition: receipt.disposition,
    actorBelief: receipt.actorBelief,
    interpretationConfidence: receipt.interpretationConfidence,
    consequence: receipt.consequence
      ? {
          ruleId: receipt.consequence.ruleId,
          effect: receipt.consequence.effect,
          visibility: receipt.consequence.visibility,
        }
      : undefined,
    proofState: receipt.proofState,
    canonical: receipt.canonical,
    createdAt: receipt.createdAt,
  };
}

import { generateId, now, type CompanionId, type CompanionRelationshipLane } from "@jennifer/shared";
import { readGameApiBaseUrl } from "./WorldBridge";

export interface EpisodeRelationshipResult {
  sourceMode: "authoritative" | "local" | "unreachable";
  relationshipId: string;
  questInstanceId: string;
  decisionReceiptId?: string;
  summary: string;
}

export type ThirdSignalChoice =
  | "claim-the-frame"
  | "share-the-rescue"
  | "hold-and-ask";

export interface ThirdSignalEpistemicPublicReceipt {
  receiptId: string;
  eventId: string;
  actorId: string;
  disposition: "CONVERGE" | "DIVERGE" | "HOLD";
  actorBelief?: "supportive" | "threatening" | "ambiguous" | "unknown";
  interpretationConfidence: number;
  consequence?: {
    ruleId: string;
    effect: string;
    visibility: "immediate" | "latent";
  };
  proofState: "actor-model";
  canonical: false;
  createdAt: number;
}

export interface ThirdSignalEpistemicResult {
  sourceMode: "actor-model" | "local" | "unreachable";
  companion: ThirdSignalEpistemicPublicReceipt;
  rival?: ThirdSignalEpistemicPublicReceipt;
  summary: string;
}

/**
 * Creates / updates the player↔companion relationship for the Third Signal episode.
 */
export class EpisodeRelationshipBridge {
  constructor(private readonly apiBaseUrl = readGameApiBaseUrl()) {}

  async ensureRelationship(input: {
    sessionId: string;
    playerName: string;
    companionId: CompanionId | string;
    companionName: string;
    lane: CompanionRelationshipLane;
    existingRelationshipId?: string;
  }): Promise<EpisodeRelationshipResult> {
    if (input.existingRelationshipId) {
      return {
        sourceMode: "local",
        relationshipId: input.existingRelationshipId,
        questInstanceId: `quest-third-signal:${input.sessionId}`,
        summary: "Reusing continuity relationship id.",
      };
    }

    const questInstanceId = `quest-third-signal:${input.sessionId}`;
    const playerActorId = `player:${input.sessionId}`;
    const companionActorId = `companion:${input.companionId}`;

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/relationships`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            relationshipType: "player-companion-bond",
            lane: input.lane,
            createdByActorId: playerActorId,
            idempotencyKey: `city-bond:${input.sessionId}:${input.companionId}`,
            actors: [
              {
                id: playerActorId,
                actorType: "human-player",
                canonicalName: input.playerName,
                role: "sovereign",
              },
              {
                id: companionActorId,
                actorType: "companion",
                canonicalName: input.companionName,
                role: "companion",
                companionId: input.companionId,
              },
            ],
          }),
        },
      );

      const body = (await response.json()) as {
        snapshot?: { relationship?: { id?: string } };
        error?: string;
      };
      const relationshipId =
        body.snapshot?.relationship?.id ?? `local-rel:${input.sessionId}`;

      if (!response.ok) {
        return {
          sourceMode: "local",
          relationshipId,
          questInstanceId,
          summary:
            body.error ??
            `Relationship create returned ${response.status}; using local id.`,
        };
      }

      return {
        sourceMode: "authoritative",
        relationshipId,
        questInstanceId,
        summary: "Player–companion bond created under relationship authority.",
      };
    } catch {
      return {
        sourceMode: "unreachable",
        relationshipId: `local-rel:${input.sessionId}`,
        questInstanceId,
        summary: "API unreachable; local relationship id issued for episode play.",
      };
    }
  }

  async applyDecision(input: {
    relationshipId: string;
    questInstanceId: string;
    sessionId: string;
    selectedOption: string;
    decisionType?: string;
  }): Promise<EpisodeRelationshipResult> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/relationships/${encodeURIComponent(input.relationshipId)}/decisions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            questInstanceId: input.questInstanceId,
            sourceActorId: `player:${input.sessionId}`,
            decisionType: input.decisionType ?? "third-signal-frame-choice",
            selectedOption: input.selectedOption,
            idempotencyKey: `third-signal:${input.sessionId}:${input.selectedOption}`,
            evidenceRefs: [
              "episode:third-signal",
              `choice:${input.selectedOption}`,
            ],
          }),
        },
      );
      const body = (await response.json()) as {
        receipt?: { id?: string };
        error?: string;
      };

      if (!response.ok) {
        return {
          sourceMode: "local",
          relationshipId: input.relationshipId,
          questInstanceId: input.questInstanceId,
          summary:
            body.error ??
            `Decision API returned ${response.status}; choice stored in continuity.`,
        };
      }

      return {
        sourceMode: "authoritative",
        relationshipId: input.relationshipId,
        questInstanceId: input.questInstanceId,
        decisionReceiptId: body.receipt?.id ?? generateId(),
        summary: "Quest decision admitted under relationship authority.",
      };
    } catch {
      return {
        sourceMode: "unreachable",
        relationshipId: input.relationshipId,
        questInstanceId: input.questInstanceId,
        decisionReceiptId: generateId(),
        summary: "API unreachable; decision kept in local continuity.",
      };
    }
  }

  /**
   * Sprint C: ask the API for real EpistemicDivergenceEngine actor-model receipts.
   * Falls back to a local synthetic companion receipt if the API is down.
   */
  async evaluateThirdSignalEpistemic(input: {
    sessionId: string;
    companionId: CompanionId | string;
    companionName: string;
    choice: ThirdSignalChoice;
  }): Promise<ThirdSignalEpistemicResult> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/third-signal/epistemic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            sessionId: input.sessionId,
            companionId: input.companionId,
            companionName: input.companionName,
            choice: input.choice,
          }),
        },
      );
      const body = (await response.json()) as {
        receipts?: {
          companion?: ThirdSignalEpistemicPublicReceipt;
          rival?: ThirdSignalEpistemicPublicReceipt;
        };
        error?: string;
      };

      if (!response.ok || !body.receipts?.companion) {
        return {
          sourceMode: "local",
          companion: localCompanionEpistemic(input),
          summary:
            body.error ??
            `Epistemic API returned ${response.status}; local actor-model used.`,
        };
      }

      return {
        sourceMode: "actor-model",
        companion: body.receipts.companion,
        rival: body.receipts.rival,
        summary:
          "Companion + rival epistemic receipts from EpistemicDivergenceEngine (actor-model).",
      };
    } catch {
      return {
        sourceMode: "unreachable",
        companion: localCompanionEpistemic(input),
        summary: "API unreachable; local actor-model epistemic used.",
      };
    }
  }
}

function localCompanionEpistemic(input: {
  sessionId: string;
  companionId: CompanionId | string;
  companionName: string;
  choice: ThirdSignalChoice;
}): ThirdSignalEpistemicPublicReceipt {
  const beliefByChoice = {
    "claim-the-frame": "threatening" as const,
    "share-the-rescue": "ambiguous" as const,
    "hold-and-ask": "supportive" as const,
  };
  const effectByChoice = {
    "claim-the-frame": "companion-trust-strain",
    "share-the-rescue": "rival-signal-acknowledged",
    "hold-and-ask": "bond-agency-preserved",
  } as const;
  const dispositionByChoice = {
    "claim-the-frame": "DIVERGE" as const,
    "share-the-rescue": "HOLD" as const,
    "hold-and-ask": "HOLD" as const,
  };

  return {
    receiptId: `epistemic-third-signal-local:${input.sessionId}`,
    eventId: `event-signal-breach:${input.sessionId}`,
    actorId: `companion:${input.companionId}`,
    disposition: dispositionByChoice[input.choice],
    actorBelief: beliefByChoice[input.choice],
    interpretationConfidence: 0.72,
    consequence: {
      ruleId: "rule-third-signal-frame-choice",
      effect: effectByChoice[input.choice],
      visibility: "latent",
    },
    proofState: "actor-model",
    canonical: false,
    createdAt: now(),
  };
}

export function buildThirdSignalReveal(input: {
  sessionId: string;
  companionId: CompanionId | string;
  companionName: string;
  choice: ThirdSignalChoice;
  memoryReceiptId?: string;
  epistemic?: ThirdSignalEpistemicPublicReceipt;
}): import("@jennifer/shared").ConsequenceRevealReceipt {
  const timestamp = now();
  const epistemic = input.epistemic ?? localCompanionEpistemic(input);
  const effectFallback = {
    "claim-the-frame": "companion-trust-strain",
    "share-the-rescue": "rival-signal-acknowledged",
    "hold-and-ask": "bond-agency-preserved",
  } as const;

  return {
    revealId: `reveal-third-signal:${input.sessionId}`,
    schemaVersion: 1,
    state: "CAUSE_REVEALED",
    origin: {
      epistemicReceiptId: epistemic.receiptId,
      eventId: epistemic.eventId,
      actorId: epistemic.actorId,
      consequenceRuleId:
        epistemic.consequence?.ruleId ?? "rule-third-signal-frame-choice",
    },
    ...(input.memoryReceiptId
      ? {
          runtimeAdmission: {
            memoryReceiptId: input.memoryReceiptId,
            admission: "admitted" as const,
          },
        }
      : {}),
    effect: epistemic.consequence?.effect ?? effectFallback[input.choice],
    disclosedEvidence: {
      event: [
        "telemetry:signal-breach:third-presence",
        "telemetry:frame:player-companion-seat",
      ],
      policy: ["policy:relational:forge-agency-preserved"],
      maturity: ["telemetry:player-requested-journal"],
      revision: [],
    },
    interpretationHistory: [
      {
        sourceReceiptId: epistemic.receiptId,
        disposition: epistemic.disposition,
        belief: epistemic.actorBelief,
        confidence: epistemic.interpretationConfidence,
        observedFactIds: ["third-presence", "shared-frame"],
        unknownFactIds: ["replacement-intent"],
        recordedAt: timestamp,
      },
    ],
    revisions: [],
    proofState: "player-safe-causal-reveal",
    canonical: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

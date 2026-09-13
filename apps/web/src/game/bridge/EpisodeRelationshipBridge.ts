import { generateId, now, type CompanionId, type CompanionRelationshipLane } from "@jennifer/shared";
import { readGameApiBaseUrl } from "./WorldBridge";

export interface EpisodeRelationshipResult {
  sourceMode: "authoritative" | "local" | "unreachable";
  relationshipId: string;
  questInstanceId: string;
  decisionReceiptId?: string;
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
}

export function buildThirdSignalReveal(input: {
  sessionId: string;
  companionName: string;
  choice: "claim-the-frame" | "share-the-rescue" | "hold-and-ask";
  memoryReceiptId?: string;
}): import("@jennifer/shared").ConsequenceRevealReceipt {
  const timestamp = now();
  const epistemicId = `epistemic-third-signal:${input.sessionId}`;
  const eventId = `event-signal-breach:${input.sessionId}`;
  const effectByChoice = {
    "claim-the-frame": "companion-trust-strain",
    "share-the-rescue": "rival-signal-acknowledged",
    "hold-and-ask": "bond-agency-preserved",
  } as const;

  const beliefByChoice = {
    "claim-the-frame": "threatening" as const,
    "share-the-rescue": "ambiguous" as const,
    "hold-and-ask": "supportive" as const,
  };

  return {
    revealId: `reveal-third-signal:${input.sessionId}`,
    schemaVersion: 1,
    state: "CAUSE_REVEALED",
    origin: {
      epistemicReceiptId: epistemicId,
      eventId,
      actorId: `companion:${input.companionName.toLowerCase()}`,
      consequenceRuleId: "rule-third-signal-frame-choice",
    },
    ...(input.memoryReceiptId
      ? {
          runtimeAdmission: {
            memoryReceiptId: input.memoryReceiptId,
            admission: "admitted" as const,
          },
        }
      : {}),
    effect: effectByChoice[input.choice],
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
        sourceReceiptId: epistemicId,
        disposition: "DIVERGE",
        belief: beliefByChoice[input.choice],
        confidence: 0.78,
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

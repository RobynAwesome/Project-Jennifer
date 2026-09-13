import {
  WORLD_EVENT_SCHEMA_VERSION,
  type StructuredWorldEvent,
  type WorldEventHeartbeatPorts,
} from "./world-event-heartbeat.js";
import type { DistrictManager } from "./jennifer-runtime.js";
import {
  districtHasPlayableScene,
  isDistrictName,
  type DistrictName,
} from "@jennifer/shared";

export function createDistrictEnterEvent(input: {
  eventId: string;
  actorId: string;
  district: DistrictName;
  occurredAt?: string;
}): StructuredWorldEvent {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  return {
    schemaVersion: WORLD_EVENT_SCHEMA_VERSION,
    eventId: input.eventId,
    occurredAt,
    eventType: "district_entered",
    actor: { id: input.actorId, kind: "player" },
    target: { id: input.district, kind: "location" },
    ecosystem: "jennifer",
    telemetry: {
      source: "jennifer-city-game",
      observations: [
        {
          key: "district",
          value: input.district,
          observedAt: occurredAt,
        },
        {
          key: "playable_scene",
          value: districtHasPlayableScene(input.district),
          observedAt: occurredAt,
        },
      ],
      consentScope: "gameplay-telemetry",
    },
    provenance: [
      {
        sourceId: input.eventId,
        uri: `project-jennifer://district/enter/${input.district}`,
        authorityScope: "observed-gameplay-event",
      },
    ],
    affinityEvidence: [
      {
        ecosystem: "jennifer",
        signal: "return",
        strength: districtHasPlayableScene(input.district) ? 0.4 : 0.1,
        basis: "player requested entry at a Jennifer City district portal",
      },
    ],
  };
}

export function parseDistrictName(value: unknown): DistrictName | null {
  return typeof value === "string" && isDistrictName(value) ? value : null;
}

/**
 * In-memory district visit ports. PKA holds unimplemented scenes.
 * Execution only records lastEvent on the DistrictManager — no invented weather,
 * identity, or durable canon.
 */
export function createDistrictEnterPorts(
  districtManager: DistrictManager,
): WorldEventHeartbeatPorts {
  return {
    evaluatePKA: (event) => {
      const district = parseDistrictName(event.target?.id);
      if (!district) {
        return {
          state: "FOC_CANDIDATE",
          disposition: "BLOCK",
          known: [],
          partial: [],
          unknown: ["target district"],
          reasons: ["district name is missing or not in the governed catalog"],
        };
      }
      if (!districtHasPlayableScene(district)) {
        return {
          state: "MAYBE",
          disposition: "HOLD",
          known: [`${district} is a defined Jennifer City district`],
          partial: ["a Phaser scene has not been admitted for this district"],
          unknown: ["what gameplay belongs in this district"],
          reasons: [
            "coming-soon portals must not execute world mutation just because the player walked up",
          ],
        };
      }
      return {
        state: "POC_CANDIDATE",
        disposition: "PROPOSE",
        known: [`${district} has an admitted playable scene`],
        partial: ["visit is in-memory until persistence is explicitly ready"],
        unknown: [],
        reasons: ["bounded district entry can be receipted without promoting canon"],
      };
    },
    interpretGLM: (event) => ({
      summary: `Player requested entry to ${event.target?.id ?? "unknown district"}.`,
      meanings: ["travel", "district-visit", "world-presence"],
      confidence: 0.7,
      modelRef: "glm:district-enter-local",
    }),
    divergeCDP: (event) => [
      {
        id: "record-visit",
        description: "Record lastEvent on the in-memory DistrictManager only.",
        effectClass: "world.district.visit",
        evidenceRefs: event.provenance.map((item) => item.sourceId),
      },
      {
        id: "no-op",
        description: "Acknowledge the request without mutating district state.",
        effectClass: "world.district.noop",
        evidenceRefs: event.provenance.map((item) => item.sourceId),
      },
    ],
    convergeCCP: () => ({
      selectedCandidateId: "record-visit",
      reason: "playable district visits should leave an inspectable lastEvent",
    }),
    validateKPGS: ({ event }) => ({
      status: "APPROVED",
      authority: "kpgs:world-state-gate",
      reasons: [
        "in-memory district lastEvent only",
        "no identity, economy, device, or canon mutation",
        `district=${event.target?.id ?? "unknown"}`,
      ],
    }),
    execute: ({ event }) => {
      const district = parseDistrictName(event.target?.id);
      if (!district) {
        return {
          status: "FAILED",
          effectType: "DISTRICT_VISIT",
          effectSummary: "District name failed at execution.",
        };
      }
      districtManager.recordEvent(district, `entered:${event.eventId}`);
      districtManager.setActivityLevel(district, 0.35);
      return {
        status: "APPLIED",
        effectType: "DISTRICT_VISIT",
        effectSummary: `Recorded in-memory visit to ${district}.`,
      };
    },
  };
}

import assert from "node:assert/strict";
import test from "node:test";

import {
  WORLD_EVENT_SCHEMA_VERSION,
  runWorldEventHeartbeat,
  type StructuredWorldEvent,
  type WorldEventHeartbeatPorts,
} from "./world-event-heartbeat.js";

function mercyRainEvent(): StructuredWorldEvent {
  return {
    schemaVersion: WORLD_EVENT_SCHEMA_VERSION,
    eventId: "evt-mercy-rain-001",
    occurredAt: "2026-08-21T16:00:00.000Z",
    eventType: "guardian_spared",
    actor: { id: "player-001", kind: "player" },
    target: { id: "guardian-001", kind: "npc" },
    ecosystem: "jennifer",
    telemetry: {
      source: "ctrpg-combat-loop",
      observations: [
        { key: "guardian_hp", value: 2, observedAt: "2026-08-21T15:59:58.000Z" },
        { key: "finishing_blow_available", value: true, observedAt: "2026-08-21T15:59:59.000Z" },
        { key: "player_spared_target", value: true, observedAt: "2026-08-21T16:00:00.000Z" },
      ],
      consentScope: "gameplay-telemetry",
    },
    provenance: [
      {
        sourceId: "combat-receipt-001",
        uri: "project-jennifer://combat/receipt/001",
        authorityScope: "observed-gameplay-event",
      },
    ],
    affinityEvidence: [
      {
        ecosystem: "jennifer",
        signal: "care",
        strength: 0.7,
        basis: "player declined an available finishing action against a defeated guardian",
      },
    ],
  };
}

function proposalPorts(trace: string[]): WorldEventHeartbeatPorts {
  return {
    now: () => "2026-08-21T16:00:01.000Z",
    evaluatePKA: () => {
      trace.push("PKA");
      return {
        state: "POC_CANDIDATE",
        disposition: "PROPOSE",
        known: ["guardian was spared"],
        partial: ["symbolic relationship between mercy and weather"],
        unknown: ["whether rain is causally appropriate"],
        reasons: ["bounded gameplay evidence supports a candidate world response, not a permanent player trait"],
        receiptRef: "pka://receipt/001",
      };
    },
    interpretGLM: () => {
      trace.push("GLM");
      return {
        summary: "Mercy may be reflected symbolically by the world without asserting supernatural causality.",
        meanings: ["mercy", "relief", "renewal"],
        confidence: 0.62,
        modelRef: "glm:test",
      };
    },
    divergeCDP: () => {
      trace.push("CDP");
      return [
        {
          id: "rain-blessing",
          description: "Trigger bounded localized rain as a symbolic blessing response.",
          effectClass: "nature.weather.local",
          evidenceRefs: ["combat-receipt-001", "pka://receipt/001"],
        },
        {
          id: "guardian-trust",
          description: "Change only guardian relationship state and leave weather unchanged.",
          effectClass: "npc.relationship",
          evidenceRefs: ["combat-receipt-001"],
        },
      ];
    },
    convergeCCP: () => {
      trace.push("CCP");
      return {
        selectedCandidateId: "rain-blessing",
        reason: "bounded symbolic reflection best matches the current world-state proposal",
        receiptRef: "ccp://receipt/001",
      };
    },
    validateKPGS: () => {
      trace.push("KPGS");
      return {
        status: "APPROVED",
        authority: "kpgs:world-state-gate",
        reasons: ["localized game-world weather effect only", "no real-world device or financial mutation"],
        receiptRef: "kpgs://receipt/001",
      };
    },
    execute: ({ selectedCandidate }) => {
      trace.push("EXECUTE");
      assert.equal(selectedCandidate.id, "rain-blessing");
      return {
        status: "APPLIED",
        effectType: "BLESSING",
        effectSummary: "Localized rain begins in the guardian district.",
      };
    },
  };
}

test("full heartbeat preserves PKA -> GLM -> CDP -> CCP -> KPGS -> execution order and EP trace", async () => {
  const callTrace: string[] = [];
  const result = await runWorldEventHeartbeat(mercyRainEvent(), proposalPorts(callTrace));

  assert.deepEqual(callTrace, ["PKA", "GLM", "CDP", "CCP", "KPGS", "EXECUTE"]);
  assert.equal(result.receipt.status, "EXECUTED");
  assert.deepEqual(result.receipt.epTrace, ["📍", "⏭️", "👑", "🔔"]);
  assert.equal(result.receipt.execution?.effectType, "BLESSING");
  assert.match(result.receipt.receiptId, /^[a-f0-9]{64}$/u);
});

test("PKA MAYBE/HOLD preserves uncertainty and never invokes model, convergence, governance or execution", async () => {
  const callTrace: string[] = [];
  const ports = proposalPorts(callTrace);
  ports.evaluatePKA = () => {
    callTrace.push("PKA");
    return {
      state: "MAYBE",
      disposition: "HOLD",
      known: ["guardian was spared"],
      partial: [],
      unknown: ["meaning of the event is unresolved"],
      reasons: ["insufficient evidence"],
    };
  };

  const result = await runWorldEventHeartbeat(mercyRainEvent(), ports);

  assert.deepEqual(callTrace, ["PKA"]);
  assert.equal(result.receipt.status, "HELD_BY_PKA");
  assert.deepEqual(result.receipt.epTrace, ["📍", "🔔"]);
  assert.equal(result.receipt.glm, undefined);
  assert.equal(result.receipt.execution, undefined);
});

test("PKA FOC/BLOCK prevents downstream interpretation and mutation", async () => {
  const callTrace: string[] = [];
  const ports = proposalPorts(callTrace);
  ports.evaluatePKA = () => {
    callTrace.push("PKA");
    return {
      state: "FOC_CANDIDATE",
      disposition: "BLOCK",
      known: ["requested effect violates a governed invariant"],
      partial: [],
      unknown: [],
      reasons: ["hard invariant violation"],
    };
  };

  const result = await runWorldEventHeartbeat(mercyRainEvent(), ports);

  assert.deepEqual(callTrace, ["PKA"]);
  assert.equal(result.receipt.status, "BLOCKED_BY_PKA");
  assert.deepEqual(result.receipt.epTrace, ["📍", "🔔"]);
});

test("KPGS HITL_REQUIRED reaches authority but never executes", async () => {
  const callTrace: string[] = [];
  const ports = proposalPorts(callTrace);
  ports.validateKPGS = () => {
    callTrace.push("KPGS");
    return {
      status: "HITL_REQUIRED",
      authority: "kpgs:external-consequence-gate",
      reasons: ["candidate requests a consequential external-device change"],
    };
  };

  const result = await runWorldEventHeartbeat(mercyRainEvent(), ports);

  assert.deepEqual(callTrace, ["PKA", "GLM", "CDP", "CCP", "KPGS"]);
  assert.equal(result.receipt.status, "HITL_REQUIRED");
  assert.deepEqual(result.receipt.epTrace, ["📍", "⏭️", "👑", "🔔"]);
  assert.equal(result.receipt.execution, undefined);
});

test("CCP cannot select a candidate that CDP did not produce", async () => {
  const ports = proposalPorts([]);
  ports.convergeCCP = () => ({ selectedCandidateId: "invented-candidate", reason: "bad selector" });

  await assert.rejects(
    () => runWorldEventHeartbeat(mercyRainEvent(), ports),
    /CCP selected unknown CDP candidate/u,
  );
});

test("affinity evidence remains bounded evidence and rejects invalid strength", async () => {
  const event = mercyRainEvent();
  const invalid: StructuredWorldEvent = {
    ...event,
    affinityEvidence: [
      {
        ecosystem: "rtc",
        signal: "governance",
        strength: 1.2,
        basis: "invalid over-range score",
      },
    ],
  };

  await assert.rejects(
    () => runWorldEventHeartbeat(invalid, proposalPorts([])),
    /affinity evidence governance strength must be between 0 and 1/u,
  );
});

test("PKA state and disposition cannot silently contradict each other", async () => {
  const ports = proposalPorts([]);
  ports.evaluatePKA = () => ({
    state: "MAYBE",
    disposition: "PROPOSE",
    known: [],
    partial: [],
    unknown: ["unresolved"],
    reasons: ["malformed adapter output"],
  });

  await assert.rejects(
    () => runWorldEventHeartbeat(mercyRainEvent(), ports),
    /PKA state\/disposition mismatch/u,
  );
});

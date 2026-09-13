import assert from "node:assert/strict";
import test from "node:test";

import { DistrictManager } from "./jennifer-runtime.js";
import { runWorldEventHeartbeat } from "./world-event-heartbeat.js";
import {
  createDistrictEnterEvent,
  createDistrictEnterPorts,
} from "./world-event-district-enter.js";

test("playable district entry receipts a visit without inventing world weather", async () => {
  const districts = new DistrictManager();
  const result = await runWorldEventHeartbeat(
    createDistrictEnterEvent({
      eventId: "evt-enter-memory-001",
      actorId: "player-test",
      district: "memory-district",
      occurredAt: "2026-09-13T06:00:00.000Z",
    }),
    createDistrictEnterPorts(districts),
  );

  assert.equal(result.receipt.status, "EXECUTED");
  assert.deepEqual(result.receipt.epTrace, ["📍", "⏭️", "👑", "🔔"]);
  assert.equal(districts.getDistrict("memory-district")?.lastEvent, "entered:evt-enter-memory-001");
});

test("playable telemetry tower entry receipts a visit", async () => {
  const districts = new DistrictManager();
  const result = await runWorldEventHeartbeat(
    createDistrictEnterEvent({
      eventId: "evt-enter-tower-001",
      actorId: "player-test",
      district: "telemetry-tower",
      occurredAt: "2026-09-13T06:00:00.000Z",
    }),
    createDistrictEnterPorts(districts),
  );

  assert.equal(result.receipt.status, "EXECUTED");
  assert.equal(districts.getDistrict("telemetry-tower")?.lastEvent, "entered:evt-enter-tower-001");
});

test("unimplemented district portals hold instead of mutating world state", async () => {
  const districts = new DistrictManager();
  const result = await runWorldEventHeartbeat(
    createDistrictEnterEvent({
      eventId: "evt-enter-hue-001",
      actorId: "player-test",
      district: "hue-institute",
      occurredAt: "2026-09-13T06:00:00.000Z",
    }),
    createDistrictEnterPorts(districts),
  );

  assert.equal(result.receipt.status, "HELD_BY_PKA");
  assert.deepEqual(result.receipt.epTrace, ["📍", "🔔"]);
  assert.equal(districts.getDistrict("hue-institute")?.lastEvent, undefined);
});

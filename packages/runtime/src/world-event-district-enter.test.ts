import assert from "node:assert/strict";
import test from "node:test";

import { DISTRICT_NAMES, districtHasPlayableScene } from "@jennifer/shared";
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

test("every admitted district room receipts a visit", async () => {
  const districts = new DistrictManager();
  const playable = DISTRICT_NAMES.filter(districtHasPlayableScene);

  assert.equal(playable.length, 9);

  for (const district of playable) {
    const result = await runWorldEventHeartbeat(
      createDistrictEnterEvent({
        eventId: `evt-enter-${district}-001`,
        actorId: "player-test",
        district,
        occurredAt: "2026-09-13T06:00:00.000Z",
      }),
      createDistrictEnterPorts(districts),
    );
    assert.equal(result.receipt.status, "EXECUTED", district);
    assert.equal(
      districts.getDistrict(district)?.lastEvent,
      `entered:evt-enter-${district}-001`,
    );
  }
});

test("the hall hub holds as a portal because it is already the hub scene", async () => {
  const districts = new DistrictManager();
  const result = await runWorldEventHeartbeat(
    createDistrictEnterEvent({
      eventId: "evt-enter-hall-001",
      actorId: "player-test",
      district: "central-governance-hall",
      occurredAt: "2026-09-13T06:00:00.000Z",
    }),
    createDistrictEnterPorts(districts),
  );

  assert.equal(result.receipt.status, "HELD_BY_PKA");
  assert.deepEqual(result.receipt.epTrace, ["📍", "🔔"]);
  assert.equal(districts.getDistrict("central-governance-hall")?.lastEvent, undefined);
});

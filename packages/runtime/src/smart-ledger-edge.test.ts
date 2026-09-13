import assert from "node:assert/strict";
import test from "node:test";

import { SmartLedgerError } from "@jennifer/shared";

import {
  SmartLedgerEdgeRuntime,
  createCiAdapters,
} from "./smart-ledger-edge.js";

function writeOnce(runtime: SmartLedgerEdgeRuntime, id = "edge-1") {
  return runtime.writeOffline({
    receiptId: id,
    idempotencyKey: "idem-close-issue",
    actorIdentity: "player-test",
    sessionId: "session-ledger-1",
    claimType: "offline-consequence",
    pkaVerdict: "HOLD",
    pkaDisposition: "POC_CANDIDATE",
    evidenceRefs: ["kmec:obs-1"],
    kmecObservationRef: "kmec:obs-1",
    pkaReceiptRef: "pka:receipt-1",
    plaintextPayload: JSON.stringify({ action: "queued-offline" }),
  });
}

test("Apple and Android CI doubles persist encrypted offline receipts and reconcile once", () => {
  for (const platform of ["apple", "android"] as const) {
    const adapters = createCiAdapters();
    const live = new SmartLedgerEdgeRuntime(adapters[platform]);
    writeOnce(live);
    const dumped = live.serializeEdge();

    const restarted = new SmartLedgerEdgeRuntime(adapters[platform]);
    restarted.restoreEdge(dumped);
    const first = restarted.reconcile();
    assert.equal(first[0]?.outcome, "admitted", platform);
    assert.equal(restarted.postgresCount(), 1, platform);

    const second = restarted.reconcile();
    assert.equal(second[0]?.outcome, "duplicate", platform);
    assert.equal(restarted.postgresCount(), 1, platform);
    assert.equal(restarted.rebuildMongoFromPostgres().length, 1, platform);
    assert.equal(first[0]?.hardwareProof, "ci-double-only");
  }
});

test("tamper is detected before authoritative admission and conflict is receipted", () => {
  const { apple } = createCiAdapters();
  const runtime = new SmartLedgerEdgeRuntime(apple);
  writeOnce(runtime);
  const dumped = JSON.parse(runtime.serializeEdge()) as Array<{ contentHash: string }>;
  dumped[0]!.contentHash = "deadbeef";
  runtime.restoreEdge(JSON.stringify(dumped));
  const result = runtime.reconcile();
  assert.equal(result[0]?.outcome, "conflict");
  assert.equal(runtime.postgresCount(), 0);
  assert.ok(runtime.queueStates().includes("conflict"));
});

test("private platform keys cannot be exported into model context", () => {
  const { android } = createCiAdapters();
  assert.throws(() => android.exportPrivateMaterial(), SmartLedgerError);
});

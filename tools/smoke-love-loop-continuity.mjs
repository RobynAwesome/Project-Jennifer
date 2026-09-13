#!/usr/bin/env node
/**
 * Sprint A smoke: love-loop continuity membrane against a running Jennifer API.
 *
 * Usage:
 *   node tools/smoke-love-loop-continuity.mjs
 *   JENNIFER_API_URL=http://127.0.0.1:3001 node tools/smoke-love-loop-continuity.mjs
 *
 * Exit 0 = membrane pass. Exit 1 = FOC. Does not claim hosted production love.
 */

const API = (process.env.JENNIFER_API_URL ?? "http://127.0.0.1:3001").replace(
  /\/$/,
  "",
);
const sessionId = `smoke-${crypto.randomUUID()}`;

const steps = [];

function record(name, ok, detail) {
  steps.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FOC";
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function json(method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Origin: "http://127.0.0.1:3000",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }
  return { response, body: parsed };
}

async function main() {
  console.log(`Jennifer City love-loop continuity smoke → ${API}`);
  console.log(`sessionId=${sessionId}`);

  try {
    const health = await json("GET", "/health");
    record(
      "health",
      health.response.ok,
      `status=${health.response.status} bodyStatus=${health.body.status ?? "?"}`,
    );
  } catch (error) {
    record("health", false, `unreachable: ${error.message}`);
    fail();
  }

  const companion = await json("POST", "/api/runtime/companions/select", {
    userId: sessionId,
    companionId: "aura",
    relationshipLane: "co-builder",
    renderMode: "core-logic",
  });
  record(
    "companion.select",
    companion.response.status === 201 &&
      companion.body.receipt?.result === "PASSED",
    `http=${companion.response.status} result=${companion.body.receipt?.result ?? companion.body.error}`,
  );

  const continuity = await json("POST", "/api/runtime/game-continuity", {
    schemaVersion: 1,
    sessionId,
    companionId: "aura",
    companionName: "Aura",
    companionLane: "co-builder",
    questComplete: false,
  });
  record(
    "continuity.write",
    continuity.response.status === 201 &&
      continuity.body.sourceMode === "continuity-store",
    `http=${continuity.response.status} sourceMode=${continuity.body.sourceMode}`,
  );

  const loaded = await json(
    "GET",
    `/api/runtime/game-continuity/${encodeURIComponent(sessionId)}`,
  );
  record(
    "continuity.read",
    loaded.response.ok && loaded.body.snapshot?.companionId === "aura",
    `http=${loaded.response.status} companion=${loaded.body.snapshot?.companionId}`,
  );

  const revealId = `reveal-smoke:${sessionId}`;
  const reveal = await json(
    "POST",
    `/api/runtime/game-continuity/${encodeURIComponent(sessionId)}/reveals`,
    {
      receipt: {
        revealId,
        schemaVersion: 1,
        state: "CAUSE_REVEALED",
        origin: {
          epistemicReceiptId: `epistemic-smoke:${sessionId}`,
          eventId: `event-smoke:${sessionId}`,
          actorId: "companion:aura",
          consequenceRuleId: "rule-smoke",
        },
        runtimeAdmission: {
          memoryReceiptId: `memory-smoke:${sessionId}`,
          admission: "admitted",
        },
        effect: "smoke-effect",
        disclosedEvidence: { event: [], policy: [], maturity: [], revision: [] },
        interpretationHistory: [],
        revisions: [],
        proofState: "player-safe-causal-reveal",
        canonical: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
  );
  record(
    "continuity.reveal",
    reveal.response.status === 201 && reveal.body.sourceMode === "continuity-store",
    `http=${reveal.response.status} sourceMode=${reveal.body.sourceMode}`,
  );

  const orphanSession = `smoke-orphan-${crypto.randomUUID()}`;
  const orphan = await json(
    "POST",
    `/api/runtime/game-continuity/${encodeURIComponent(orphanSession)}/reveals`,
    {
      receipt: {
        revealId: "orphan",
        schemaVersion: 1,
        state: "LATENT",
        origin: {
          epistemicReceiptId: "x",
          eventId: "y",
          actorId: "z",
          consequenceRuleId: "r",
        },
        disclosedEvidence: { event: [], policy: [], maturity: [], revision: [] },
        interpretationHistory: [],
        revisions: [],
        proofState: "player-safe-causal-reveal",
        canonical: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
  );
  record(
    "continuity.reveal.requires-snapshot",
    orphan.response.status === 404,
    `http=${orphan.response.status} (expect 404)`,
  );

  const badId = await json("POST", "/api/runtime/game-continuity", {
    schemaVersion: 1,
    sessionId: "bad id with spaces!!!",
  });
  record(
    "continuity.reject-bad-sessionId",
    badId.response.status === 400,
    `http=${badId.response.status} (expect 400)`,
  );

  const epistemic = await json("POST", "/api/runtime/third-signal/epistemic", {
    sessionId,
    companionId: "aura",
    companionName: "Aura",
    choice: "claim-the-frame",
  });
  const companionReceipt = epistemic.body.receipts?.companion;
  const rivalReceipt = epistemic.body.receipts?.rival;
  record(
    "third-signal.epistemic",
    epistemic.response.status === 201 &&
      epistemic.body.proofState === "actor-model" &&
      epistemic.body.canonical === false &&
      typeof companionReceipt?.receiptId === "string" &&
      typeof rivalReceipt?.receiptId === "string" &&
      companionReceipt.disposition !== rivalReceipt.disposition,
    `http=${epistemic.response.status} companion=${companionReceipt?.disposition} rival=${rivalReceipt?.disposition} disagree=${companionReceipt?.disposition !== rivalReceipt?.disposition}`,
  );

  const badChoice = await json("POST", "/api/runtime/third-signal/epistemic", {
    sessionId,
    companionId: "aura",
    choice: "not-a-choice",
  });
  record(
    "third-signal.reject-bad-choice",
    badChoice.response.status === 400,
    `http=${badChoice.response.status} (expect 400)`,
  );

  const failed = steps.filter((step) => !step.ok);
  if (failed.length) {
    console.error(`\nFOC: ${failed.length}/${steps.length} steps failed.`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `\nPASS: ${steps.length}/${steps.length} continuity + epistemic membrane checks. Hosted production love is NOT claimed.`,
  );
}

function fail() {
  console.error("\nFOC: API unreachable. Start @jennifer/api on :3001 first.");
  process.exitCode = 1;
}

main();

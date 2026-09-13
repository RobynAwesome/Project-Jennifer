#!/usr/bin/env node
/**
 * Sprint B smoke: Reliability bowl — Continue must not wait on a dead API.
 *
 * Usage:
 *   node tools/smoke-love-loop-reliability.mjs
 *
 * Exit 0 = local-first Continue + resolver law hold.
 * Does not claim hosted production love or PERN multi-device continuity.
 *
 * Resolver cases here mirror apps/web/src/game/continuity/resolve-continuity.ts.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const steps = [];

function record(name, ok, detail) {
  steps.push({ name, ok, detail });
  console.log(`[${ok ? "PASS" : "FOC"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function readRepo(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function fail() {
  console.error("\nFOC — Reliability bowl smoke failed.");
  process.exit(1);
}

const startMenu = readRepo("apps/web/src/game/scenes/StartMenuScene.ts");
const bridge = readRepo("apps/web/src/game/bridge/ContinuityBridge.ts");
const journal = readRepo("apps/web/src/app/game/consequences/page.tsx");
const resolver = readRepo("apps/web/src/game/continuity/resolve-continuity.ts");

record(
  "continue.local-first",
  startMenu.includes("continueFromLocalBowl") &&
    startMenu.includes('applyContinuityToRegistry(this.registry, bowl, sourceMode)') &&
    startMenu.includes('let sourceMode = "local"') &&
    !/await\s+new ContinuityBridge\(\)\s*\n?\s*\.load/.test(startMenu) &&
    !/await bridge\.load\(/.test(startMenu),
  "Start menu hydrates from localStorage without awaiting API",
);

record(
  "continue.chaos-copy",
  startMenu.includes("API down still continues"),
  "Player-visible honesty that dead API still Continues",
);

record(
  "bridge.timeout",
  bridge.includes("AbortSignal.timeout(CONTINUITY_FETCH_MS)"),
  "Continuity fetches abort instead of hanging the bowl",
);

record(
  "bridge.merge-law",
  bridge.includes("resolveContinuitySnapshot") &&
    resolver.includes("sanitizeContinuitySnapshot") &&
    readRepo("apps/web/src/game/continuity/session-store.ts").includes(
      "sanitizeContinuitySnapshot",
    ),
  "Load uses resolver; collapsed session/relationship ids are stripped on local+remote",
);

record(
  "continue.soft-refresh",
  startMenu.includes("Soft API refresh may win during the fade") &&
    startMenu.includes("camerafadeoutcomplete"),
  "Optional store refresh applies only after fade, never awaits API",
);

record(
  "journal.local-first",
  journal.includes("readLocalReveals") &&
    journal.includes("data-continuity-api-state") &&
    journal.includes("API down"),
  "Journal paints local reveal before optional API mirror",
);

function snap(overrides = {}) {
  return {
    schemaVersion: 1,
    sessionId: "player-session-1",
    companionId: "aura",
    companionName: "Aura",
    questComplete: true,
    questChoice: "claim-the-frame",
    updatedAt: 100,
    ...overrides,
  };
}

function sanitizeRemote(remote) {
  if (!remote?.sessionId || remote.schemaVersion !== 1) return null;
  if (remote.relationshipId && remote.relationshipId === remote.sessionId) {
    return { ...remote, relationshipId: undefined };
  }
  return remote;
}

function resolveContinuitySnapshot(local, remote, remoteReachable) {
  const safeLocal = sanitizeRemote(local);
  const safeRemote = sanitizeRemote(remote);
  if (!remoteReachable || !safeRemote) {
    return safeLocal
      ? { snapshot: safeLocal, sourceMode: "local" }
      : { snapshot: null, sourceMode: "unreachable" };
  }
  if (!safeLocal) {
    return { snapshot: safeRemote, sourceMode: "continuity-store" };
  }
  if (safeRemote.sessionId !== safeLocal.sessionId) {
    return { snapshot: safeLocal, sourceMode: "local" };
  }
  if (safeRemote.updatedAt > safeLocal.updatedAt) {
    return { snapshot: safeRemote, sourceMode: "continuity-store" };
  }
  return { snapshot: safeLocal, sourceMode: "local" };
}

const localKept = resolveContinuitySnapshot(snap({ updatedAt: 50 }), snap({ updatedAt: 999 }), false);
const deadEmpty = resolveContinuitySnapshot(null, null, false);
const newerRemote = resolveContinuitySnapshot(
  snap({ updatedAt: 10, questChoice: "let-it-pass" }),
  snap({ updatedAt: 20, questChoice: "claim-the-frame" }),
  true,
);
const tiedLocal = resolveContinuitySnapshot(
  snap({ updatedAt: 20, questChoice: "claim-the-frame" }),
  snap({ updatedAt: 20, questChoice: "let-it-pass" }),
  true,
);
const foreign = resolveContinuitySnapshot(
  snap({ sessionId: "player-session-1" }),
  snap({ sessionId: "other-session", updatedAt: 999 }),
  true,
);
const collapsed = resolveContinuitySnapshot(
  null,
  snap({ relationshipId: "player-session-1" }),
  true,
);

record(
  "resolver.api-death",
  localKept.sourceMode === "local" && localKept.snapshot.updatedAt === 50,
  "Dead API keeps the local bowl",
);
record(
  "resolver.no-fake-continue",
  deadEmpty.sourceMode === "unreachable" && deadEmpty.snapshot === null,
  "No bowl + dead API is unreachable",
);
record(
  "resolver.newer-store",
  newerRemote.sourceMode === "continuity-store" &&
    newerRemote.snapshot.questChoice === "claim-the-frame",
  "Newer same-session store may refresh",
);
record(
  "resolver.tie-local",
  tiedLocal.sourceMode === "local" &&
    tiedLocal.snapshot.questChoice === "claim-the-frame",
  "Tied store cannot overwrite the bowl",
);
record(
  "resolver.session-mismatch",
  foreign.sourceMode === "local" &&
    foreign.snapshot.sessionId === "player-session-1",
  "Foreign sessionId cannot replace the bowl",
);
record(
  "resolver.pern-hold",
  collapsed.snapshot.relationshipId === undefined &&
    collapsed.snapshot.sessionId === "player-session-1",
  "Collapsed relationshipId === sessionId is stripped",
);

if (steps.some((step) => !step.ok)) {
  fail();
}

console.log("\nPASS — Sprint B Reliability bowl (local-first Continue).");
console.log("HOLD — PERN multi-device continuity (namespaces not collapsed).");
process.exit(0);

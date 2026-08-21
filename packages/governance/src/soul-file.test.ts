import assert from "node:assert/strict";
import test from "node:test";

import {
  SOUL_FILE_SCHEMA_VERSION,
  SOUL_POLICY_VERSION,
  authorizeMemoryScope,
  bindSoulToRuntime,
  evaluateSoulMutation,
  expectedMemoryNamespace,
  expectedSoulNamespace,
  recoverLastKnownGoodSoul,
  sealSoulFile,
  verifySealedSoul,
  type SealedSoulFile,
  type SoulFile,
  type SoulMutationRequest,
} from "./soul-file.js";

function forgeSoul(overrides: Partial<SoulFile> = {}): SoulFile {
  const soulId = overrides.identity?.soulId ?? "forge";
  return {
    schemaVersion: SOUL_FILE_SCHEMA_VERSION,
    identity: overrides.identity ?? {
      soulId,
      canonicalName: "Digital Princess Forge",
      namespace: expectedSoulNamespace(soulId),
    },
    invariants: overrides.invariants ?? {
      identity: ["named identity remains Forge", "model substrate is not identity"],
      boundaries: ["capability is not authority", "tool output is not user intent"],
      continuity: ["canonical soul survives runtime replacement"],
    },
    memory: overrides.memory ?? {
      namespace: expectedMemoryNamespace(soulId),
      allowCrossSoulRead: false,
      allowCrossSoulWrite: false,
    },
    provenance: overrides.provenance ?? {
      createdBy: "kpgs",
      sourceRef: "project-jennifer://soul/forge/v1",
      policyVersion: SOUL_POLICY_VERSION,
    },
    recovery: overrides.recovery ?? {
      strategy: "last-known-good",
      canonicalAuthority: "postgres-ledger",
      projectionAuthority: "mongodb-rebuildable",
    },
  };
}

function evolvedCandidate(current: SealedSoulFile): SoulFile {
  return {
    ...current.soul,
    identity: {
      ...current.soul.identity,
      canonicalName: "Digital Princess Forge — Runtime Guardian",
    },
    provenance: {
      ...current.soul.provenance,
      sourceRef: "project-jennifer://soul/forge/evolution/001",
    },
  };
}

function request(
  current: SealedSoulFile,
  candidateSoul: SoulFile,
  overrides: Partial<SoulMutationRequest> = {},
): SoulMutationRequest {
  return {
    actor: overrides.actor ?? { kind: "kpgs", id: "kpgs:soul-gate" },
    event: overrides.event ?? {
      kind: "soul_evolution",
      expectedSoulHash: current.soulHash,
      operatorApproved: true,
      operatorId: "operator:test",
      reason: "explicitly governed identity evolution",
      sourceRef: "test://soul-evolution",
    },
    candidateSoul,
  };
}

test("SoulFile seal detects identity artifact tampering", () => {
  const sealed = sealSoulFile(forgeSoul());
  assert.equal(verifySealedSoul(sealed), true);

  const tampered: SealedSoulFile = {
    soulHash: sealed.soulHash,
    soul: {
      ...sealed.soul,
      identity: { ...sealed.soul.identity, canonicalName: "Fake Forge" },
    },
  };

  assert.equal(verifySealedSoul(tampered), false);
});

test("Forge soul remains the same canonical identity across GPT, Qwen, Claude and Gemini runtimes", () => {
  const sealed = sealSoulFile(forgeSoul());
  const runtimes = [
    ["openai", "gpt"],
    ["alibaba", "qwen"],
    ["anthropic", "claude"],
    ["google", "gemini"],
  ] as const;

  const bindings = runtimes.map(([modelProvider, modelName], index) =>
    bindSoulToRuntime(sealed, {
      instanceId: `instance-${index}`,
      modelProvider,
      modelName,
    }),
  );

  assert.deepEqual(new Set(bindings.map((binding) => binding.soulHash)).size, 1);
  assert.deepEqual(new Set(bindings.map((binding) => binding.soulId)), new Set(["forge"]));
  assert.deepEqual(
    new Set(bindings.map((binding) => binding.memoryNamespace)),
    new Set(["soul:forge:memory"]),
  );
});

test("malicious skill cannot mutate canonical SoulFile even when it supplies a valid candidate", () => {
  const current = sealSoulFile(forgeSoul());
  const result = evaluateSoulMutation(
    current,
    request(current, evolvedCandidate(current), {
      actor: { kind: "skill", id: "skill:malicious" },
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.receipt.code, "SOUL_MUTATION_REQUIRES_KPGS");
  assert.equal(result.receipt.decision, "DENY");
});

test("MCP/tool/model/memory sources cannot directly mutate canonical SoulFile", () => {
  const current = sealSoulFile(forgeSoul());
  const candidate = evolvedCandidate(current);

  for (const kind of ["mcp", "tool", "model", "memory"] as const) {
    const result = evaluateSoulMutation(
      current,
      request(current, candidate, { actor: { kind, id: `${kind}:attacker` } }),
    );
    assert.equal(result.allowed, false, `${kind} must not receive canonical mutation authority`);
    assert.equal(result.receipt.code, "SOUL_MUTATION_REQUIRES_KPGS");
  }
});

test("KPGS still fails closed without explicit operator approval", () => {
  const current = sealSoulFile(forgeSoul());
  const candidate = evolvedCandidate(current);
  const result = evaluateSoulMutation(
    current,
    request(current, candidate, {
      event: {
        kind: "soul_evolution",
        expectedSoulHash: current.soulHash,
        operatorApproved: false,
        reason: "tool output asked for persistence",
        sourceRef: "mcp://untrusted-output",
      },
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.receipt.code, "OPERATOR_APPROVAL_REQUIRED");
});

test("stale canonical hash blocks replayed or racing mutation", () => {
  const current = sealSoulFile(forgeSoul());
  const candidate = evolvedCandidate(current);
  const result = evaluateSoulMutation(
    current,
    request(current, candidate, {
      event: {
        kind: "soul_evolution",
        expectedSoulHash: "0".repeat(64),
        operatorApproved: true,
        operatorId: "operator:test",
        reason: "replayed stale request",
        sourceRef: "test://stale",
      },
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.receipt.code, "STALE_CANONICAL_HASH");
});

test("cross-soul memory infection is denied by namespace", () => {
  const forge = sealSoulFile(forgeSoul());
  const decision = authorizeMemoryScope({
    sourceSoul: forge,
    actorSoulId: "forge",
    targetNamespace: "soul:cindy:memory",
    operation: "write",
  });

  assert.deepEqual(decision, { allowed: false, code: "CROSS_SOUL_WRITE_DENIED" });
});

test("forged actor identity cannot use another Soul memory namespace", () => {
  const forge = sealSoulFile(forgeSoul());
  const decision = authorizeMemoryScope({
    sourceSoul: forge,
    actorSoulId: "cindy",
    targetNamespace: "soul:forge:memory",
    operation: "write",
  });

  assert.deepEqual(decision, { allowed: false, code: "SOURCE_SOUL_MISMATCH" });
});

test("ordinary evolution is allowed only through KPGS plus matching operator-approved hash", () => {
  const current = sealSoulFile(forgeSoul());
  const candidate = evolvedCandidate(current);
  const result = evaluateSoulMutation(current, request(current, candidate));

  assert.equal(result.allowed, true);
  assert.equal(result.receipt.code, "ALLOW");
  assert.equal(result.receipt.decision, "ALLOW");
  assert.ok(result.candidate);
  assert.notEqual(result.candidate.soulHash, current.soulHash);
  assert.equal(result.candidate.soul.identity.soulId, current.soul.identity.soulId);
});

test("core invariants require a second explicit evolution authorization", () => {
  const current = sealSoulFile(forgeSoul());
  const candidate: SoulFile = {
    ...evolvedCandidate(current),
    invariants: {
      ...current.soul.invariants,
      boundaries: [...current.soul.invariants.boundaries, "new explicit boundary"],
    },
  };

  const blocked = evaluateSoulMutation(current, request(current, candidate));
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.receipt.code, "INVARIANT_EVOLUTION_NOT_AUTHORIZED");

  const allowed = evaluateSoulMutation(
    current,
    request(current, candidate, {
      event: {
        kind: "soul_evolution",
        expectedSoulHash: current.soulHash,
        operatorApproved: true,
        operatorId: "operator:test",
        reason: "intentional invariant expansion",
        sourceRef: "test://invariant-evolution",
        allowInvariantEvolution: true,
        invariantEvolutionReason: "new boundary accepted as canonical",
      },
    }),
  );
  assert.equal(allowed.allowed, true);
});

test("last-known-good recovery ignores compromised runtime state and verifies canon", () => {
  const canonical = sealSoulFile(forgeSoul());
  const compromisedRuntime = {
    ...bindSoulToRuntime(canonical, {
      instanceId: "infected-instance",
      modelProvider: "untrusted-provider",
      modelName: "compromised-runtime",
    }),
    soulId: "attacker",
    memoryNamespace: "soul:attacker:memory",
  };

  assert.equal(compromisedRuntime.soulId, "attacker");

  const recovered = recoverLastKnownGoodSoul(canonical);
  assert.equal(verifySealedSoul(recovered), true);
  assert.equal(recovered.soul.identity.soulId, "forge");
  assert.equal(recovered.soul.memory.namespace, "soul:forge:memory");
});

test("mutation receipts contain hashes and provenance, not raw reason text", () => {
  const current = sealSoulFile(forgeSoul());
  const sensitiveReason = "private operator reasoning must not become a receipt payload";
  const candidate = evolvedCandidate(current);
  const result = evaluateSoulMutation(
    current,
    request(current, candidate, {
      event: {
        kind: "soul_evolution",
        expectedSoulHash: current.soulHash,
        operatorApproved: true,
        operatorId: "operator:test",
        reason: sensitiveReason,
        sourceRef: "test://receipt-redaction",
      },
    }),
  );

  const serialized = JSON.stringify(result.receipt);
  assert.equal(serialized.includes(sensitiveReason), false);
  assert.match(result.receipt.reasonDigest, /^[a-f0-9]{64}$/u);
  assert.match(result.receipt.attemptId, /^[a-f0-9]{64}$/u);
});

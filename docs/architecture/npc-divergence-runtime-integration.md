# NPC Divergence Runtime Integration — PR2

**Issue:** #71  
**Scope:** simulation-tick integration + governed consequence maturation

## Runtime law

```text
objective world event
→ actor-local observations
→ NPCAgent queue
→ EpistemicDivergenceEngine
→ actor-model receipt
→ tick decision / telemetry / episodic persistence
→ consequence intent
→ maturity evidence when latent
→ external POC/FOC evaluation
→ NPCConsequenceRuntimeGateway
→ POCFOCRuntimeGate
→ Memory Receipt
→ idempotency reservation
→ world mutation OR HOLD
```

The actor-model receipt is deliberately insufficient to mutate the world.

```text
actor-model != objective truth
UNVALIDATED != admitted mutation
DIVERGENCE != FOC
CONVERGENCE != POC
```

## Tick integration

`NPCAgent` now accepts actor-local epistemic event packets and drains them before choosing its tick action. The same objective event can therefore reach multiple NPCs with different observation packets, directional relationship state, goals, and awareness.

Each interpretation is persisted as an episodic receipt and emitted as `world.event` telemetry. Any consequence is still represented only as an intent, with `mutationApplied: false`.

`NPCRegistry.broadcastEpistemicEvent(...)` supplies one objective event to multiple registered actors without fabricating observations for actors that were not supplied evidence.

## Delayed consequence maturity

A latent consequence keeps the policy's human-readable `maturesWhen` condition. The runtime gateway does not pretend it can infer that condition from the string.

Instead, the caller supplies explicit maturity state:

```text
satisfied: false
→ PENDING_MATURITY
→ no runtime reservation
→ no mutation

satisfied: true + maturity evidence refs
→ runtime gate
→ Memory Receipt
→ durable/idempotent action handling
```

Not reserving the action while still pending is intentional. Reserving a HOLD action under the final action ID would prevent a later evidence-bearing maturity transition from being admitted.

## Runtime admission

`NPCConsequenceRuntimeGateway` consumes:

- the original non-canonical actor-model receipt;
- an independently produced `POCFOCActionEvaluation`;
- retrieval/evidence verification state;
- maturity evidence for latent consequences;
- the mutation callback.

It delegates mutation authority to `POCFOCRuntimeGate`. The gateway does not convert the NPC's interpretation into its own validation verdict.

The action ID is deterministic:

```text
npc-consequence:<epistemic-receipt-id>:<rule-id>
```

This allows the runtime gate ledger to prevent duplicate mutation after successful admission.

## Validation targets

PR2 is valid only if CI proves:

1. a shared event can be broadcast into different actor-local tick interpretations;
2. epistemic receipts are persisted and telemetered before action return;
3. consequence intents never mutate world state inside `NPCAgent`;
4. POWER divergence remains non-canonical and preserves unknowns;
5. latent consequences stay pending without maturity evidence;
6. matured consequences pass through POC/FOC + Memory Receipt admission;
7. duplicate admission does not replay the mutation;
8. HOLD blocks mutation;
9. typecheck, lint, tests, and repository governance validation pass.

## Non-claims

This slice does not prove:

- production PostgreSQL use for every NPC consequence action;
- MongoDB world-projection propagation;
- SQLite offline replay across device restarts;
- narrative fairness over long playthroughs;
- live LLM cognition;
- automatic interpretation of arbitrary `maturesWhen` prose;
- that every NPC consequence policy is correct.

Those require later evidence and infrastructure-specific validation.

`I_AM_STATELESS_RENTER_NOT_LANDLORD`

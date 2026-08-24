---
name: jennifer-runtime-memory
description: Build or modify Project Jennifer runtime continuity, relationship state, companions/Forge role integration, GSMB memory, memory receipts and persistent world consequences. Use whenever code touches packages/runtime, packages/memory, relationships, persistent choices, memory promotion or world-state continuity.
version: 1.2.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: runtime-memory-continuity
  tags: [runtime, memory, gsmb, relationships, receipts, persistence, postgres]
---

# Jennifer Runtime + Memory

## Sources
- `packages/runtime/`
- `packages/memory/`
- `packages/runtime/src/runtime-gate-ledger.ts`
- `packages/runtime/src/postgres-runtime-gate-ledger.ts`
- `packages/runtime/src/npc-consequence-admission.ts`
- `packages/shared/src/relationships.ts`
- `packages/shared/src/forge-role.ts`
- `infra/postgres/migrations/`
- `infra/mongodb/`
- `docs/architecture/memory-receipt-risk-matrix.md`
- `docs/architecture/adr-0007-durable-memory-receipt-ark.md`
- `docs/architecture/npc-divergence-runtime-integration.md`

## Core law
Memory is runtime state, not permission and not automatically truth.

Project Jennifer's player-facing promise is persistent consequence: if a relationship or world state changes, the system should be able to explain **what changed and why** through evidence/receipts.

## Persistence rails
Preserve the repository's intended separation:
- PostgreSQL: governed relational/constitutional authority, durable Memory Receipts and action-idempotency records;
- MongoDB: adaptive context/world projection;
- SQLite: offline edge continuity/replay.

Do not collapse these stores into one semantic authority merely because the data can technically be copied.

## Durable action law
For consequential runtime actions:

```text
POC/FOC decision
→ verified evidence
→ Memory Receipt
→ durable action reservation
→ mutation only if this runtime won the reservation
→ applied / failed outcome
```

A persisted `prepared` record means the previous runtime reserved the action but its mutation outcome is not known. Treat that as **HOLD pending reconciliation**, not as permission to replay and not as evidence that the mutation definitely happened.

Exactly-once semantics are not proven for arbitrary callbacks. They require the authoritative domain mutation and its idempotency/event/receipt/outbox writes to share one database transaction, or a governed external-side-effect protocol.

## Delayed NPC consequence law

NPC epistemic receipts are actor models. They may contain a consequence intent, but they do not own mutation authority.

```text
NPC actor-model receipt
→ consequence intent
→ pending maturity when latent
→ explicit maturity evidence
→ independent POC/FOC evaluation
→ NPCConsequenceRuntimeGateway
→ POCFOCRuntimeGate
→ Memory Receipt + action ledger
→ mutate OR HOLD
```

A latent consequence that has not matured must not reserve the final action ID. Otherwise a legitimate later maturity transition could be blocked by its own earlier HOLD reservation.

When maturity is satisfied, evidence for the maturity condition joins the original causal/policy evidence before the runtime gate evaluates the mutation.

## Change protocol
1. Identify the authoritative event/state transition.
2. Define before/after state and causal evidence.
3. Write or update the relevant runtime contract.
4. Generate/maintain receipt semantics.
5. For latent NPC consequences, preserve pending state until maturity evidence exists.
6. Reserve a consequential action before executing it when replay would be unsafe.
7. Update projections only after authority/validation rules pass.
8. Test restart/replay/continuity behavior when persistence is affected.
9. Keep crash-window uncertainty visible; do not fabricate an outcome.
10. Never silently promote renter inference or NPC actor-model interpretation to permanent truth.

## Required companion skills
Use `jennifer-validation-poc-foc` for any persistence change, `poc-foc-runtime-gate` for consequential mutation admission, `jennifer-companions-npcs` for NPC consequence generation, and `forge-rivm` when the state transition is materially relational.

## Output
Return state transition, source event, persistence rail, receipt/evidence, maturity state where relevant, action-ledger state, replay/reconciliation result, validation state and any promotion gate still pending.

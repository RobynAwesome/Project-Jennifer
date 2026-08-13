---
name: jennifer-runtime-memory
description: Build or modify Project Jennifer runtime continuity, relationship state, companions/Forge role integration, GSMB memory, memory receipts and persistent world consequences. Use whenever code touches packages/runtime, packages/memory, relationships, persistent choices, memory promotion or world-state continuity.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: runtime-memory-continuity
  tags: [runtime, memory, gsmb, relationships, receipts]
---

# Jennifer Runtime + Memory

## Sources
- `packages/runtime/`
- `packages/memory/`
- `packages/shared/src/relationships.ts`
- `packages/shared/src/forge-role.ts`
- `infra/postgres/migrations/`
- `infra/mongodb/`
- `docs/architecture/memory-receipt-risk-matrix.md`

## Core law
Memory is runtime state, not permission and not automatically truth.

Project Jennifer's player-facing promise is persistent consequence: if a relationship or world state changes, the system should be able to explain **what changed and why** through evidence/receipts.

## Persistence rails
Preserve the repository's intended separation:
- PostgreSQL: governed relational/constitutional authority;
- MongoDB: adaptive context/world projection;
- SQLite: offline edge continuity/replay.

Do not collapse these stores into one semantic authority merely because the data can technically be copied.

## Change protocol
1. Identify the authoritative event/state transition.
2. Define before/after state and causal evidence.
3. Write or update the relevant runtime contract.
4. Generate/maintain receipt semantics.
5. Update projections only after authority/validation rules pass.
6. Test restart/replay/continuity behavior when persistence is affected.
7. Never silently promote renter inference to permanent memory.

## Required companion skills
Use `jennifer-validation-poc-foc` for any persistence change and `forge-rivm` when the state transition is materially relational.

## Output
Return state transition, source event, persistence rail, receipt/evidence, replay result, validation state and any promotion gate still pending.

---
name: jennifer-companions-npcs
description: Build Project Jennifer companions, companion selection/progression, persona-aware NPCs and governed character behavior. Use whenever work touches companion-engine, companion registries/assets, NPC runtime, DialogNPC, companion selection scenes, rarity/edition logic, or persistent character state.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: companions-npcs
  tags: [companions, npc, characters, progression, game]
---

# Jennifer Companions + NPCs

## Sources
- `packages/runtime/src/companion-engine.ts`
- `packages/npc/`
- `packages/shared/src/companions.ts`
- `docs/architecture/companion-system.md`
- `apps/web/src/game/`
- `assets/Project Companions/`

## Character law
A companion is not merely a skin. Preserve independent dimensions such as identity, edition, rarity, form, mechanism, alignment, relationship lane, skills and history.

Do not collapse:
- edition into rarity;
- purchased into legendary;
- visual source into executable character canon;
- historical naming into current runtime identity;
- relationship state into permanent moral alignment.

## Workflow
1. Resolve current companion identity/canon and source lineage.
2. Check source manifests before using visual assets.
3. Define state transition and gameplay consequence.
4. Route relational changes through `jennifer-runtime-memory` and `forge-rivm` where relevant.
5. Keep NPC local awareness, memory and telemetry bounded by shared governance.
6. Validate player-visible behavior and persistence.

## Asset integrity
Quarantined pointer payloads are failure evidence, not renderable art. Missing founder-approved binaries remain missing until verified intake.

## Output
Return character/companion identifier, source lineage, state before/after, gameplay effect, asset status, persistence/receipt state and validation result.

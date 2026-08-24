---
name: jennifer-companions-npcs
description: Build Project Jennifer companions, companion selection/progression, persona-aware NPCs and governed character behavior. Use whenever work touches companion-engine, companion registries/assets, NPC runtime, DialogNPC, companion selection scenes, rarity/edition logic, persistent character state, or actor-relative divergence/consequence behavior.
version: 1.1.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: companions-npcs
  tags: [companions, npc, characters, progression, game, divergence]
---

# Jennifer Companions + NPCs

## Sources
- `packages/runtime/src/companion-engine.ts`
- `packages/npc/`
- `packages/npc/src/epistemic-divergence.ts`
- `packages/shared/src/companions.ts`
- `docs/architecture/companion-system.md`
- `docs/architecture/npc-epistemic-divergence.md`
- `apps/web/src/game/`
- `assets/Project Companions/`

## Character law
A companion is not merely a skin. Preserve independent dimensions such as identity, edition, rarity, form, mechanism, alignment, relationship lane, skills and history.

Do not collapse:
- edition into rarity;
- purchased into legendary;
- visual source into executable character canon;
- historical naming into current runtime identity;
- relationship state into permanent moral alignment;
- actor interpretation into objective world truth;
- divergence into FOC;
- convergence into POC.

## NPC epistemic law

NPCs are bounded actors with local awareness, memory, goals, directional relationships and incomplete information. The same objective event may legitimately produce different actor beliefs.

```text
EVENT FACTS
→ ACTOR OBSERVATION
→ PARTIAL-KNOWABLE STATE
→ ACTOR INTERPRETATION
→ CONVERGE | DIVERGE | HOLD
→ POLICY-BACKED CONSEQUENCE INTENT
```

`EpistemicDivergenceEngine` receipts are actor models, not canon and not POC/FOC validation. A latent consequence must carry a reconstructable causal chain and policy evidence; hidden visibility does not authorize arbitrary punishment.

`POWER` divergence capability means an actor preserves alternatives longer before collapsing onto one interpretation. It does not imply correctness, moral superiority, randomness, or permission to fabricate facts.

## Workflow
1. Resolve current companion/NPC identity/canon and source lineage.
2. Check source manifests before using visual assets.
3. Define the authoritative event facts and evidence before actor interpretation.
4. Keep observations, unknowns and actor meaning separate from objective event state.
5. Define state transition and gameplay consequence.
6. Route relational changes through `jennifer-runtime-memory` and `forge-rivm` where relevant.
7. Require policy evidence for latent or delayed consequence intents.
8. Keep NPC local awareness, memory and telemetry bounded by shared governance.
9. Validate player-visible behavior and persistence before claiming runtime POC.

## Asset integrity
Quarantined pointer payloads are failure evidence, not renderable art. Missing founder-approved binaries remain missing until verified intake.

## Output
Return character/companion identifier, source lineage, event/observation boundary where relevant, state before/after, gameplay effect, divergence/convergence disposition, causal evidence, asset status, persistence/receipt state and validation result.

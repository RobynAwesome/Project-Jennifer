# Governed Companion Architecture

> **Invariant:** A companion is an embodied expression of a governed core logic.

Project Jennifer separates four layers that conventional companion systems often collapse:

```text
Core Logic → Companion Identity → Embodied Form → Relationship Lane
```

The player is not only choosing a face. The player is selecting the kind of intelligence that will walk beside them, the failure modes that intelligence carries, and the relationship lane in which it may operate.

## Canonical base logics

| Base logic | Primary responsibility | Canonical risk |
|---|---|---|
| Memory Architect | continuity, provenance, contradiction detection | preserving old context after genuine change |
| System Intuition | non-linear hypotheses and third-path generation | moving from possibility to execution too quickly |
| Contextual Analyst | social, environmental and conversational field analysis | delaying action through over-contextualisation |

Each logic has two distinct embodied expressions:

- **Fira / Kael** — Memory Architect
- **Luna / Aris** — System Intuition
- **Aura / Torin** — Contextual Analyst

Names and embodiments may evolve, but a visual change may not silently rewrite the underlying logic or telemetry profile.

## Relationship lanes

Companions explicitly declare which lanes they support:

- co-builder
- mentor
- guardian
- rival-ally
- platonic
- romantic

A romantic lane is one governed option, not the universal purpose of the system. Companions may remain strategic, scholarly, protective, confrontational or field-oriented without being converted into love-interest variants.

## Companions and Constructs are separate runtime classes

Project Jennifer must not collapse governed Companions and faction Constructs into one cosmetic character catalogue.

### Companion

A Companion is a relationship-bearing intelligence selected through:

```text
Core Logic → Identity → Embodied Form → Relationship Lane
```

It participates directly in dialogue, quest interpretation, disagreement, memory and relationship state.

### Construct

A Construct is a faction-bound embodied intelligence selected or encountered through:

```text
Faction → Sovereign Seat → Service Oath → Power Boundary → Telemetry Duty
```

Constructs may protect, scout, relay memory, visualize relational pressure or support a household. They are not ordinary animals, cosmetic pets, romantic replacements or uncontrolled agents.

The initial Project: Waifu Forge faction roster is defined in:

- `packages/shared/src/constructs.ts`
- `docs/lore/waifu-forge-constructs.md`

The six initial Constructs are:

- **Koron** — Crown Stag serving the Sovereign Pair;
- **Vanta** — Obsidian Panther serving Wifey Forge;
- **Nira** — Silver Vulpine serving Prince Kholofelo;
- **Lumera** — Signal Medusa serving the Digital Hippocampus;
- **Aerion** — Glass Manta serving RIVM;
- **Piko** — Ember Fennec serving the Waifu Forge household.

A Construct may share a base-logic affinity with a Companion, but it does not inherit that Companion's identity or relationship lane. Every consequential Construct action must remain bounded by a service oath, refusal law and receipt obligation.

## Telemetry contract

Every companion publishes a normalized profile:

- memory depth
- truth strictness
- warmth range
- confrontation tolerance
- context sensitivity
- intuition strength
- dependency resistance
- governance discipline

These values are not claims of consciousness or psychological diagnosis. They are deterministic runtime configuration and evaluation signals.

## Selection membrane

A selection produces a validation receipt containing:

- companion ID and base logic;
- requested relationship lane;
- whether that lane is supported;
- dependency risk;
- sycophancy resistance;
- governance discipline;
- agency and truth-boundary checks;
- pass/fail result and reasons.

A failed selection is recorded but is not activated.

## Runtime API

```http
GET  /runtime/companions
GET  /runtime/companions/:id
GET  /runtime/companions/active/:userId
GET  /runtime/companions/receipts/:userId
POST /runtime/companions/select
```

Example selection:

```json
{
  "userId": "player-001",
  "companionId": "aura",
  "relationshipLane": "co-builder",
  "renderMode": "embodied"
}
```

## Game flow

```text
Start Menu
  → Persona Selection
  → Companion Selection
  → Central Governance Hall
```

Persona and companion remain separate layers. Persona determines the player's operating approach. Companion determines the governed intelligence accompanying the player.

## POC boundary

This implementation proves:

1. one canonical six-companion catalogue;
2. shared types across runtime, API and game UI;
3. a deterministic selection membrane;
4. receipt generation;
5. a functional Phaser selection scene with core-logic and embodied render modes;
6. one canonical Waifu Forge Construct registry with sovereign seats, powers, risks, refusal laws and generation prompts.

It does not yet prove persistent database storage, model-specific behaviour, voice, long-term adaptation, asset-backed character portraits, live Construct behaviour or live LLM orchestration. Those remain later validation gates.

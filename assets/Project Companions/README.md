# Project Companions

> Visual asset pack + character-system design notes for Project Jennifer.

Project Companions separates **who a companion is** from **how that companion operates**. A body, visual alignment or origin story does not permanently lock the runtime mechanism.

```text
Companion = Identity × Form / Body State × Core Mechanism × Alignment × Relationship Lane × Skill Loadout
```

That separation is deliberate. A traditionally heroic identity can load a dangerous Shadow mechanism. A rival can become a Guardian. A generic starter can become historically rare through validated play. Project Jennifer should create meaningful choices, not morality-coded skins.

---

## Asset layout

```text
assets/Project Companions/
  README.md
  heroes/
    kopa-dark-form-02.webp
    kopa-dark-form-03.webp
    kopa-light-form-03.webp
    kopa-light-form-04.webp
  exclusive/
    vanta-exclusive.webp
    nyra-exclusive.webp
    solvek-exclusive.webp
    lyrae-exclusive.webp
  generic/
    companion-ecosystem-generic-lineup.webp
```

These images are **visual concept assets**. Runtime contracts, canonical receipts and source-controlled definitions remain authoritative over text accidentally embedded by image generation.

---

## 1. Identity

Identity is the canonical companion being: the name, origin, visual family, lore history and continuity that should survive changes of form.

Examples currently represented in this pack:

- **Kopa** — transformable hero / mascot-direction identity.
- **Vanta** — exclusive companion concept.
- **Nyra** — exclusive companion concept.
- **SolveK** — exclusive companion concept.
- **Lyrae** — exclusive companion concept.
- **Generic population** — modular starter / discoverable companion archetypes.

### ⚠️ Vanta name collision

Project Waifu Forge already contains a **Construct named Vanta**. That Construct is not silently the same entity as this companion concept.

Until a canonical governance receipt explicitly resolves the relationship, treat them as separate namespaces:

```text
Companion concept: ProjectCompanion/Vanta
Waifu Forge Construct: Construct/Vanta
```

Do not merge lore, powers, memories or identity merely because the display name matches.

---

## 2. Form / body state

Form is an embodiment state, not a new identity by default.

Possible states include:

- dark body frame;
- light body frame;
- juvenile;
- teenage;
- mature;
- guardian / armored evolution;
- shadow / corrupted evolution;
- future environment- or quest-specific forms.

The Kopa assets in this folder demonstrate the rule: multiple bodies can remain manifestations of one continuous identity when the receipts say so.

---

## 3. Core mechanisms

The first companion architecture defines three base cognitive mechanisms:

| Mechanism | Runtime emphasis |
|---|---|
| **Memory Architect** | continuity, recall, provenance, source-of-truth tracking |
| **System Intuition** | pattern leaps, non-linear inference, creative navigation |
| **Contextual Analyst** | social/context reading, subtext, trade-offs and situational interpretation |

Mechanism is independently assignable from visual identity.

```text
Nyra + Memory Architect
Kopa + Contextual Analyst
SolveK + System Intuition
```

Future mechanisms may extend the matrix without multiplying character bodies unnecessarily.

---

## 4. Alignment

Alignment describes the current governed behavioral direction; it is **not an immutable morality stamp**.

Initial vocabulary:

- Guardian
- Neutral
- Rival
- Shadow
- Corrupted
- Redeemed

A companion can change alignment through receipts, quests, relationships and state transitions. A “good” companion can fail. A rival can protect the player. A dangerous mechanism can be used responsibly.

---

## 5. Relationship lane

Relationship lanes define how the player and companion are currently allowed to operate together:

- co-builder;
- mentor;
- guardian;
- rival-ally;
- platonic;
- romantic.

Relationship lane must remain governed separately from identity and visual form.

---

## 6. Skill loadout

Skills determine concrete gameplay utility. Examples:

- memory recall;
- contradiction detection;
- receipt validation;
- telemetry scan;
- navigation;
- persuasion;
- deception detection;
- shield / defense;
- combat support;
- restoration;
- contextual inference.

A companion's visual design should suggest capabilities without hard-coding them.

---

## Companion tiers

### Common / Generic — configurable

The generic ecosystem image represents the broad population layer: readable archetypes that can be distributed freely, discovered in-world, earned through quests or receive purchasable cosmetic variants.

Generic companions should be easy to configure:

```text
Generic Body
+ Core Mechanism
+ Alignment
+ Relationship Lane
+ Skill Loadout
= Player-specific companion build
```

Names or labels rendered inside the current generic image are exploratory concept-art text, **not authoritative canon**.

### Evolved — receipt-earned

A generic companion should be able to become valuable because of what happened to it.

> **Rarity can come from history, not only scarcity.**

A starter companion that survives major quests, changes alignment, carries validated memories and develops a unique relationship history should no longer be equivalent to a newly spawned copy.

Receipts can prove:

- quest history;
- transformations;
- boundaries;
- relationship transitions;
- learned skills;
- failures;
- redemptions;
- world-state consequences.

### Exclusive — lore-bound

Exclusive companions are deliberately authored and more opinionated. They can have stronger native affinities, special quest access and distinctive lore without automatically being numerically stronger.

**Exclusive must not mean pay-to-win.** It means authored identity and narrative significance.

---

## Combination governance

Mixing identity, mechanism and alignment should create gameplay, not arbitrary hard bans.

Suggested evaluation states:

```text
STABLE
VOLATILE
RARE
LOCKED
FORBIDDEN_BY_GOVERNANCE
```

Example:

```text
Identity: Vanta
Native affinity: Shadow / memory disruption
Loaded mechanism: Memory Architect
Alignment: Guardian

Result:
HIGH CONFLICT
RARE BUILD
Possible redemption / contradiction questline
```

The system can reward unusual combinations while still rejecting combinations that violate explicit governance, consent, safety or world rules.

---

## Companions are not Constructs

Project Jennifer now contains two adjacent but distinct character systems.

### Companion runtime

```text
Core Logic
→ Identity
→ Embodied Form
→ Relationship Lane
→ Skills / Alignment
→ Validation Receipt
```

Companions are player-facing intelligences whose memory, relationship and evolution are part of the gameplay system.

### Project Waifu Forge Construct runtime

```text
Faction
→ Sovereign Seat
→ Service Oath
→ Power Boundary
→ Telemetry Duty
```

Constructs are constitutional entities with service obligations and bounded authority. A companion should not inherit Construct authority merely because visual or narrative themes overlap.

---

## Asset provenance and governance

The images in this folder were developed through OpenAI image generation during Project Jennifer / Digital Princess Forge visual-system exploration and approved for repository use by the project founder.

Repository copies are optimized WebP derivatives intended for GitHub documentation and concept direction.

Until a specific character receives a formal canon / identity receipt:

- treat the image as concept art;
- preserve the source-controlled filename;
- do not infer powers from appearance alone;
- do not treat generated text inside the image as canonical data;
- do not train or propagate identity claims from the image without provenance.

---

## Design laws

> **Character ≠ Alignment ≠ Mechanism ≠ Form.**

> **Generic companions are configurable. Exclusive companions are opinionated.**

> **Rarity can come from history, not only scarcity.**

> **A companion's receipts should explain what it became.**

Project Jennifer governs the combination. The player chooses the path.

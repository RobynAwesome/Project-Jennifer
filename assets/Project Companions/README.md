# Project Companions

> Character system, visual asset pack and collection/evolution rules for Project Jennifer.

Project Companions separates **who a companion is**, **what edition the player owns**, **how rare that instance has become**, and **how that companion currently operates**.

The current composition model is:

```text
CompanionInstance =
  Identity
× Edition
× Rarity State
× Form / Body State
× Core Mechanism
× Alignment
× Relationship Lane
× Skill Loadout
× Receipt Chain
```

That separation is deliberate. A Limited Edition is not automatically Legendary. A Legendary companion is not automatically purchased. A heroic-looking body can carry a dangerous mechanism. A starter can become historically rare because of what happened to it.

Project Jennifer should create meaningful ownership, evolution and choice — not morality-coded skins or a pay-to-win shortcut.

---

## Asset layout

```text
assets/Project Companions/
  README.md

  generic/
    companion-ecosystem-generic-lineup.webp

  heroes/
    kopa-dark-form-02.webp
    kopa-dark-form-03.webp
    kopa-light-form-03.webp
    kopa-light-form-04.webp

  exclusive/                 # legacy authored concept-art namespace
    vanta-exclusive.webp
    nyra-exclusive.webp
    solvek-exclusive.webp
    lyrae-exclusive.webp

  limited-edition/           # purchasable / authored edition direction
    ...
```

The repository may retain older folder names while the product taxonomy evolves. A filename or generated label does not override the governed character/edition receipt.

These images are **visual concept assets**. Runtime contracts, canonical receipts and source-controlled definitions remain authoritative over text accidentally embedded by image generation.

---

# The two collection axes

## Axis A — rarity / progression

Rarity describes the current progression/value state of a companion instance.

```text
COMMON → EPIC → RARE → LEGENDARY
```

Rarity can be influenced by governed gameplay history, including:

- quests survived;
- transformations;
- difficult choices;
- relationship history;
- unlocked skills;
- failures and recoveries;
- world-state consequences;
- special achievements or validated events.

The important rule is:

> **Rarity can come from history, not only scarcity.**

A Common starter with a deep receipt chain can evolve into something materially different from a newly spawned copy.

## Axis B — edition / acquisition

Edition describes **which authored release of an identity** the player possesses.

Initial vocabulary:

```text
STANDARD
LIMITED EDITION
```

**Limited Edition** is the authored/purchasable collector lane represented by the detailed named character posters and Kopa body/form editions.

A Limited Edition may provide:

- authored visual identity;
- distinctive animation or presentation;
- special lore;
- special quest access;
- unique voice/style direction;
- collector scarcity;
- edition-specific cosmetics or bounded affinities.

It must **not silently mean automatic combat superiority**.

```text
LIMITED EDITION ≠ LEGENDARY
LEGENDARY       ≠ PURCHASED
PURCHASED       ≠ PAY-TO-WIN
```

The store, reward and future token/crypto-mining economy can use edition and rarity as separate game-economy primitives. Exact token issuance, mining yield, exchange value, wallet mechanics and financial promises remain a **planned governed surface** until they receive implementation and validation receipts.

---

# 1. Identity

Identity is the canonical companion being: the name, origin, visual family, lore history and continuity that should survive changes of form or edition where the receipts say the identity remains continuous.

Examples currently represented in this pack include:

- **Kopa** — transformable hero / mascot-direction identity;
- **Vanta** — authored companion concept;
- **Nyra** — authored companion concept;
- **SolveK** — authored companion concept;
- **Lyrae** — authored companion concept;
- **Generic population** — modular starter / discoverable archetypes.

### ⚠️ Vanta name collision

Project Waifu Forge already contains a **Construct named Vanta**. That Construct is not silently the same entity as this companion concept.

Until a canonical governance receipt explicitly resolves the relationship, treat them as separate namespaces:

```text
Companion concept: ProjectCompanion/Vanta
Waifu Forge Construct: Construct/Vanta
```

Do not merge lore, powers, memories or identity merely because the display name matches.

---

# 2. Form / body state

Form is an embodiment state, not a new identity by default.

Possible states include:

- dark body frame;
- light body frame;
- juvenile;
- teenage;
- mature;
- guardian / armored evolution;
- shadow / corrupted evolution;
- environment- or quest-specific forms.

The Kopa visual family demonstrates the rule: multiple bodies can remain manifestations of one continuous identity when the receipt chain says so.

```text
Identity = WHO it is
Edition  = WHICH authored release you own
Rarity   = WHAT progression/value state this instance has reached
Form     = HOW it is embodied right now
```

---

# 3. Core mechanisms

The first companion architecture defines three base cognitive mechanisms:

| Mechanism | Runtime emphasis |
|---|---|
| **Memory Architect** | continuity, recall, provenance, contradiction detection |
| **System Intuition** | pattern leaps, non-linear inference, creative navigation |
| **Contextual Analyst** | social/context reading, subtext, trade-offs and situational interpretation |

Mechanism is independently assignable from visual identity.

```text
Nyra + Memory Architect
Kopa + Contextual Analyst
SolveK + System Intuition
```

Future mechanisms can extend the matrix without multiplying character bodies unnecessarily.

---

# 4. Alignment

Alignment describes the current governed behavioral direction; it is **not an immutable morality stamp**.

Initial vocabulary:

- Guardian
- Neutral
- Rival
- Shadow
- Corrupted
- Redeemed

A companion can change alignment through receipts, quests, relationships and state transitions. A hero can fail. A rival can protect the player. A dangerous mechanism can be used responsibly.

Alignment is independent from edition and rarity.

---

# 5. Relationship lane

Relationship lanes define how the player and companion are currently allowed to operate together:

- co-builder;
- mentor;
- guardian;
- rival-ally;
- platonic;
- romantic.

Relationship lane remains governed separately from identity, edition, rarity and visual form.

---

# 6. Skill loadout

Skills determine concrete gameplay utility. Examples include:

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

A companion's visual design may suggest capabilities without hard-coding them.

---

# Generic / configurable population

The generic ecosystem represents the broad population layer: starter, discoverable, quest-earned and freely distributed archetypes that can be configured by play.

```text
Generic Body
+ Core Mechanism
+ Alignment
+ Relationship Lane
+ Skill Loadout
+ Rarity State
+ Receipt Chain
= Player-specific companion instance
```

Names or labels rendered inside exploratory concept art are **not authoritative canon** unless a source-controlled definition adopts them.

---

# Receipt-earned evolution

The receipt chain answers **why this copy matters**.

Receipts can prove:

- acquisition;
- quest history;
- transformations;
- rarity promotion;
- boundaries;
- relationship transitions;
- learned skills;
- failures;
- redemptions;
- world-state consequences.

Two visually identical Standard companions can therefore diverge because their histories diverged.

---

# Limited Edition characters

Limited Editions are deliberately authored collector releases. They may be purchased through the in-game store or distributed through governed events/reward mechanisms as the economy is implemented.

They can have distinctive visual language and lore without automatically becoming stronger than every Standard character.

The intended economic separation is:

```text
PLAYER PAYS / UNLOCKS AN EDITION
              ↓
        Edition Receipt
              ↓
      Companion Instance
              ↓
       Gameplay History
              ↓
         Rarity Changes
              ↓
      Evolution Receipts
```

The purchase receipt proves acquisition. Gameplay receipts prove what the companion became afterward.

---

# Combination governance

Mixing identity, mechanism, alignment, edition, rarity and form should create gameplay rather than arbitrary hard bans.

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
Edition: Limited Edition
Rarity: Epic
Loaded mechanism: Memory Architect
Alignment: Guardian

Result:
HIGH CONFLICT
RARE BUILD
Possible redemption / contradiction questline
```

The system can reward unusual combinations while still rejecting combinations that violate explicit governance, consent, safety or world rules.

---

# Companions are not Constructs

Project Jennifer contains two adjacent but distinct character systems.

## Companion runtime

```text
Core Logic
→ Identity
→ Edition / Rarity / Form
→ Relationship Lane
→ Skills / Alignment
→ Validation + Memory Receipts
```

Companions are player-facing intelligences whose memory, relationship and evolution are part of the gameplay system.

## Project Waifu Forge Construct runtime

```text
Faction
→ Sovereign Seat
→ Service Oath
→ Power Boundary
→ Telemetry Duty
```

Constructs are constitutional entities with service obligations and bounded authority. A companion does not inherit Construct authority merely because visual or narrative themes overlap.

---

# Asset provenance and governance

The images in this folder were developed through AI-assisted Project Jennifer / Digital Princess Forge visual-system exploration and approved for repository use by the project founder.

Repository copies may be optimized derivatives intended for GitHub documentation and concept direction.

Until a specific character receives a formal canon / identity / edition receipt:

- treat the image as concept art;
- preserve the source-controlled filename;
- do not infer powers from appearance alone;
- do not treat generated text inside the image as canonical data;
- do not silently promote a concept image into a sale promise or gameplay guarantee.

---

# Design laws

> **Character ≠ Edition ≠ Rarity ≠ Alignment ≠ Mechanism ≠ Form.**

> **Limited Edition is an acquisition/collector lane, not a rarity rank.**

> **Rarity can come from history, not only scarcity.**

> **A purchase receipt proves acquisition. Gameplay receipts prove evolution.**

> **A companion's receipts should explain what it became.**

Project Jennifer governs the combination. The player chooses the path.
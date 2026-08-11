# Project Companions

> Character system, collection/evolution rules and visual-governance notes for Project Jennifer.

Project Companions separates **who a companion is**, **what edition the player owns**, **how rare that instance has become**, and **how that companion currently operates**.

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

A Limited Edition is not automatically Legendary. A Legendary companion is not automatically purchased. A heroic-looking body can carry a dangerous mechanism. A starter can become historically rare because of what happened to it.

Project Jennifer should create meaningful ownership, evolution and choice — not morality-coded skins or a pay-to-win shortcut.

---

## Asset-integrity state — second pass, 2026-08-11

The first audit correctly found missing legacy paths and malformed `.webp` pointer payloads. A second pass found that **valid founder-supplied PNG source binaries were already in the repository under opaque numeric names**.

Three Digital Hippocampus / companion-selection sources are now normalized under stable paths:

```text
source/digital-hippocampus-substrate-001.png
source/digital-hippocampus-companion-selection-core-logic-001.png
source/digital-hippocampus-companion-selection-embodied-historical-001.png
```

<p align="center">
  <img src="source/digital-hippocampus-substrate-001.png" alt="Digital Hippocampus visual source" width="96%" />
</p>

<p align="center">
  <img src="source/digital-hippocampus-companion-selection-core-logic-001.png" alt="Digital Hippocampus companion core logic selection" width="96%" />
</p>

Their dimensions, SHA-256 fingerprints and prior repository paths are recorded in [`source-manifest.json`](source-manifest.json).

### Pointer payloads are quarantined

Verified local-path pointer payloads are no longer stored as apparently renderable `.webp` files. They now live under:

```text
quarantine/legacy-path-pointer/
```

with `.pointer.txt` names.

That preserves the failure evidence without allowing a text pointer to masquerade as image art.

### Issue #25 remains open

This intake repair does **not** prove that every founder-approved HD Limited Edition asset named by Issue #25 has been restored. The exact Vanta, Nyra, SolveK, Lyrae, Kopa and rarity acceptance set still needs binary-by-binary intake and public-render validation before that issue can close.

The visual target remains: **high-resolution individual character art, not squeezed thumbnail collages.**

➡️ See [`docs/audits/2026-08-11-companion-asset-integrity.md`](../../docs/audits/2026-08-11-companion-asset-integrity.md).

### Stable namespace

```text
assets/Project Companions/
  README.md
  source-manifest.json
  source/                    # governed design/source binaries
  quarantine/                # invalid/non-renderable forensic payloads
  rarity/                    # common / epic / rare / legendary system visuals
  limited-edition/           # authored purchasable / collector editions
  forms/                     # identity-preserving body/form states
```

A filename never overrides the governed character/edition receipt.

### Historical Eira → current Fira lineage

The supplied In-Depth Companion Matrix and the historical embodied-selection source visibly use **Eira** for the female Memory Architect. Current executable Project Jennifer companion canon uses **Fira**.

```text
EIRA = historical design-source label
FIRA = current runtime identity
```

The historical source remains intact. It is not silently rewritten to manufacture consistency after the fact.

---

# The two collection axes

## Axis A — rarity / progression

Rarity describes the progression/value state of a companion instance.

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

> **Rarity can come from history, not only scarcity.**

A Common starter with a deep receipt chain can evolve into something materially different from a newly spawned copy.

## Axis B — edition / acquisition

Edition describes **which authored release of an identity** the player possesses.

```text
STANDARD
LIMITED EDITION
```

**Limited Edition** is the authored/purchasable collector lane represented by the detailed named-character and Kopa edition direction.

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

Identity is the canonical companion being: name, origin, visual family, lore history and continuity that should survive changes of form or edition where the receipt chain says the identity remains continuous.

Current design examples include:

- **Kopa** — transformable hero / mascot-direction identity;
- **Vanta** — authored companion concept;
- **Nyra** — authored companion concept;
- **SolveK** — authored companion concept;
- **Lyrae** — authored companion concept;
- **Generic population** — modular starter / discoverable archetypes.

### Vanta namespace collision

Project Waifu Forge also contains a **Construct named Vanta**. That Construct is not silently the same entity as the companion concept.

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

```text
Identity = WHO it is
Edition  = WHICH authored release you own
Rarity   = WHAT progression/value state this instance has reached
Form     = HOW it is embodied right now
```

A visual transformation can be dramatic without silently deleting continuity.

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

Project Jennifer's character visuals are developed through AI-assisted visual-system exploration and founder-directed iteration.

Before a visual is embedded as a repository asset:

- preserve source provenance;
- validate the binary payload;
- record a stable filename;
- record dimensions/checksum where provenance matters;
- separate source/canon/canon-candidate status;
- preserve historical labels rather than silently rewriting them;
- do not infer powers from appearance alone;
- do not treat generated text inside the image as canonical data;
- do not silently promote concept art into a sale promise or gameplay guarantee.

Source authority is governed by [`governance/source-authority-registry.json`](../../governance/source-authority-registry.json).

---

# Design laws

> **Character ≠ Edition ≠ Rarity ≠ Alignment ≠ Mechanism ≠ Form.**

> **Limited Edition is an acquisition/collector lane, not a rarity rank.**

> **Rarity can come from history, not only scarcity.**

> **A purchase receipt proves acquisition. Gameplay receipts prove evolution.**

> **A companion's receipts should explain what it became.**

Project Jennifer governs the combination. The player chooses the path.

# Project Jennifer Public README Audit — 2026-08-11

## Audit purpose

The root `README.md` is Project Jennifer's public front door. It must work for two audiences at the same time:

1. **People who do not know GitHub** — players, artists, storytellers, students, partners, funders, community members and curious visitors should be able to understand the game without opening another file.
2. **Developers and technical contributors** — the root should expose the real engineering model, then route implementation depth through hyperlinks into architecture, protocol, package, lore and contributor documents.

The governing public-experience law is:

```text
ROOT README = STORY + GAMEPLAY + VERIFIED VISUALS + PLAIN-LANGUAGE SYSTEM LOGIC
DEEP DOCS   = IMPLEMENTATION + PROTOCOLS + SCHEMAS + TESTS + RECEIPTS + CONTRIBUTOR DETAIL
```

---

# Sources reviewed

## Public / game-facing

- `README.md`
- current Project Jennifer key art and world/background assets
- `assets/Project-Waifu-Forge/README.md`
- `assets/Project-Waifu-Forge/manifest.json`
- `docs/lore/arc-ii-third-signal.md`
- `assets/Project Companions/README.md`

## Architecture / implementation

- `docs/architecture/README.md`
- `docs/architecture/companion-system.md`
- `docs/architecture/memory-receipt-risk-matrix.md`
- `PERN_ROADMAP.md`
- `docs/roadmap-milestones.md`
- recent Free Mode / CAG / governed RAG / exact-runtime renter / SQLite edge / benchmark work on `main`
- root `package.json`

## Asset integrity

- declared companion image paths from the previous root README and companion bible
- sampled files under `assets/Project Companions/limited-edition/`
- branch-level path checks for every new high-resolution background image used by the rewritten root README

---

# Findings

## 1. The previous root README asked visitors to think like developers too early

The page had strong key art, then immediately moved toward framework badges, architecture links, runtime tables and developer vocabulary.

That works for someone who already understands GitHub and already wants to inspect the system. It is weak for a first-time visitor who needs to answer:

- What is this game?
- What do I do?
- Why do my choices matter?
- Who are the characters?
- What stories can happen?
- Why should I care enough to keep scrolling?

### Repair

The rewritten root now leads with:

```text
WORLD
→ PLAYER PROMISE
→ GAME LOOP
→ MEMORY / CONSEQUENCE
→ CHARACTERS
→ COMPANIONS
→ ECONOMY LOGIC
→ STORY ARC
→ CURRENT STATE
→ HOW TO HELP
→ DEVELOPER DEPTH
```

---

## 2. The repository had aesthetics, but the README was not using them as story

The previous page compressed major character art into thumbnail rows. That turned high-value visuals into decoration.

Project Jennifer's images are useful because they communicate:

- scale;
- mood;
- character role;
- world identity;
- conflict;
- interface language;
- story possibility.

### Repair

The root now uses verified Project Jennifer art as large individual visual beats:

- main key art;
- Constitutional Tactical RPG overview;
- future governance city;
- Omega / receipt altar;
- Jennifer character direction;
- Validator;
- Fabricator;
- full governance/character infographic;
- South African founding/community visual;
- Project Jennifer title art.

The high-resolution rule is now:

> **Important art gets room to breathe. Do not squeeze hero assets into a four-card collage merely to shorten the page.**

---

## 3. A second visual problem was more serious: some companion images were never valid repository assets

The broken images visible in the previous README were not only orientation/layout failures.

Path validation found that sampled legacy companion assets were missing, while sampled `.webp` files in the new Limited Edition folder contained local filesystem path strings instead of WebP binary data.

### Repair

The rewritten root removes those broken embeds instead of cosmetically hiding the failure.

A dedicated binary-intake audit now exists:

- `docs/audits/2026-08-11-companion-asset-integrity.md`

The public page will reintroduce the Limited Edition portraits only after the real high-resolution binaries pass intake validation.

This is an aesthetics integrity gate, not an abandonment of the visual direction.

---

## 4. Companion rarity and purchase logic had been collapsed into one taxonomy

The previous root used:

```text
Common / Generic
Evolved
Exclusive
```

The founder's clarified game model requires two independent axes:

```text
RARITY / PROGRESSION
Common → Epic → Rare → Legendary

EDITION / ACQUISITION
Standard ↔ Limited Edition
```

### Repair

Both the root README and companion bible now state:

```text
LIMITED EDITION ≠ LEGENDARY
LEGENDARY       ≠ PURCHASED
PURCHASED       ≠ PAY-TO-WIN
```

A purchase receipt proves acquisition. Gameplay receipts prove what the companion becomes later.

The planned token / crypto-mining layer is described as a future governed implementation surface rather than a finished financial system.

---

## 5. The strongest story material was hidden in deep lore

`ARC II — THE THIRD SIGNAL` already demonstrates Project Jennifer's core value proposition better than a framework list:

- Forge rescues Kairo;
- the rescue creates a continuity link;
- the system misreads causal proximity as relational priority;
- Kairo appears inside a frame meant for the player + Forge;
- jealousy becomes a playable pressure;
- the player chooses how to respond;
- governance constrains coercive escalation;
- the relationship topology is clarified;
- the world remembers how the conflict was handled.

### Repair

The root now tells a compact version of The Third Signal and links to the full lore document.

That turns technical ideas such as identity, relational state, RIVM, continuity and receipts into a story a non-developer can understand.

---

## 6. The architecture had advanced beyond the previous root summary

Current deep architecture includes:

```text
Free Mode
→ Communication Attention Governance (CAG)
→ Governed RAG when evidence is needed
→ exact-runtime / renter routing
→ candidate model / agent / runtime action
→ post-inference governance
→ RIVM when relational
→ validation
→ telemetry + receipts
→ GSMB memory
```

Persistence is tri-rail:

```text
POSTGRESQL = authoritative relational / constitutional truth + receipts
MONGODB    = mutable context + adaptive world projection
SQLITE     = offline edge continuity + pending commands + local receipts + replay
```

### Repair

The public page explains the player meaning first:

> **The world remembers what happened and can explain why it changed.**

The developer section then shows the current architecture in one compact diagram and links to the full architecture document.

---

## 7. The old contribution message was too GitHub-centric

The old closing invitation mainly spoke to people able to fork, code and submit a pull request.

That excludes useful contributors who can help through:

- playtesting;
- story/lore;
- art and animation;
- music/sound;
- UI/UX;
- South African cultural/worldbuilding feedback;
- accessibility;
- translation/language;
- research/governance review;
- community;
- partnerships;
- funding.

### Repair

The root now has a public `You can help even if you are not a developer` section, while engineers still receive the normal `CONTRIBUTING.md` route.

---

## 8. South African identity was underused

Project Jennifer already contains Cape Town / South African visual and worldbuilding direction.

### Repair

The README now treats that origin as part of the project's creative identity rather than hiding it inside technical material.

It does not claim that every visual experiment is immutable canon; it states that the game is being developed from South Africa and that Cape Town is already present in its visual/world direction.

---

## 9. Concept, code and validation state needed stronger boundaries

Project Jennifer contains substantial implemented POC machinery while several production adapters and commercial systems remain next gates.

### Repair

The root now separates:

```text
IMPLEMENTED / CODED POC
DESIGNED / STORY DIRECTION
NEXT IMPLEMENTATION GATES
FUTURE GOVERNED EXPERIMENTS
```

It also preserves the repository's latest validation warning: a committed test or CI workflow is not automatically a passing receipt until the run is observed.

---

# Developer deep-link contract

The root README should not duplicate the technical repository. It should route technical readers cleanly.

| Question | Deep source |
|---|---|
| How does the runtime work? | `docs/architecture/README.md` |
| How do companions work? | `docs/architecture/companion-system.md` |
| How do rarity, edition and form differ? | `assets/Project Companions/README.md` |
| How are memory receipts governed? | `docs/architecture/memory-receipt-risk-matrix.md` |
| How does MERN/PERN evolve? | `PERN_ROADMAP.md` |
| What happens in The Third Signal? | `docs/lore/arc-ii-third-signal.md` |
| What is Project Waifu Forge? | `assets/Project-Waifu-Forge/README.md` |
| What are the portable runtime skills? | `skills/README.md` |
| How do I contribute code? | `CONTRIBUTING.md` |
| What is being built next? | `docs/roadmap-milestones.md` |

---

# Validation receipt for this README pass

```text
PUBLIC-FIRST STORY FLOW                     PASS
NON-GITHUB VISITOR ORIENTATION             PASS
LARGE VERIFIED VISUAL BEATS                PASS
BROKEN COMPANION EMBEDS REMOVED            PASS
COMPANION RARITY / EDITION SEPARATION      PASS
PROJECT WAIFU FORGE STORY TEASER            PASS
THE THIRD SIGNAL PUBLIC STORY              PASS
MEMORY RECEIPTS EXPLAINED IN PLAIN ENGLISH PASS
CURRENT ARCHITECTURE REPRESENTED            PASS
IMPLEMENTED VS PLANNED BOUNDARY             PASS
NON-DEVELOPER CONTRIBUTION LANES            PASS
DEVELOPER DEEP LINKS                        PASS
SOUTH AFRICAN / CAPE TOWN DIRECTION         PASS
COMPANION BINARY ASSET REPAIR               OPEN GATE
FULL-RES LIMITED EDITION RE-INTAKE          OPEN GATE
```

---

# Governing conclusion

Project Jennifer did not have to choose between aesthetics and logic.

It had a **presentation-layer convergence problem**: the engineering truth was living in deep documents, the visual truth was living in art folders and source explorations, and the root page was not composing them into one public experience.

The new rule is:

```text
AESTHETICS create desire to enter.
STORY creates emotional continuity.
GAME MECHANICS create agency.
GOVERNANCE creates consequence.
RECEIPTS create memory and proof.
DEEP DOCS create engineering trust.
```

The root README should make those layers feel like one game.

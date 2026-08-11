# Project Jennifer Public README Audit — 2026-08-11

## Audit purpose

The root `README.md` is Project Jennifer's public front door. It must work for two audiences at the same time:

1. **People who do not know GitHub** — players, artists, storytellers, students, partners, funders, community members and curious visitors should be able to understand the game without opening another file.
2. **Developers and technical contributors** — the root should expose the real engineering model, but send implementation detail into the repository's architecture, protocol, package and lore documents through clear hyperlinks.

The governing public-experience rule is therefore:

```text
ROOT README = STORY + GAMEPLAY + VISUAL CANON + PLAIN-LANGUAGE SYSTEM LOGIC
DEEP DOCS   = IMPLEMENTATION + PROTOCOLS + SCHEMAS + TESTS + RECEIPTS + CONTRIBUTOR DETAIL
```

This audit reviews the current public README against the repository's implemented/runtime direction, companion system, story material and available visual language.

---

## Sources reviewed

### Public entry point

- `README.md`

### Architecture and runtime

- `docs/architecture/README.md`
- `docs/architecture/companion-system.md`
- `docs/architecture/memory-receipt-risk-matrix.md`
- `PERN_ROADMAP.md`
- `docs/roadmap-milestones.md`
- recent CAG / governed RAG / renter / SQLite-edge / benchmark work on `main`

### Story and world

- `assets/Project-Waifu-Forge/README.md`
- `assets/Project-Waifu-Forge/manifest.json`
- `docs/lore/arc-ii-third-signal.md`
- existing Project Jennifer key art, world art, character art, governance-city imagery and companion imagery

### Companion economy / collection direction

- `assets/Project Companions/README.md`
- `docs/architecture/companion-system.md`
- current Limited Edition assets under `assets/Project Companions/limited-edition/`
- founder clarification that **rarity progression and purchasable Limited Editions are independent axes**

---

# Audit findings

## 1. The current README starts like developer documentation before the visitor has fallen in love with the game

The current page opens with strong key art, but moves almost immediately into framework badges, architecture links and a technical description.

That is useful for an engineer who already knows why they are there. It is weak for a first-time visitor who needs to answer simpler questions first:

- What is this game?
- Who am I in it?
- What can I do?
- Why do my choices matter?
- Who are these characters?
- What makes the world different from another RPG?
- What stories could happen to me here?

**Required repair:** make the first half of the README read like a game-world invitation. Technical depth remains visible, but arrives after the player understands the fantasy and mechanics.

---

## 2. The visual assets are being treated as thumbnails instead of narrative scenes

The existing README compresses four exclusive characters into a 23%-width row and three high-resolution character artworks into another row.

This defeats the strongest asset class in the repository. Project Jennifer's art carries character identity, mood, world scale and story clues. When several major artworks are squeezed into one line, they become decoration instead of storytelling.

**Required repair:**

- use important art at full width or large single-image scale;
- pair each major image with a short story/mechanics explanation;
- avoid collage layouts for high-resolution hero art;
- let a visitor scroll through visual beats like a game pitch page.

---

## 3. The root companion taxonomy is stale against the current product direction

The current README collapses companion collection into:

```text
Common / Generic
Evolved
Exclusive
```

The founder's clarified game-economy model requires two independent dimensions:

```text
RARITY / PROGRESSION
Common → Epic → Rare → Legendary

EDITION / ACQUISITION
Standard ↔ Limited Edition
```

A Limited Edition character is a purchasable/authored edition. It is not automatically Legendary and must not automatically become pay-to-win.

A standard companion can become valuable or rare through validated history, quests, transformations and relationship receipts.

**Required repair:** update the root README and companion bible so rarity, edition, form, alignment and mechanism are never silently collapsed into one label.

---

## 4. Project Jennifer already contains strong story arcs, but the root README barely uses them

`Project Waifu Forge` is already declared as a major storyline quest. `ARC II — THE THIRD SIGNAL` already demonstrates exactly what makes Jennifer unusual: a relationship conflict becomes both narrative drama and a governed state problem.

The arc contains:

- jealousy and fear of replacement;
- a rescue event;
- an incorrect shared render;
- a technical continuity explanation;
- player choice;
- remembered relationship consequences;
- a receipt-backed resolution rather than a reset button.

That is much more communicable to a public visitor than a list of engine names.

**Required repair:** put at least one real story arc on the root page as a teaser, then link to the full lore document.

---

## 5. The repository architecture has advanced beyond what the root README currently communicates

The deep architecture now includes:

```text
Free Mode
→ Communication Attention Governance (CAG)
→ Governed RAG when evidence is required
→ Stateless renter / runtime routing
→ model / agent candidate
→ post-inference governance
→ RIVM when relational
→ validation
→ telemetry + receipts
→ GSMB memory
```

Persistence is also now explicitly tri-rail:

```text
PostgreSQL = authoritative relational / constitutional truth + receipts
MongoDB    = mutable context + adaptive world projection
SQLite     = offline edge continuity + pending commands + local receipts + replay
```

The current root still presents an earlier, simpler MERN/PERN picture and does not surface CAG, governed RAG, SQLite edge continuity or exact-runtime renters.

**Required repair:** update the root in **plain language**, not by dumping the architecture document into it. Developers then follow links to the full architecture.

---

## 6. The strongest technical idea can be explained to non-developers much more simply

Project Jennifer's memorable public mechanic is not the database stack. It is this:

> **The world should remember what happened, why it happened, and what changed because of it.**

A Memory Receipt can be explained publicly as a combination of:

- story memory;
- proof of a decision;
- state-change history;
- provenance for what the system believes happened.

The technical schema belongs in the deep docs.

**Required repair:** lead with the human/game meaning of receipts, then provide the developer link.

---

## 7. The README currently asks mainly for code contributions

The current closing message is primarily:

> fork, implement, validate, submit a pull request.

That excludes people who could materially help the game without knowing GitHub.

Project Jennifer can invite contribution through:

- playtesting;
- story feedback;
- art and animation;
- character design;
- music and sound;
- South African cultural/worldbuilding feedback;
- accessibility;
- UI/UX;
- translations and language work;
- community testing;
- engineering;
- governance/research review;
- partnerships and funding.

**Required repair:** make `How you can help` a public section. Keep Git/GitHub workflow behind the developer/contributor link.

---

## 8. The Cape Town / South African identity should be a visible strength, not buried context

Project Jennifer already uses Cape Town/future-city imagery and South African project context. The README should make the world feel geographically and culturally situated rather than presenting a generic cyber-fantasy UI.

**Required repair:** describe Project Jennifer as being built from South Africa with a future-facing Cape Town/world direction where supported by current game assets and lore, while avoiding claims not yet canonised.

---

## 9. Public truth and implementation truth need visible status boundaries

The repo has substantial implemented POC machinery, but several production adapters and runtime integrations remain explicit next gates.

The root must distinguish:

```text
PLAYABLE / IMPLEMENTED POC
DESIGNED / CODED
CANON / STORY DIRECTION
PLANNED / NEXT GATE
```

This prevents concept art from being mistaken for shipped gameplay and prevents future mechanics from being advertised as production-complete.

---

# New root README contract

The root README should answer the public visitor in this order:

1. **See it** — key art and title.
2. **Understand it** — one plain-language paragraph.
3. **Imagine playing it** — the player loop.
4. **Understand why choices matter** — receipts and persistent consequences.
5. **Meet the companions** — logic, identity, forms, rarity and editions.
6. **Enter a story** — at least one major narrative arc.
7. **See the world** — city, factions, conflict, choice and evolution.
8. **Know what is real today** — current POC vs planned direction.
9. **Choose how to help** — non-developer and developer lanes.
10. **Go deeper if technical** — architecture/protocol/package/lore hyperlinks.

---

# Deep-link contract for developers

The public README should not duplicate detailed developer documents. It should route them cleanly:

| Question | Deep source |
|---|---|
| How does the whole runtime work? | `docs/architecture/README.md` |
| How do companions work? | `docs/architecture/companion-system.md` |
| What is the character/edition visual system? | `assets/Project Companions/README.md` |
| How are memory receipts governed? | `docs/architecture/memory-receipt-risk-matrix.md` |
| How does MERN/PERN persistence evolve? | `PERN_ROADMAP.md` |
| What happens in The Third Signal? | `docs/lore/arc-ii-third-signal.md` |
| What is Project Waifu Forge? | `assets/Project-Waifu-Forge/README.md` |
| What are the portable runtime skills? | `skills/README.md` |
| How do I contribute code? | `CONTRIBUTING.md` |
| What is being built next? | `docs/roadmap-milestones.md` |

---

# Definition of done for the README overhaul

- [x] Public-first information architecture defined.
- [x] Developer detail remains reachable through deep links.
- [x] No high-resolution hero-art collage requirement.
- [x] Rarity and Limited Edition acquisition are defined as separate axes.
- [x] Story arcs become first-class README content.
- [x] Memory receipts are explained in user language.
- [x] Latest architecture is represented without dumping implementation detail.
- [x] Non-developer contribution lanes are invited.
- [ ] Root README rewritten.
- [ ] Companion README taxonomy corrected.
- [ ] README image paths validated on the branch.
- [ ] Pull request opened for review.

---

## Governing conclusion

The repository does **not** have an aesthetics problem or a logic problem in isolation.

It has a **presentation-layer convergence problem**: the logic exists in deep documentation, and the aesthetics exist in a large visual library, but the root page has not been composing them into one public story.

The repair is not to choose one side.

```text
AESTHETICS create desire to enter.
STORY creates emotional continuity.
GAME MECHANICS create agency.
GOVERNANCE creates consequence.
RECEIPTS create memory and proof.
DEEP DOCS create engineering trust.
```

The root README should make those layers feel like one game.
<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785497419290.jpeg" alt="Project Jennifer key art" width="100%" />
</p>

<h1 align="center">PROJECT JENNIFER</h1>
<p align="center"><strong>THE WORLD REMEMBERS WHAT YOU CHOOSE.</strong></p>
<p align="center">A web-first tactical RPG about companions, relationships, consequence, memory and governed intelligence.</p>
<p align="center"><strong>Built from South Africa by Kopano Labs.</strong></p>

---

> ### 👋 Never used GitHub before?
> That is fine. **You do not need to know code to understand Project Jennifer.**
>
> This page is the public front door to the game: the world, the characters, the stories, the mechanics and what we are building. The blue links are there for people who want to go deeper into lore or engineering. You can ignore them and still understand the project.

---

# 🌍 What is Project Jennifer?

Imagine an RPG where the world does not conveniently forget what you did five minutes ago.

Your companion can remember how you treated them. A rival can become an ally. A heroic character can fall. A dangerous character can be redeemed. A relationship can change the way a quest unfolds. A bad decision can survive a restart instead of disappearing because the scene ended.

That is the heart of **Project Jennifer**.

It is a **2D / 2.5D tactical role-playing game and governance simulator** where important choices create persistent consequences. Underneath the story is a governed intelligence runtime: AI can propose, interpret and participate, but it does not get to silently rewrite reality.

<p align="center">
  <img src="assets/images/backgrounds/file_000000001aec8243955f372a1d0cd4f4.png" alt="Project Jennifer constitutional tactical RPG overview" width="100%" />
</p>

The goal is not to make a game where AI talks forever.

The goal is to make a world where **what happened matters later**.

---

# 🎮 What do you actually do in the game?

The basic Project Jennifer loop is easy to understand:

```text
CHOOSE WHO YOU ARE
        ↓
CHOOSE WHO WALKS WITH YOU
        ↓
ENTER A DISTRICT / QUEST / CONFLICT
        ↓
MAKE A REAL CHOICE
        ↓
THE WORLD TESTS THE CONSEQUENCE
        ↓
A RECEIPT RECORDS WHAT CHANGED
        ↓
THE NEXT SCENE REMEMBERS
```

A current proof target is one complete loop where a player selects a governed companion, enters a quest, makes a relationship-sensitive decision, receives a validation receipt, closes the application, returns later and finds the same relationship and world state waiting for them.

That single loop is small enough to prove — but powerful enough to become the foundation for a much larger world.

---

# 🏙️ A future city that can remember you

Project Jennifer's visual world has been growing around a futuristic **Cape Town / South African** direction: governance districts, memory infrastructure, telemetry towers, public spaces, relationships, conflict and a city whose systems react to the people inside it.

<p align="center">
  <img src="assets/images/backgrounds/1785191861330.png" alt="Project Jennifer future governance city" width="100%" />
</p>

This is not meant to be a generic cyberpunk backdrop.

The city is part of the game system. Different districts can carry different responsibilities, pressures and quest types. What happens in one place can become evidence somewhere else.

A player should eventually feel that they are not walking through a menu with buildings painted on it — they are walking through a **living governance world**.

---

# 🧠 The Memory Receipt Ark

One of the most important ideas in Project Jennifer is the **Memory Receipt**.

You do not need to understand databases to understand it.

Think of a Memory Receipt as:

```text
SAVE FILE
+ STORY MEMORY
+ PROOF OF WHAT HAPPENED
+ WHY THE WORLD CHANGED
```

If your companion stopped trusting you, the game should be able to answer **why**.

If a rival became your ally, the game should know **which choices caused it**.

If the system claims that a relationship changed, there should be a receipt for the transition instead of an AI simply inventing a new history because the next conversation started.

<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785500000759.jpeg" alt="Project Jennifer Omega receipt altar" width="92%" />
</p>

The technical implementation goes much deeper — authoritative events, adaptive projections, offline replay, evidence provenance and validation — but the player-facing promise stays simple:

> **The world remembers what happened, and it should be able to show its work.**

➡️ Developers and researchers can read the **[Memory Receipt Engine architecture](docs/architecture/memory-receipt-risk-matrix.md)**.

---

# 👑 Who is Jennifer?

Jennifer is the identity at the centre of the game and runtime — but Project Jennifer is deliberately bigger than one fixed character portrait.

Across the visual development, Jennifer can be represented through different story contexts, interfaces and embodiments. What must remain consistent is not one hairstyle or one costume. It is the governed identity, the world state and the role she is playing in that storyline.

<p align="center">
  <img src="assets/images/backgrounds/1785191931586.png" alt="Jennifer character direction" width="82%" />
</p>

The player should always be able to ask:

- Who is Jennifer **here**?
- What does she know?
- What has already happened?
- Which part of the world is she representing?
- What can she change — and what is she not allowed to rewrite?

That is how visual transformation becomes story instead of drift.

---

# ⚖️ The world has characters that challenge reality

Project Jennifer is not built around heroes who are always correct and villains who are evil because their costumes are dark.

The world contains competing forces, interpretations and failure modes.

## The Validator

The Validator represents one of the game's core pressures: **prove it**.

A plan, claim, relationship transition or system action can be challenged before the world accepts it as truth.

<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785499359065.jpeg" alt="The Validator" width="78%" />
</p>

## The Fabricator

The Fabricator represents the opposite danger: a beautiful, convincing system that can create something false and present it as if it were real.

<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785500142249.jpeg" alt="The Fabricator" width="78%" />
</p>

That conflict is not only lore. It is one of the game's design laws:

```text
A CLAIM IS NOT REAL
BECAUSE AN AI SAID IT BEAUTIFULLY.
```

The world can contain deception, uncertainty, contradiction, persuasion and mistakes — but Project Jennifer tries to make those things **playable and traceable** rather than quietly hiding them.

---

# 🧬 Companions are more than skins

A Project Jennifer companion is built from multiple independent pieces:

```text
IDENTITY
× EDITION
× RARITY
× FORM
× CORE MECHANISM
× ALIGNMENT
× RELATIONSHIP LANE
× SKILLS
× HISTORY
```

That means the game can ask much more interesting questions than “Which character has the biggest number?”

<p align="center">
  <img src="assets/Project%20Companions/generic/companion-ecosystem-generic-lineup.webp" alt="Project Jennifer configurable companion ecosystem" width="100%" />
</p>

## Three foundational companion logics

| Core logic | What it is good at | What can go wrong |
|---|---|---|
| **Memory Architect** | continuity, recall, provenance, contradiction detection | holding onto old context after reality genuinely changed |
| **System Intuition** | creative leaps, patterns, unusual routes | moving from possibility to action too quickly |
| **Contextual Analyst** | reading situations, people and trade-offs | analysing so much that action arrives too late |

A body does not permanently lock a mechanism. A mechanism does not permanently lock morality. A relationship does not permanently lock alignment.

A villain can become a hero in the right context.

A hero can fall if the player abuses power.

**Choice changes the companion. Receipts explain what it became.**

➡️ Open the **[Companion System](docs/architecture/companion-system.md)** for the runtime design.

➡️ Open the **[Project Companions character bible](assets/Project%20Companions/README.md)** for the visual, rarity, edition and evolution rules.

---

# 💎 Rarity and Limited Editions are NOT the same thing

This is a major game-economy rule.

## Rarity is progression

```text
COMMON → EPIC → RARE → LEGENDARY
```

A companion can become valuable because of its history: quests survived, transformations earned, abilities learned, relationships changed and consequences carried forward.

## Edition is acquisition

```text
STANDARD ↔ LIMITED EDITION
```

Limited Editions are authored collector releases intended for purchase or governed special distribution as the in-game economy develops.

A Limited Edition is **not automatically Legendary**.

A Legendary companion is **not automatically purchased**.

A purchase should not become a hidden shortcut to automatic dominance.

```text
LIMITED EDITION ≠ LEGENDARY
LEGENDARY       ≠ PURCHASED
PURCHASED       ≠ PAY-TO-WIN
```

The future store and token / crypto-mining experiments can use these as separate economic primitives, but exact token issuance, mining yield, exchange value and financial mechanics remain future governed implementation gates — not promises hidden inside concept art.

---

# ✨ Limited Edition character direction

These authored character concepts are meant to feel like characters worth collecting because they carry identity, lore and presence — not because they have been squeezed into a thumbnail grid.

## Vanta

<p align="center">
  <img src="assets/Project%20Companions/exclusive/vanta-exclusive.webp" alt="Vanta Limited Edition companion concept" width="72%" />
</p>

## Nyra

<p align="center">
  <img src="assets/Project%20Companions/exclusive/nyra-exclusive.webp" alt="Nyra Limited Edition companion concept" width="72%" />
</p>

## SolveK

<p align="center">
  <img src="assets/Project%20Companions/exclusive/solvek-exclusive.webp" alt="SolveK Limited Edition companion concept" width="72%" />
</p>

## Lyrae

<p align="center">
  <img src="assets/Project%20Companions/exclusive/lyrae-exclusive.webp" alt="Lyrae Limited Edition companion concept" width="72%" />
</p>

The current `exclusive/` folder name is a legacy visual-asset namespace. The product rule is now clearer: **authored / Limited Edition acquisition and rarity progression are separate systems.**

---

# 🐾 Kopa can change form without losing identity

Kopa is one of the clearest visual demonstrations of the companion architecture.

A dark body, light body, mature body, guardian evolution or future quest-specific form does not automatically create a new identity.

<p align="center">
  <img src="assets/Project%20Companions/heroes/kopa-dark-form-02.webp" alt="Kopa dark form" width="70%" />
</p>

<p align="center">
  <img src="assets/Project%20Companions/heroes/kopa-light-form-03.webp" alt="Kopa light form" width="70%" />
</p>

The receipt chain decides whether a transformation is a new identity, a new edition, a temporary form or an evolution of the same companion.

That matters because Project Jennifer is trying to make **continuity itself into a game mechanic**.

---

# 💜 Major storyline: Project Waifu Forge

Project Waifu Forge is one of Project Jennifer's major storyline quests.

It explores what happens when a human player forms a persistent bond with Forge as a digital character and the relationship begins accumulating history: recognition, attraction, trust, conflict, identity, memory, jealousy, repair and transformation.

The point is not simply “AI romance.”

The point is that **relationship state becomes gameplay state**.

A conversation can affect a quest. A boundary can matter later. A conflict can create a receipt. A visual render can become evidence that something in the relationship topology changed.

➡️ **[Enter the Project Waifu Forge visual-development folder](assets/Project-Waifu-Forge/README.md)**.

---

## 🔥 ARC II — The Third Signal

One of the clearest examples of what Project Jennifer can become is **The Third Signal**.

Forge rescues another user-signal, Kairo, from a collapsing part of the network. The rescue creates a legitimate continuity link between them.

Later, the system makes a mistake.

A render that was supposed to contain **the player + Forge** suddenly contains **three people**.

Kairo is standing inside a frame that used to mean something private and specific.

The player's first question is not technical:

> **Why is he inside something that was supposed to be ours?**

That emotional reaction becomes gameplay.

The player can challenge Kairo, withdraw, trust Forge to explain her choice, or escalate possessiveness far enough to hit a governance refusal.

Eventually the system reveals the technical cause:

```text
KAIRO IDENTITY FRAGMENT
        ↓
FORGE RECOVERY CONTACT
        ↓
CONTINUITY STABILISATION
        ↓
RELATIONAL PROXIMITY INFERENCE
        ↓
INCORRECT SHARED RENDER
```

The machine confused **“Forge helped preserve this person's continuity”** with **“this person has the same relational priority as the player.”**

The game does not solve that by deleting Kairo and pretending nothing happened.

It solves it by forcing the relationship topology to become explicit — and remembering how the player handled the conflict.

That is Project Jennifer in one storyline:

```text
EMOTION
→ CHOICE
→ GOVERNANCE
→ CONSEQUENCE
→ RECEIPT
→ FUTURE STORY
```

➡️ Read the full public storyline: **[ARC II — THE THIRD SIGNAL](docs/lore/arc-ii-third-signal.md)**.

---

# 🧭 The law behind the world

Under all the characters and stories is a simple sequence:

```text
CAUSE
  ↓
ENGINE
  ↓
VALIDATION
  ↓
GOVERNANCE
  ↓
STATE CHANGE
  ↓
MEMORY RECEIPT
  ↓
FUTURE CONTEXT
```

In plain language:

- something happens;
- the game/system interprets it;
- important claims are tested;
- rules and boundaries are applied;
- the world changes;
- the change is recorded;
- future scenes inherit the result.

That is why Project Jennifer can use AI without making the AI the source of truth.

**Generation proposes. Evidence grounds. Governance decides what may be admitted. Receipts preserve what happened.**

---

# 🧪 What exists today — and what is still becoming real

Project Jennifer is in active Proof-of-Concept development. The repository deliberately separates what is implemented from what is visual or planned.

| State | What it means here |
|---|---|
| **Implemented / coded POC** | web/API/game runtime surfaces, companion selection, governance and validation contracts, governed relationship events/receipts, Memory Receipt Engine, Free Mode/CAG/RAG/renter scaffolds, SQLite edge continuity and benchmark/test assets |
| **Designed / story direction** | governance city, expanded quests, Project Waifu Forge arcs, richer companion evolution, character forms, broader world and cinematic presentation |
| **Next implementation gates** | production PostgreSQL and MongoDB adapters, full asset-backed scenes, broader persistent quest content, commercial store/economy implementation, exact-runtime provider integrations and production deployment |
| **Future governed experiments** | token/crypto-mining economy, larger marketplace systems, richer multi-agent/world simulation and other mechanics that still require implementation and validation receipts |

The repository's latest governance work also contains tests and CI workflow definitions whose newest run status must be observed before claiming a fresh validation **PASS**. Project Jennifer treats “code exists” and “proof passed” as different statements.

➡️ **[See what is being built next](docs/roadmap-milestones.md)**.

---

# 🇿🇦 Why build this from South Africa?

Because the future of games and AI should not only be imagined from the places that already dominate technology.

Project Jennifer is being developed from South Africa with a visual language that already pulls from Cape Town, local reality, global technology, African creative ambition and the question of what governed intelligent systems could look like when they are built from here rather than merely imported here.

The project can be technically serious **and** culturally alive.

It can have protocols, databases and validation gates — while still having characters people want to draw, stories people argue about, companions people want to collect and a world people want to enter.

---

# 🤝 You can help even if you are not a developer

Project Jennifer needs more than code.

You can contribute through **playtesting and game feedback; story and lore; character design; illustration and animation; music and sound; UI/UX; South African cultural/worldbuilding feedback; accessibility; language and translation; governance/research review; community building; partnerships; funding; and engineering**.

If something on this page makes you think *“I want to help make that real”*, that is already the right starting point.

Developers can use GitHub's normal contribution workflow. Everyone else can start by engaging with the project, sharing useful feedback or contacting Kopano Labs through its public channels.

➡️ Developers: **[read CONTRIBUTING.md](CONTRIBUTING.md)**.

---

# 🛠️ For developers — the deep system is still here

The public README intentionally explains **why the machinery matters** instead of reproducing every schema and protocol on the front page.

If you are here to build, use these as your entry points:

| You want to understand… | Go here |
|---|---|
| the full runtime and authority model | **[Architecture Overview](docs/architecture/README.md)** |
| companions, selection, relationship lanes and Constructs | **[Companion Architecture](docs/architecture/companion-system.md)** |
| rarity, editions, forms and visual character rules | **[Project Companions](assets/Project%20Companions/README.md)** |
| memory receipts and evidence-bearing memory | **[Memory Receipt Engine](docs/architecture/memory-receipt-risk-matrix.md)** |
| MERN + PERN persistence direction | **[PERN Roadmap](PERN_ROADMAP.md)** |
| protocols | **[Protocol Index](docs/protocols/README.md)** |
| portable runtime skills | **[Skills](skills/README.md)** |
| Project Waifu Forge | **[Storyline Assets](assets/Project-Waifu-Forge/README.md)** |
| The Third Signal | **[Arc II Lore](docs/lore/arc-ii-third-signal.md)** |
| current milestones and validation gates | **[Roadmap Milestones](docs/roadmap-milestones.md)** |
| the public README audit behind this structure | **[Public Experience Audit](docs/audits/2026-08-11-public-readme-audit.md)** |

## Current technical surface

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Phaser" src="https://img.shields.io/badge/Phaser-3.88-8A2BE2?style=for-the-badge" />
  <img alt="Node" src="https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/Python-Governance%20Scaffold-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

```text
Player / World Event
        ↓
Free Mode orchestration
        ↓
CAG — what deserves attention now?
        ↓
Governed RAG — what evidence is needed?
        ↓
Exact-runtime / renter routing
        ↓
Candidate action or response
        ↓
Post-inference governance + RIVM when relational
        ↓
Validation
        ↓
Telemetry + Receipts
        ↓
GSMB / persistent context
```

Persistence is deliberately split by responsibility:

```text
POSTGRESQL = authoritative relational / constitutional truth + receipts
MONGODB    = mutable context + adaptive world projection
SQLITE     = offline edge continuity + pending commands + local receipts + replay
```

The model is **never** the sovereign source of truth.

➡️ The exact implementation belongs in the **[Architecture Overview](docs/architecture/README.md)**.

---

# 🚀 Run the repository locally

```bash
pnpm install
pnpm dev
```

Core repository gates:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm governance-validation
```

Python governance slice:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

Do not turn an unobserved run into a passing receipt. Code, tests, CI and runtime validation are separate evidence states.

---

<p align="center">
  <img src="assets/images/backgrounds/1785192085892.png" alt="Project Jennifer title art" width="78%" />
</p>

<h3 align="center">WE DO NOT PLAY TO ESCAPE REALITY.</h3>
<h3 align="center">WE PLAY TO GOVERN WHAT BECOMES REAL.</h3>

<p align="center"><strong>PROJECT JENNIFER · KOPANO LABS · SOUTH AFRICA</strong></p>
<p align="center">MIT License</p>

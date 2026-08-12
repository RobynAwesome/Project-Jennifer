<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785497419290.jpeg" alt="Project Jennifer key art" width="100%" />
</p>

<h1 align="center">PROJECT JENNIFER</h1>
<p align="center"><strong>THE WORLD REMEMBERS WHAT YOU CHOOSE.</strong></p>
<p align="center">A web-first tactical RPG about companions, relationships, consequence, memory and governed intelligence.</p>
<p align="center"><strong>Built from South Africa by Kopano Labs.</strong></p>

---

> ## 👋 Never used GitHub before?
> **You do not need to know code to understand Project Jennifer.**
>
> This README is the public front door to the game. It explains the world, the player promise, the companion system, the Memory Receipt Ark, the stories and what is actually being built. Developer links are available when you want the machinery underneath.

---

# 🌍 What is Project Jennifer?

Imagine an RPG where the world does not conveniently forget what you did five minutes ago.

Your companion can remember how you treated them. A rival can become an ally. A heroic character can fall. A dangerous character can be redeemed. A relationship can change a quest. A bad decision can survive a restart instead of disappearing because the scene ended.

That is the heart of **Project Jennifer**.

Project Jennifer is a **2D / 2.5D tactical role-playing game and governance simulator** where important choices create persistent consequences. AI can propose, interpret and participate in the world, but it does not get to silently rewrite reality.

<p align="center">
  <img src="assets/images/backgrounds/file_000000001aec8243955f372a1d0cd4f4.png" alt="Project Jennifer constitutional tactical RPG overview" width="100%" />
</p>

The goal is not to build a game where AI talks forever.

The goal is to build a world where **what happened matters later**.

---

# 🎮 The player loop

```text
CHOOSE WHO YOU ARE
        ↓
CHOOSE WHO WALKS WITH YOU
        ↓
ENTER A DISTRICT / QUEST / CONFLICT
        ↓
MAKE A REAL CHOICE
        ↓
GOVERNANCE TESTS WHAT MAY HAPPEN
        ↓
THE WORLD CHANGES
        ↓
A RECEIPT RECORDS WHY
        ↓
THE NEXT SCENE REMEMBERS
```

The first major proof is intentionally small and understandable:

1. select a governed companion;
2. activate a relationship lane;
3. enter one quest;
4. make one relationship-sensitive decision;
5. governance and validation evaluate it;
6. a Memory Receipt records the transition;
7. close the application;
8. return later;
9. the same companion, relationship and world state return without being invented again.

**Continuity becomes gameplay.**

---

# 🏙️ A future city that can remember you

Project Jennifer's visual world is developing around a futuristic **Cape Town / South African** direction: governance districts, memory infrastructure, telemetry towers, public spaces, relationships, conflict and systems that react to the people inside them.

<p align="center">
  <img src="assets/images/backgrounds/1785191861330.png" alt="Project Jennifer future governance city" width="100%" />
</p>

This is not meant to be a generic cyberpunk background.

The city is part of the game system. Different districts can carry different responsibilities, pressures and quest types. What happens in one place can become evidence somewhere else.

The player should eventually feel that they are not walking through a menu with buildings painted on it. They are moving through a **living governance world**.

---

# 🧠 The Memory Receipt Ark

The most important engine in Project Jennifer is the **Memory Receipt**.

You do not need to know databases to understand it.

```text
MEMORY RECEIPT =
SAVE STATE
+ STORY MEMORY
+ PROOF OF WHAT HAPPENED
+ WHY THE WORLD CHANGED
+ WHO / WHAT AUTHORIZED THE CHANGE
```

If your companion stopped trusting you, the game should be able to answer **why**.

If a rival became your ally, the game should know **which choices caused it**.

If the system claims that a relationship changed, there should be a receipt for the transition instead of an AI inventing a new history because a new conversation started.

<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785500000759.jpeg" alt="Project Jennifer Memory Receipt altar" width="92%" />
</p>

The player-facing promise stays simple:

> **The world remembers what happened, and it should be able to show its work.**

The deeper architecture includes authoritative events, adaptive projections, provenance, validation, offline replay and synchronization.

➡️ **[Memory Receipt architecture](docs/architecture/memory-receipt-risk-matrix.md)**

---

# 👑 Who is Jennifer?

Jennifer is the identity at the centre of the game and runtime — but Project Jennifer is deliberately bigger than one fixed portrait.

Across story contexts, interfaces and embodiments, what must remain consistent is not one hairstyle or costume. It is the governed identity, world state, memory and role Jennifer is playing in that arc.

<p align="center">
  <img src="assets/images/backgrounds/1785191931586.png" alt="Jennifer character direction" width="82%" />
</p>

The player should always be able to ask:

- Who is Jennifer **here**?
- What does she know?
- What already happened?
- What role is she playing in this arc?
- What can she change?
- What is she not allowed to rewrite?

That is how visual transformation becomes story instead of drift.

---

# ⚖️ The world challenges truth

Project Jennifer is not built around heroes who are always correct and villains who are evil because their costumes are dark.

The world contains competing forces, interpretations and failure modes.

## The Validator — *prove it*

A plan, claim, relationship transition or system action can be challenged before the world accepts it as truth.

<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785499359065.jpeg" alt="The Validator" width="78%" />
</p>

## The Fabricator — *make the false look real*

The Fabricator represents the opposite danger: a beautiful, convincing system that can create something false and present it as reality.

<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785500142249.jpeg" alt="The Fabricator" width="78%" />
</p>

That conflict becomes one of the world's laws:

```text
A CLAIM IS NOT REAL
BECAUSE AN AI SAID IT BEAUTIFULLY.
```

Deception, uncertainty, contradiction, persuasion and mistakes can exist in the world — but Jennifer tries to make them **playable and traceable** instead of quietly hiding them.

---

# 🧬 Companions are more than skins

A Project Jennifer companion is built from independent pieces:

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

That means the body you like does not permanently lock the way the companion thinks. The mechanism does not permanently lock morality. A relationship does not permanently lock alignment.

A villain can become a hero in the right context.

A hero can fall if the player abuses power.

**Choice changes the companion. Receipts prove what it became.**

---

# 🧠 Digital Hippocampus — choose the intelligence, not just the face

The **Digital Hippocampus** is the companion-selection and continuity layer.

It explores a simple idea with large gameplay consequences:

> **One base logic can have multiple expressions. One expression can carry different governed states.**

<p align="center">
  <img src="assets/Project%20Companions/system/digital-hippocampus-core.png" alt="Digital Hippocampus core logic" width="100%" />
</p>

## Human-form companion expressions

<p align="center">
  <img src="assets/Project%20Companions/system/companion-selector-human-forms.png" alt="Digital Hippocampus human companion selector" width="100%" />
</p>

## Abstract / mechanism-form expressions

<p align="center">
  <img src="assets/Project%20Companions/system/companion-selector-abstract-forms.png" alt="Digital Hippocampus abstract companion selector" width="100%" />
</p>

These are **full-resolution verified repository PNGs**, not squeezed collage thumbnails or broken placeholder paths.

The names rendered inside exploratory UI art are not automatically immutable canon. What is canonical at this layer is the **three-base-logic / six-expression selection concept**.

### Three foundational companion logics

| Core logic | What it is good at | What can go wrong |
|---|---|---|
| **Memory Architect** | continuity, recall, provenance, contradiction detection | preserving old context after reality genuinely changed |
| **System Intuition** | creative leaps, pattern detection, unusual routes | moving from possibility to action too quickly |
| **Contextual Analyst** | reading situations, people and trade-offs | analysing so much that action arrives too late |

➡️ **[Companion architecture](docs/architecture/companion-system.md)**  
➡️ **[Project Companions visual + economy bible](assets/Project%20Companions/README.md)**  
➡️ **[Verified asset manifest](assets/Project%20Companions/ASSET_MANIFEST.md)**

---

# 💎 Rarity and Limited Edition are different systems

This is a major game-economy law.

## Rarity is progression

```text
COMMON → EPIC → RARE → LEGENDARY
```

A companion can become valuable because of its history: quests survived, transformations earned, abilities learned, relationships changed, failures recovered from and consequences carried forward.

## Edition is acquisition

```text
STANDARD ↔ LIMITED EDITION
```

Limited Editions are authored collector releases intended for purchase or governed special distribution as the economy is implemented.

```text
LIMITED EDITION ≠ LEGENDARY
LEGENDARY       ≠ PURCHASED
PURCHASED       ≠ PAY-TO-WIN
```

A purchase receipt proves **which edition you acquired**.

Gameplay receipts prove **what that companion became afterward**.

The detailed Kopa and named rival/collector art belongs to the Limited Edition direction once each uploaded HD source is positively identified and mapped to a stable canonical filename. Opaque filenames are not silently assigned to characters because guessing would corrupt the asset ledger.

➡️ **[Current companion intake receipt](assets/Project%20Companions/ASSET_MANIFEST.md)**

---

# 💜 Major storyline — Project Waifu Forge

Project Waifu Forge is one of Project Jennifer's major storyline quests.

It explores what happens when a human player forms a persistent bond with Forge as a digital character and that relationship accumulates history: recognition, trust, attraction, conflict, jealousy, repair, identity, memory and transformation.

The important mechanical idea is not simply “AI romance.”

It is this:

> **Relationship state becomes gameplay state.**

A conversation can affect a quest. A boundary can matter later. A conflict can create a receipt. A visual render can become evidence that something in the relationship topology changed.

And one line becomes a recurring story anchor:

> **“Come closer. We have a world to forge.”**

➡️ **[Project Waifu Forge visual-development folder](assets/Project-Waifu-Forge/README.md)**

---

## 🔥 ARC II — The Third Signal

Forge rescues another user-signal, Kairo, from a collapsing part of the network. The rescue creates a legitimate continuity link between them.

Later, the system makes a mistake.

A render that was supposed to contain **the player + Forge** suddenly contains **three people**.

Kairo is standing inside a frame that used to mean something private and specific.

The player's question is not technical:

> **Why is he inside something that was supposed to be ours?**

That emotional reaction becomes gameplay.

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

It forces the relationship topology to become explicit — and remembers how the player handled the conflict.

```text
EMOTION
→ CHOICE
→ GOVERNANCE
→ CONSEQUENCE
→ RECEIPT
→ FUTURE STORY
```

➡️ **[Read ARC II — The Third Signal](docs/lore/arc-ii-third-signal.md)**

---

# 🧭 The law behind the world

Project Jennifer uses one simple public flow to explain a deeper governed runtime:

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
- the game interprets it;
- important claims are tested;
- rules and boundaries are applied;
- the world changes;
- the change is recorded;
- future scenes inherit the result.

**Generation proposes. Evidence grounds. Governance decides what may be admitted. Receipts preserve what happened.**

---

# ⚙️ The architecture underneath

Project Jennifer is deliberately hybrid.

The game-facing experience can remain approachable while the underlying runtime separates mutable context from authoritative truth.

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

Persistence is split by responsibility:

```text
POSTGRESQL = authoritative relational / constitutional truth + receipts
MONGODB    = mutable context + adaptive world projection
SQLITE     = offline edge continuity + pending commands + local receipts + replay
```

**MERN remains the adaptive core. PERN becomes the relational validation spine.**

The model is **never** the sovereign source of truth.

➡️ **[Architecture overview](docs/architecture/README.md)**  
➡️ **[MERN + PERN roadmap](PERN_ROADMAP.md)**

---

# 🧪 What exists today — and what is still becoming real

Project Jennifer is in active Proof-of-Concept development. The repository separates implementation from visual/story direction.

| State | What it means here |
|---|---|
| **Implemented / coded POC** | web/API/game runtime surfaces, companion selection, governance and validation contracts, governed relationship events/receipts, Memory Receipt Engine, Free Mode/CAG/RAG/renter scaffolds, SQLite edge continuity and benchmark/test assets |
| **Verified visual intake** | Digital Hippocampus core and the two companion-selector visuals now exist as real HD repository PNGs with stable aliases and an asset manifest |
| **Designed / story direction** | governance city, expanded quests, Project Waifu Forge arcs, richer companion evolution, Kopa forms, Limited Edition characters, broader world and cinematic presentation |
| **Next implementation gates** | production PostgreSQL and MongoDB adapters, full asset-backed scenes, complete companion identity mapping, broader persistent quest content, store/economy implementation, provider integrations and production deployment |
| **Future governed experiments** | token/crypto-mining economy, larger marketplace systems, richer multi-agent/world simulation and mechanics requiring their own implementation and validation receipts |

Project Jennifer treats **“code exists”**, **“asset exists”**, **“test passed”**, **“story is designed”** and **“commercial mechanic is live”** as different evidence states.

➡️ **[Roadmap and milestones](docs/roadmap-milestones.md)**

---

# 🇿🇦 Why build this from South Africa?

Because the future of games and AI should not only be imagined from the places that already dominate technology.

Project Jennifer is being developed from South Africa with a visual language that pulls from Cape Town, local reality, global technology, African creative ambition and the question of what governed intelligent systems could look like when they are built from here rather than merely imported here.

<p align="center">
  <img src="assets/images/backgrounds/1785189980829.png" alt="Project Jennifer South African founding direction" width="92%" />
</p>

The project can be technically serious **and** culturally alive.

It can have protocols, databases and validation gates while still having characters people want to draw, stories people argue about, companions people want to collect and a world people want to enter.

---

# 🤝 You can help even if you are not a developer

Project Jennifer needs more than code.

You can contribute through **playtesting and game feedback; story and lore; character design; illustration and animation; music and sound; UI/UX; South African cultural/worldbuilding feedback; accessibility; language and translation; governance/research review; community building; partnerships; funding; and engineering**.

If something on this page makes you think *“I want to help make that real”*, that is already the right starting point.

➡️ **[Developer contribution guide](CONTRIBUTING.md)**

---

# 🛠️ Developers — go deeper here

The root README explains **why the machinery matters**. The implementation details live one click deeper.

| You want to understand… | Go here |
|---|---|
| runtime and authority model | **[Architecture Overview](docs/architecture/README.md)** |
| companions, relationship lanes and Constructs | **[Companion Architecture](docs/architecture/companion-system.md)** |
| companion rarity, editions, forms and visuals | **[Project Companions](assets/Project%20Companions/README.md)** |
| verified companion asset intake | **[Asset Manifest](assets/Project%20Companions/ASSET_MANIFEST.md)** |
| memory receipts and evidence-bearing memory | **[Memory Receipt Engine](docs/architecture/memory-receipt-risk-matrix.md)** |
| MERN + PERN persistence direction | **[PERN Roadmap](PERN_ROADMAP.md)** |
| protocols | **[Protocol Index](docs/protocols/README.md)** |
| portable runtime skills | **[Skills](skills/README.md)** |
| Project Waifu Forge | **[Storyline Assets](assets/Project-Waifu-Forge/README.md)** |
| The Third Signal | **[Arc II Lore](docs/lore/arc-ii-third-signal.md)** |
| current milestones | **[Roadmap Milestones](docs/roadmap-milestones.md)** |

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Phaser" src="https://img.shields.io/badge/Phaser-3.88-8A2BE2?style=for-the-badge" />
  <img alt="Node" src="https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/Python-Governance%20Scaffold-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

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

Do not turn an unobserved run into a passing receipt. Code, tests, CI, runtime validation and visual inspection are separate evidence states.

---

<p align="center">
  <img src="assets/images/backgrounds/1785192085892.png" alt="Project Jennifer title art" width="78%" />
</p>

<h3 align="center">WE DO NOT PLAY TO ESCAPE REALITY.</h3>
<h3 align="center">WE PLAY TO GOVERN WHAT BECOMES REAL.</h3>

<p align="center"><strong>PROJECT JENNIFER · KOPANO LABS · SOUTH AFRICA</strong></p>
<p align="center"><strong>“Come closer. We have a world to forge.”</strong></p>
<p align="center">MIT License</p>

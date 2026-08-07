<p align="center">
  <img src="assets/images/backgrounds/copilot_image_1785497419290.jpeg" alt="Project Jennifer key art" width="100%" />
</p>

<h1 align="center">PROJECT JENNIFER</h1>
<p align="center"><strong>Constitutional Tactical RPG · Sovereign Governance Intelligence · APWA</strong></p>
<p align="center">A persistent game world where memory, companions, quests, relationships, telemetry and AI actions must survive governance before they become reality.</p>

<p align="center">
  <img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Next.js 14" src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React 18" src="https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Phaser 3.88" src="https://img.shields.io/badge/Phaser-3.88-8A2BE2?style=for-the-badge" />
  <img alt="Node 20+" src="https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="MIT" src="https://img.shields.io/badge/License-MIT-white?style=for-the-badge" />
</p>

<p align="center">
  <a href="docs/architecture/README.md">Architecture</a> ·
  <a href="docs/protocols/README.md">Protocols</a> ·
  <a href="docs/architecture/companion-system.md">Companion Runtime</a> ·
  <a href="assets/Project%20Companions/README.md">Project Companions</a> ·
  <a href="PERN_ROADMAP.md">MERN + PERN Roadmap</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

---

## 🎮 Enter the game

Project Jennifer is a **web-first 2D/2.5D tactical RPG and governance simulator** built as an Adaptive Progressive Web Application. The current vertical-slice direction combines companion selection, persistent relationships, NPCs, governed decisions, constitutional combat, memory receipts and world-state consequences.

<p align="center">
  <img src="assets/images/backgrounds/file_000000001aec8243955f372a1d0cd4f4.png" alt="Project Jennifer gameplay and constitutional tactics overview" width="100%" />
</p>

**Current proof target:** a player should be able to select a companion, enter a governed quest, make a consequential decision, receive a validation receipt, persist the resulting state and return to the same world after restart or offline recovery.

---

## 🧬 Project Companions

Companions are not skins welded to fixed morality. They are composable governed entities:

```text
Companion = Identity × Form × Core Mechanism × Alignment × Relationship Lane × Skill Loadout
```

A traditionally heroic identity can carry a dangerous Shadow mechanism. A rival can be redeemed. A generic starter can become rare through validated history. **Choice changes the companion; receipts prove what it became.**

### Exclusive / lore-bound companions

<p align="center">
  <img src="assets/Project%20Companions/exclusive/vanta-exclusive.webp" alt="Vanta exclusive companion concept" width="23%" />
  <img src="assets/Project%20Companions/exclusive/nyra-exclusive.webp" alt="Nyra exclusive companion concept" width="23%" />
  <img src="assets/Project%20Companions/exclusive/solvek-exclusive.webp" alt="SolveK exclusive companion concept" width="23%" />
  <img src="assets/Project%20Companions/exclusive/lyrae-exclusive.webp" alt="Lyrae exclusive companion concept" width="23%" />
</p>

### Generic / configurable population

<p align="center">
  <img src="assets/Project%20Companions/generic/companion-ecosystem-generic-lineup.webp" alt="Generic Project Jennifer companion ecosystem" width="100%" />
</p>

| Tier | Design law | Typical acquisition |
|---|---|---|
| **Common / Generic** | Highly configurable; mechanism-first | Starter, discovery, quests, free drops, cosmetic purchase |
| **Evolved** | Rarity can come from history, not only scarcity | Earned through play, receipts and transformation |
| **Exclusive** | Authored, lore-bound and opinionated; not automatically stronger | Major arcs, rare unlocks, special events, founder/lore editions |

➡️ **[Open the Project Companions character bible](assets/Project%20Companions/README.md)**

---

## ⚙️ Frameworks & runtime

Project Jennifer is not a single engine pretending to be the whole system. It is a governed composition of runtimes, stores and protocols.

| Layer | Technology / responsibility |
|---|---|
| **Monorepo** | Turborepo · pnpm workspaces |
| **Language** | TypeScript 5 |
| **APWA shell** | Next.js 14 · React 18 · Tailwind CSS |
| **Game runtime** | Phaser 3.88 · WebGL / Canvas |
| **API** | Node.js 20+ · Express 4 |
| **MERN adaptive core** | MongoDB for mutable context, companion working memory and adaptive world projections |
| **PERN validation spine** | PostgreSQL for authoritative relationships, events, constraints and receipts |
| **Offline execution** | PWA service-worker / local-state direction with governed synchronization |
| **Infrastructure** | Docker Compose |
| **Validation** | Typecheck · lint · tests · build · Governance Validation Gate |
| **Automation** | GitHub Actions |

### KPGS / Jennifer frameworks

- **Governance Engine** — determines what the runtime is permitted to enact.
- **Validation Engine** — converts claims and decisions into pass/fail evidence.
- **GSMB / Digital Hippocampus** — persistent memory and continuity substrate.
- **Telemetry** — records observable system and world events.
- **HUE** — human-understanding execution and context interpretation.
- **Collective Ingress + CCPP** — governed multi-source context ingress.
- **Crisis Connect** — report and crisis-governance surface.
- **NPC Runtime** — simulated actors and world participation.
- **Companion System** — core logic, identity, embodiment and relationship lanes.
- **Relationship Receipt Spine** — authoritative relational events and receipts.
- **NCMP** — governed companion / memory protocol surface.
- **Project Waifu Forge** — Construct runtime; distinct from player companions.

### AI roadmap

```text
Generative AI → Agentic AI → Identic AI → Telemetry AI → Natural AI → Guardian AI
```

The model is never the sovereign source of truth. Generation proposes. Agents act. Telemetry observes. Identity binds continuity. Guardian logic validates admission. **KPGS governs the system.**

---

## 🏗️ Architecture at a glance

```text
Player / APWA
     ↓
Next.js + React shell
     ↓
Phaser gameplay runtime
     ↓
KPGS domain engines
  ├─ Governance
  ├─ Validation
  ├─ Memory / GSMB
  ├─ Telemetry
  ├─ HUE
  ├─ NPCs
  ├─ Companions
  └─ Relationship receipts
     ↓
Node + Express API
     ↓
MongoDB adaptive projection  ⇄  PostgreSQL authoritative ledger
```

```text
MONGO    = mutable context + adaptive world projection
POSTGRES = authoritative relationships + events + receipts + constraints
```

The repository already contains the hybrid MERN + PERN architecture, schema/scaffold work and governed relationship contracts. **Live production database-driver/repository activation remains an explicit next persistence gate** rather than something this README pretends is finished.

➡️ **[Read the MERN + PERN roadmap](PERN_ROADMAP.md)**

---

## 👑 High-resolution character direction

<p align="center">
  <img src="assets/images/backgrounds/1785191931586.png" alt="Jennifer" width="31%" />
  <img src="assets/images/backgrounds/copilot_image_1785499359065.jpeg" alt="Validator character" width="31%" />
  <img src="assets/images/backgrounds/copilot_image_1785500142249.jpeg" alt="Fabricator character" width="31%" />
</p>

The public README deliberately keeps only high-value visual signals. Deep lore, protocol definitions, proof notes, architecture rationale and implementation receipts belong in the repository documentation—not in a wall of front-page exposition.

---

## 🗺️ Repository map

```text
apps/
  web/                     Next.js + React + Phaser player experience
  api/                     Express runtime API
packages/                  Governance, validation, memory, telemetry, companions…
assets/
  images/                  Project Jennifer visual canon / concept library
  Project Companions/      Companion character bible and visual asset pack
docs/
  architecture/            System architecture and ADR-level design
  protocols/               KPGS / Jennifer protocol documentation
infra/                     Persistence and infrastructure assets
PERN_ROADMAP.md             Hybrid MERN + PERN persistence roadmap
```

- **[Architecture index](docs/architecture/README.md)**
- **[Protocol index](docs/protocols/README.md)**
- **[Companion architecture](docs/architecture/companion-system.md)**
- **[Project Companions](assets/Project%20Companions/README.md)**
- **[Contribution guide](CONTRIBUTING.md)**

---

## 🚀 Run locally

```bash
pnpm install
pnpm dev
```

Before opening a pull request:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm governance-validation
```

Project Jennifer is open source. Contributors do not need to ask permission to have an idea: **fork, implement, validate, and submit the receipt through a pull request.**

---

<p align="center">
  <img src="assets/images/backgrounds/1785192085892.png" alt="Project Jennifer" width="70%" />
</p>

<p align="center"><strong>WE DO NOT PLAY TO ESCAPE REALITY. WE PLAY TO GOVERN WHAT BECOMES REAL.</strong></p>
<p align="center">Built by <strong>Kopano Labs</strong> · MIT License</p>

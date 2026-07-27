# Project Jennifer

**Project Jennifer** is a sovereign governance intelligence runtime designed to move artificial intelligence beyond conversation and into persistent, living systems.

Instead of treating an AI model as the operating system, Jennifer treats the model as only one _reasoning component_ inside a larger governance architecture composed of telemetry, memory, validation, collective perception, runtime state, and human-centred understanding.

---

## Architecture Philosophy

> The LLM is only the reasoning engine.  
> Governance, telemetry, memory, validation, and runtime state exist **outside** the transformer.

```
User Request → Governance Engine → Validation Pipeline → LLM → Response
                     ↑                    ↑
               Policy Store          GSMB Memory
```

---

## Repository Structure

```
Project-Jennifer/
├── apps/
│   ├── web/          # Next.js 14 frontend (TypeScript + TailwindCSS)
│   └── api/          # Node.js / Express REST API
│
├── packages/
│   ├── shared/            # Types, event bus, utilities
│   ├── governance/        # Policy engine, permissions, semantic contracts
│   ├── telemetry/         # Runtime events, time, environment monitoring
│   ├── memory/            # GSMB – Grounded State Memory Buffer
│   ├── validation/        # Validation pipeline, confidence scoring
│   ├── hue/               # Human Understanding Engine
│   ├── collective-ingress/ # Societal event monitoring + CCPP
│   ├── crisis-connect/    # Humanitarian module
│   ├── npc/               # Autonomous NPC runtime
│   └── runtime/           # Jennifer runtime, personas, world state
│
└── docs/
    ├── architecture/  # System architecture & module map
    ├── research/      # Research areas and open questions
    └── protocols/     # Runtime interaction protocols
```

---

## Core Systems

### 1. Governance Engine (`@jennifer/governance`)
- **PolicyEngine** – evaluates ordered, prioritised policies against request context
- **PermissionManager** – subject → action → resource permission lookup
- **SemanticContractRegistry** – runtime-enforced I/O contracts between modules

### 2. GSMB – Grounded State Memory Buffer (`@jennifer/memory`)
- Five memory kinds: episodic, semantic, procedural, working, collective
- Importance-based ranking with recency decay
- Consolidation pass: importance decay + expiry cleanup
- Swappable backend (`IMemoryStore` interface → Prisma/SQLite in production)

### 3. Telemetry Engine (`@jennifer/telemetry`)
- `TelemetryCollector` – collects and broadcasts all runtime events
- `TimeTracker` – wall clock, tick counter, session uptime
- `EnvironmentMonitor` – feature flags, process metadata

### 4. Runtime Validation Engine (`@jennifer/validation`)
- `ValidationPipeline` – chainable, composable rule execution
- `ConfidenceScorer` – weighted signal aggregation
- `RealityVerifier` – claim-against-evidence grounding

### 5. HUE – Human Understanding Engine (`@jennifer/hue`)
- `HumanStateAbstractor` – tracks emotional state, engagement, stress
- `EmotionalWeighter` – modulates response tone by emotional state
- `ContextWeighter` – half-life decay on context relevance
- `BehavioralAdapter` – per-user preference and adaptation tracking

### 6. Collective Ingress Engine (`@jennifer/collective-ingress`)
Monitors large-scale societal signals:
- Holidays, cultural events, sporting events
- Financial changes, weather, geographic events
- Internet trends, public sentiment

Influences system behaviour via a `getBehaviourModifier()` scalar rather than directly generating responses.

### 7. Collective Perception Protocol (CCPP)
Tracks how a single ingress event evolves through distributed networks:
`emergence → amplification → distribution → saturation → decay`

### 8. Crisis Connect (`@jennifer/crisis-connect`)
Humanitarian module covering: community, public-service, employment, accessibility, local governance.

### 9. Jennifer Runtime (`@jennifer/runtime`)
Jennifer is a runtime **persona** – not the operating system. Supported personas:
- Best Friend · Mentor · Governance Operator · Research Assistant

The runtime manages a **persistent governance city** with 10 districts.

### 10. NPC Runtime (`@jennifer/npc`)
NPCs are not scripted. Each agent has:
- Local district awareness
- Personal episodic + semantic memory
- Priority-ordered goals (tracked over time)
- Trust-weighted relationship graph
- Telemetry emission on every tick

**Premium feature:** NPC simulation continues while the user is offline. Free users pause on disconnect.

---

## Governance City Districts

| District | Role |
|----------|------|
| Central Governance Hall | Policy evaluation and enforcement |
| Memory District | GSMB – persistent memory |
| Telemetry Tower | Real-time event streaming |
| Crisis Connect HQ | Humanitarian operations |
| Collective Ingress Observatory | Societal signal monitoring |
| HUE Institute | Human understanding and adaptation |
| Financial Exchange | Financial ingress signals |
| Training Grounds | NPC skill development |
| Knowledge Library | Semantic memory archive |
| Agent Workshop | NPC creation and configuration |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript 5 throughout |
| Frontend | Next.js 14, React 18, TailwindCSS |
| API | Node.js, Express 4 |
| Python microservices | FastAPI _(planned)_ |
| Database | SQLite + Prisma ORM _(planned)_ |
| Containers | Docker + Compose _(planned)_ |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9

```bash
# Install dependencies
pnpm install

# Start all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Typecheck
pnpm typecheck
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/architecture/README.md`](docs/architecture/README.md) | System design, module map, data flows |
| [`docs/research/README.md`](docs/research/README.md) | Research areas, open questions, PoC/FoC methodology |
| [`docs/protocols/README.md`](docs/protocols/README.md) | Runtime interaction protocols |

---

## Coding Principles

- **SOLID** – single responsibility, open/closed, Liskov, interface segregation, dependency inversion
- **Clean Architecture** – layers never bypass their neighbours
- **Event-Driven** – modules communicate via `IEventBus`, not direct coupling
- **Dependency Injection** – infrastructure injected at composition root
- **Governance before Intelligence** – policies gate every LLM call
- **Validation before Optimisation** – correctness over speed
- **Reality before Prediction** – grounded memory over hallucination

---

## License

See [LICENSE](LICENSE).

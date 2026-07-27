# Project Jennifer – Architecture Overview

## Philosophy

**Governance First. Intelligence Second.**

Project Jennifer treats the LLM as a _reasoning component_ – not the operating system. Every significant output is passed through a validation pipeline, cross-referenced against grounded memory, and authorised by governance policies before it reaches the user.

```
User Request
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│                  Governance Engine                        │
│   PolicyEngine → PermissionManager → SemanticContract    │
└──────────────────────┬───────────────────────────────────┘
                       │ allowed
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  Jennifer Runtime                         │
│   PersonaManager → WorldStateManager → SessionManager    │
└──────────┬───────────────────────────────┬───────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐       ┌──────────────────────────┐
│   GSMB (Memory)     │       │   Telemetry Engine       │
│   InMemoryGSMB      │       │   TelemetryCollector     │
│   ContextManager    │       │   TimeTracker            │
│   MemoryIndexer     │       │   EnvironmentMonitor     │
└─────────────────────┘       └──────────────────────────┘
           │                               │
           └──────────┬────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│               Runtime Validation Engine                   │
│   ValidationPipeline → ConfidenceScorer → RealityVerifier│
└──────────────────────────────────────────────────────────┘
                      │
                      ▼
              LLM Reasoning Call
                      │
                      ▼
              Response to User
```

---

## Module Map

| Module | Package | Responsibility |
|--------|---------|----------------|
| Shared | `@jennifer/shared` | Types, event bus, utilities |
| Governance | `@jennifer/governance` | Policies, permissions, semantic contracts |
| Telemetry | `@jennifer/telemetry` | Runtime events, time, environment |
| Memory (GSMB) | `@jennifer/memory` | Persistent memory, context, indexing |
| Validation | `@jennifer/validation` | Pipeline, confidence scoring, reality verification |
| HUE | `@jennifer/hue` | Human state, emotional weighting, behavioral adaptation |
| Collective Ingress | `@jennifer/collective-ingress` | Societal events, CCPP |
| Crisis Connect | `@jennifer/crisis-connect` | Humanitarian data management |
| NPC Runtime | `@jennifer/npc` | Autonomous agents, awareness, relationships |
| Jennifer Runtime | `@jennifer/runtime` | Persona, world state, districts, sessions |
| API | `@jennifer/api` | REST API server |
| Web | `@jennifer/web` | Next.js frontend |

---

## Data Flow

### Memory (GSMB)

All memory operations flow through the `IMemoryStore` interface. The reference implementation is `InMemoryGSMB`. Production deployments inject a Prisma-backed adapter.

```
store()  → generateId → clamp → persist → return MemoryEntry
retrieve() → lookup → isExpired? → update accessedAt → return
query()  → filter → sort by importance → limit → return[]
consolidate() → decay stale entries → remove expired → return count
```

### Validation Pipeline

```
addRule(r1) → addRule(r2) → addRule(r3)
run(requestId, payload) →
    r1.validate() → result1
    r2.validate() → result2
    r3.validate() → result3
    calculateOverallConfidence([r1,r2,r3])
    return ValidationReport
```

### Governance Decision

```
evaluate(requestId, context) →
    for each policy (priority desc):
        matchesConditions(policy.conditions, context)?
            yes → return GovernanceDecision(effect=policy.effect)
    → return GovernanceDecision(effect=deny)  // secure default
```

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | Turborepo | Efficient incremental builds, shared TS config |
| Package manager | pnpm | Workspace support, disk efficiency |
| Language | TypeScript | Type safety across all packages |
| API framework | Express | Minimal, composable, battle-tested |
| Frontend | Next.js 14 | App Router, RSC, Tailwind integration |
| Styling | TailwindCSS | Utility-first, governance city theme |
| Initial DB | SQLite + Prisma | Zero-config persistence, easy migration to Postgres |
| Event bus | In-process (IEventBus) | Swappable to Redis/NATS in production |
| CI/CD | GitHub Actions | Native integration, matrix builds |

---

## Coding Principles

1. **SOLID** – Single responsibility per class, open for extension
2. **Clean Architecture** – Layers never bypass their neighbours
3. **Event-Driven** – Modules communicate via `IEventBus`, not direct coupling
4. **Dependency Injection** – Infrastructure is injected at composition root
5. **Testability First** – All classes accept injected dependencies
6. **Governance before Intelligence** – Policies gate every LLM call
7. **Validation before Optimisation** – Correctness over speed
8. **Reality before Prediction** – Grounded memory over hallucination

---

## Deployment

### Development

```bash
pnpm install
pnpm dev   # starts all apps and packages in watch mode
```

### Production

```bash
pnpm build
# API
node apps/api/dist/server.js
# Web
next start --prefix apps/web
```

### Docker

Each app ships a `Dockerfile`. Compose the full stack with:

```bash
docker compose up
```

See `/docs/architecture/docker.md` for details.

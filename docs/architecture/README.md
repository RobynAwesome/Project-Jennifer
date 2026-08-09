# Project Jennifer – Architecture Overview

## Philosophy

**Governance First. Intelligence Second.**

Project Jennifer treats an LLM/model/runtime as a reasoning or execution component — never the operating system and never the automatic source of truth. Free Mode is the orchestration engine. CAG governs attention, RAG retrieves evidence, validation governs admission, telemetry records consequences, and persistence rails preserve authority/context/offline continuity.

```text
USER / WORLD EVENT
        ↓
FREE MODE ENGINE
        ↓
CAG — PRE-INFERENCE
        ↓
KNOWLEDGE NEEDED?
   ↙          ↘
 NO            YES
 │              ↓
 │        GOVERNED RAG
 │              ↓
 │        EVIDENCE BUNDLE
 │              ↓
 └──────→ CAG INTERRUPTION GATE
                  ↓
        STATELESS RENTER ROUTER
                  ↓
      model / agent / runtime candidate
                  ↓
          CAG POST-INFERENCE
                  ↓
        RIVM when relational
                  ↓
          VALIDATION GATE
                  ↓
               OUTPUT
                  ↓
       TELEMETRY + RECEIPTS
                  ↓
            GSMB MEMORY
                  ↓
           FEEDBACK LOOP
```

The communication invariant is:

```text
truthful statement
+
wrong conversational priority
=
communication failure
```

The inference invariant is:

```text
having the concept in the weights
!=
governing attention during inference
```

See [`adr-0004-cag-governed-rag-stateless-renters.md`](./adr-0004-cag-governed-rag-stateless-renters.md).

---

## Module Map

### TypeScript product/runtime surface

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

### Python validation/orchestration scaffold

| Module | Path | Responsibility |
|---|---|---|
| Free Mode | `project_jennifer/core` | Main orchestration seam |
| CAG | `project_jennifer/attention` | Communication Attention Governance |
| Governed RAG | `project_jennifer/retrieval` | Authority-aware retrieval and EvidenceBundles |
| Renter router | `project_jennifer/core/renter_router.py` | Exact-runtime capability/benchmark routing |
| Contracts | `project_jennifer/contracts` | Events, receipts, evidence, renters, storage rails |
| Validation | `project_jennifer/validation` | Layered guardrails and validators |
| Telemetry/receipts | `project_jennifer/telemetry` | In-memory and SQLite receipt persistence |
| Offline edge | `project_jennifer/storage` | SQLite pending/replay continuity |
| Skills | `skills/` | Portable CAG/RAG/renter `SKILL.md` workflows |

The Python scaffold is additive. It does not replace the TypeScript product/runtime surface.

---

## Validation Understanding + Context

### CAG — Communication Attention Governance

CAG answers:

> **What deserves attention right now?**

Canonical fields:

```text
ecosystem
subject
intent
authority
relational lane
temperature
cause
confidence scope
attention target
interruption gate
response
observed effect
repair
```

Canonical gate:

```text
Is this true?
      ↓ yes
Is it relevant RIGHT NOW?
      ↓ no
DO NOT INJECT
```

Event-level conclusions do not silently become personality conclusions.

### Governed RAG

RAG answers:

> **What evidence should be retrieved to answer the current attention target?**

```text
Classify knowledge requirement
→ Determine authority tier
→ Form retrieval query
→ Retrieve
→ Rank
→ Deduplicate
→ Check permissions
→ Attach provenance
→ Produce EvidenceBundle
→ CAG relevance gate
→ Generate
→ Validate grounding
→ Receipt
```

Model parametric knowledge may support reasoning but is never mislabeled as retrieved authority.

---

## Evidence Authority Tiers

```text
Tier 0 — POSTGRES / GOVERNED AUTHORITY
         relationship truth, boundaries, receipts, constitutional state

Tier 1 — USER-DECLARED AUTHORITATIVE SOURCES
         supplied files, source-of-truth docs, approved repo contracts

Tier 2 — GSMB / MONGODB ADAPTIVE CONTEXT
         working memory, summaries, relationship context, world projection

Tier 3 — LOCAL KNOWLEDGE
         repos, embeddings, vector stores, Obsidian Root, SQLite evidence cache

Tier 4 — CONNECTED / EXTERNAL KNOWLEDGE
         connectors, web, APIs, remote retrieval systems

Tier 5 — MODEL PARAMETRIC KNOWLEDGE
         useful inference; NOT retrieved authority
```

Authority is scoped. A Tier 0 relationship receipt does not become authoritative for an unrelated scientific claim.

---

## Persistence: PERN + MERN + SQLite Edge

Project Jennifer deliberately keeps three distinct rails:

```text
POSTGRESQL = AUTHORITATIVE RELATIONAL / CONSTITUTIONAL RECORD + RECEIPTS
MONGODB    = MUTABLE CONTEXT + ADAPTIVE WORLD PROJECTION
SQLITE     = OFFLINE EDGE CONTINUITY + PENDING COMMANDS + LOCAL RECEIPTS + REPLAY
```

This preserves the MERN adaptive core while retaining the PERN relationship validation spine and a lightweight offline rail for IdeaPad/local matches.

### Reconciliation

```text
SQLite offline event
→ durable local receipt
→ reconnect
→ authority + idempotency validation
→ PostgreSQL admission OR conflict receipt
→ MongoDB projection refresh
```

MongoDB projections do not silently override PostgreSQL events. SQLite conflicts are not erased to make synchronization look clean.

See [`adr-0003-mern-pern-relationship-spine.md`](./adr-0003-mern-pern-relationship-spine.md).

---

## Stateless Renters

External and local AIs enter Jennifer through exact-runtime capability manifests rather than brand reputation.

```text
provider
model_id
execution mode
capabilities
governance requirements
constraints
benchmarks
```

Routing:

```text
task requirements
→ eligible renters
→ allowlist / explicit user choice
→ execution constraints
→ current benchmark evidence
→ selected renter
```

Explicit user model choice overrides automatic ranking when the runtime is available and no immutable privacy/tool boundary makes the requested execution impossible.

Within granted tool permissions, unfamiliar actions are not rejected merely for being unfamiliar. They may execute, create consequences and produce receipts. Failures remain evidence.

---

## Guardrail Chain

```text
INPUT GUARD
↓
CAG ATTENTION GUARD
↓
RAG AUTHORITY / PRIVACY GUARD
↓
TOOL-ACTION GUARD
↓
OUTPUT VALIDATION
↓
MEMORY-WRITE GUARD
↓
TRAINING-PROMOTION HUMAN GATE
```

The design distinguishes **observed failure** from an **immutable boundary**.

Immutable current POC boundaries include:

- private/intimate context crossing into work/research/customer/public lanes without explicit authorization;
- external tool/platform permissions;
- stateless renter self-promotion into governed memory;
- training-data promotion without human validation.

A failed or strange output may remain receipted evidence even when it does not become authoritative state.

---

## Feedback / Preference Data

```text
response
→ user/world feedback
→ CAG/RAG/RIVM receipt
→ chosen/rejected candidate pair
→ human validation
→ dataset promotion
→ eval / DPO / RLHF / RLAIF / fine-tune lane
```

Inference-time feedback does not imply foundation-model weight updates.

---

## Skill Distribution

Portable workflows live under [`/skills`](../../skills/README.md).

Current skills:

- `cag-communication-attention`;
- `rag-governed-retrieval`;
- `jennifer-stateless-renter`.

Provider-specific adapters may change delivery format, but they must preserve Jennifer authority, privacy, provenance, memory and receipt semantics.

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | Turborepo | Efficient incremental builds, shared TS config |
| Package manager | pnpm | Workspace support, disk efficiency |
| Product language | TypeScript | Type safety across application packages |
| Validation scaffold | Python stdlib-first | Portable deterministic contracts and tests |
| API framework | Express | Minimal, composable, battle-tested |
| Frontend | Next.js 14 | App Router, RSC, Tailwind integration |
| Styling | TailwindCSS | Utility-first, governance city theme |
| Governed authority | PostgreSQL | Transactions, relational integrity, receipts |
| Adaptive projection | MongoDB | Mutable context and rebuildable world state |
| Offline edge | SQLite | Zero-service local continuity and replay |
| Event bus | In-process for POC | Swappable behind contracts |
| CI/CD | GitHub Actions | Native repository integration when CI is enabled |

---

## Coding Principles

1. **SOLID** — single responsibility per class, open for extension.
2. **Clean Architecture** — layers do not silently bypass authority boundaries.
3. **Event-Driven** — frameworks communicate through stable event contracts.
4. **Dependency Injection** — infrastructure is injected at composition roots.
5. **Testability First** — deterministic in-memory/local adapters support validation.
6. **Governance before Intelligence** — model capability does not imply authority.
7. **Validation before Optimisation** — correctness and receipts before speed claims.
8. **Reality before Prediction** — evidence and telemetry outrank fabrication.
9. **Attention before verbosity** — relevant truth outranks irrelevant truth in the current frame.
10. **Failure before fabrication** — record consequence; do not cosmetically rewrite it.

---

## Development

```bash
pnpm install
pnpm dev
```

Python governance tests:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

Production/deployment claims remain subject to the existing validation and founder-approval gates.

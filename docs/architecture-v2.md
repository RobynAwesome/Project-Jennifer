# Architecture RFC: Free Mode Multi-Framework Foundation

## Status
- Accepted foundation; refined by ADR-0004 for CAG/RAG/renter routing
- Scope: additive scaffolding
- Repository impact: documentation + Python package boundaries + portable skills

## Why this RFC exists
Project Jennifer is a governance-first, validation-aware runtime. This foundation establishes **Free Mode** as the main orchestration engine while supporting frameworks provide attention governance, retrieval, validation, evaluation, simulation, telemetry and offline continuity.

The goal is to adopt useful patterns without importing third-party identity, assumptions or domain ownership.

## Primary design goals
1. Keep **Free Mode** as the user-facing orchestration engine.
2. Govern conversational/inference priority through **CAG — Communication Attention Governance**.
3. Preserve ordinary **RAG — Retrieval-Augmented Generation** semantics while governing evidence authority, privacy and provenance.
4. Route work to exact stateless renter runtimes by declared capability and measured benchmarks rather than brand reputation.
5. Separate support concerns through explicit contracts and plugins.
6. Use a shared **event bus spine** instead of tight framework coupling.
7. Make runs reproducible through manifests, versioned contracts, receipts and artifacts.
8. Preserve PostgreSQL authority, MongoDB adaptive context and SQLite offline continuity.
9. Support portable `SKILL.md` workflows so renters can enter Jennifer with a clear execution contract.

## Framework map

| Framework | Role | Initial boundary |
|---|---|---|
| Core Free Mode engine | Main orchestration loop, world decisions, user-facing execution | `project_jennifer/core` |
| CAG | Pre/post-inference attention governance and interruption gate | `project_jennifer/attention` |
| Governed RAG | Retrieval planning, authority ordering, privacy, provenance, evidence bundles | `project_jennifer/retrieval` |
| Stateless renter router | Capability/benchmark/allowlist routing with explicit user override | `project_jennifer/core/renter_router.py` |
| Validation framework | Rule checks, guardrails, consistency and integrity gates | `project_jennifer/validation` |
| Evaluation framework | Offline scoring, regression tracking, benchmark runs, release quality signals | `project_jennifer/evaluation` |
| Simulation framework | Stress tests, adversarial exercises, scenario playback, balance experiments | `project_jennifer/simulation` |
| Telemetry/receipts | Event collection, behavior analytics, replay trails and receipt sinks | `project_jennifer/telemetry` |
| Shared contracts | Events, runs, evidence, renters, receipts, persistence rails | `project_jennifer/contracts` |
| Plugin model | Runtime extension point for framework capabilities | `project_jennifer/plugins` |
| Portable skills | Provider-neutral repeatable workflows | `skills/` |

## Control flow at a glance

```text
User / Scenario
   ↓
Free Mode Engine
   ↓
CAG pre-inference
   ↓
RAG when evidence is needed
   ↓
CAG interruption gate
   ↓
Stateless renter router
   ↓
Candidate execution
   ↓
CAG post-inference
   ↓
RIVM when relational
   ↓
Validation / guardrails
   ↓
Telemetry + receipts
   ↓
Governed persistence / feedback
```

## CAG invariant

```text
truthful statement
+
wrong conversational priority
=
communication failure
```

CAG therefore separates truth from **present relevance** and keeps event-level confidence scoped to the evidence that supports it.

## RAG invariant

RAG retrieves external/non-parametric evidence; it does not become the source of authority merely because retrieval succeeded.

```text
Tier 0 PostgreSQL governed authority
→ Tier 1 user-declared authoritative sources
→ Tier 2 GSMB/MongoDB adaptive context
→ Tier 3 local knowledge / SQLite edge cache
→ Tier 4 connected/external sources
→ Tier 5 model parametric prior (not retrieved authority)
```

Authority remains claim-scoped.

## Persistence rails

```text
POSTGRESQL = authoritative relational / constitutional events and receipts
MONGODB    = mutable adaptive context and rebuildable world projection
SQLITE     = offline edge continuity, pending commands, local receipts and replay
```

Offline reconciliation is explicit:

```text
SQLite event
→ local receipt
→ reconnect
→ idempotency + authority validation
→ PostgreSQL admission OR conflict receipt
→ MongoDB projection refresh
```

## Shared contracts + event bus spine
The shared contracts package is the system boundary every framework must respect.

### Required shared concepts
- **RunContext**: stable identity for a run.
- **ReproducibilityManifest**: seed, dataset version, runtime version, contract version.
- **RunArtifact**: durable output pointer.
- **EventEnvelope**: versioned framework event wrapper.
- **CAGEvent / CAGAssessment**: current inference-frame contracts.
- **EvidenceBundle**: ranked, provenance-preserving RAG evidence.
- **RenterCapabilityManifest**: exact-runtime capability and constraint declaration.
- **GovernanceReceipt**: consequence-bearing execution record.
- **StorageRecord**: explicit persistence rail + role.

### Event bus rules
- Frameworks publish domain-relevant events instead of silently mutating each other.
- Event names remain stable/versioned through contracts.
- Subscribers may enrich behavior but not silently rewrite another framework's authority.
- Consequential events should be reconstructable from receipts/artifacts.

## Plugin model
Plugins let Project Jennifer grow without collapsing boundaries.

### Plugin families
- `engine`: alternate orchestration behaviors or Free Mode extensions;
- `validator`: CAG/validation/policy/integrity checks;
- `retriever`: governed RAG/source adapters;
- `metric`: deterministic or model-judge scoring;
- `simulator`: world-state, NPC, adversarial or balance simulators;
- `telemetry`: exporters, dashboards, sinks or trace stores.

### Plugin rules
- Plugins consume **Jennifer contracts**, not vendor contracts directly.
- External frameworks/models sit behind adapters.
- Plugin metadata includes stable name, kind and version.
- Plugin outputs remain observable through events, evidence and receipts.

## Stateless renter law

A renter may be sophisticated or stateful inside its own platform. It is **stateless relative to Jennifer authority** unless Jennifer explicitly admits state.

```text
Read Jennifer contracts
→ declare exact runtime capabilities
→ load required skills
→ receive governed context
→ execute bounded task
→ return result + evidence + receipt
→ do not self-promote memory
```

Explicit user model selection overrides automatic ranking when the runtime is available and no immutable privacy/tool boundary makes the execution impossible.

Unfamiliar behavior is not rejected solely for being unfamiliar. Within granted tools, a renter may fail and generate consequences; Jennifer observes, validates and receipts those consequences.

## Layered guardrails

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

Training promotion waits for human validation without erasing the renter's underlying execution evidence.

## Reproducibility principles
1. Seed stochastic paths when randomness is involved.
2. Version every contract that affects replay or scoring.
3. Persist manifests with dataset/scenario/runtime identifiers.
4. Separate deterministic and model-judge evaluation lanes.
5. Capture evidence, telemetry and receipts as artifacts.
6. Treat replayability as a product feature.
7. Benchmark exact model/runtime IDs rather than provider reputation.
8. Leave missing benchmark values `null`; never fabricate scores.

## Portable skills

Project Jennifer currently packages:

- `skills/cag-communication-attention/SKILL.md`;
- `skills/rag-governed-retrieval/SKILL.md`;
- `skills/jennifer-stateless-renter/SKILL.md`.

Provider adapters may translate delivery format, but they must preserve Jennifer authority, privacy, provenance and receipt semantics.

## What this foundation does not claim yet
- It does not replace the TypeScript product runtime.
- It does not invoke every named external renter directly.
- It does not claim production PostgreSQL/MongoDB/SQLite reconciliation is complete across all application paths.
- It does not claim provider capability based on marketing names alone.
- It does not claim live feedback updates foundation-model weights.

## Next implementation slices
1. Add concrete PostgreSQL/MongoDB retrieval adapters behind the new retrieval contract.
2. Connect SQLite offline command/replay stores to authoritative reconciliation.
3. Add exact-runtime manifests and benchmark packs for chosen renters.
4. Add renter adapters one provider at a time without changing skill semantics.
5. Integrate chosen/rejected preference export with human validation receipts.
6. Extend replay/evaluation around CAG communication-attention benchmarks.

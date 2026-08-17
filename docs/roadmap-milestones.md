# Redesign Roadmap Milestones

## Foundation checklist
- [x] Publish a multi-framework architecture RFC
- [x] Add a minimal Python boundary scaffold for Free Mode, contracts, plugins, validation, evaluation, simulation, and telemetry
- [x] Document adoption and migration principles
- [x] Point contributors to the new redesign foundation from the README

## ADR-0004 — CAG / RAG / Stateless Renter slice
- [x] Accept CAG + governed RAG + stateless renter routing under Free Mode
- [x] Add CAG event, assessment and receipt contracts
- [x] Add authority-tiered RAG query, evidence bundle and retrieval receipt contracts
- [x] Add exact-runtime stateless renter capability manifests and router
- [x] Add `retriever` plugin family
- [x] Implement CAG pre-inference, interruption gate and post-inference repair seam
- [x] Implement governed RAG ranking, deduplication, privacy suppression and provenance
- [x] Implement layered input/CAG/RAG/tool/output/memory/training guardrails
- [x] Add human-gated preference/training promotion contract
- [x] Add in-memory governance receipt sink
- [x] Add SQLite governance receipt persistence
- [x] Add SQLite offline pending/reconciliation store
- [x] Integrate CAG → RAG → renter routing → guardrails → receipts into Free Mode
- [x] Add portable CAG, RAG and stateless-renter `SKILL.md` packages with YAML metadata
- [x] Add JSON schemas for CAG receipts, EvidenceBundles, retrieval receipts and renter manifests
- [x] Add multi-engine skill distribution manifest and renter adapter boundary
- [x] Add deterministic unit/integration tests for CAG, RAG, renter routing, guardrails, receipts and SQLite edge continuity

## Validation + engine-qualification slice
- [x] Add GitHub Actions Python governance workflow across Python 3.11/3.12/3.13
- [x] Add compile/import smoke validation to the workflow
- [x] Add deterministic CAG/RAG benchmark harness
- [x] Add `cag-communication-attention-v1` benchmark pack
- [x] Add `rag-retrieval-grounding-v1` benchmark pack
- [x] Add SQLite → PostgreSQL-shaped authority → MongoDB-shaped projection reconciliation service
- [x] Receipt idempotent admission, authority conflicts and failed reconciliation attempts
- [x] Add exact-runtime `RenterExecutionAdapter` + registry seam
- [x] Define the provider/model Engine Qualification Gate
- [x] Observe completed CI runs and repair failing tests before claiming validation PASS
- [ ] Persist a machine-readable validation receipt from a completed CI result

## Next implementation milestones
- [x] Add production-capable PostgreSQL retrieval/authority adapter behind `RetrievalSource` / `GovernedAuthorityStore`
- [x] Add production-capable MongoDB adaptive-context retrieval/projection adapter behind `RetrievalSource` / `AdaptiveContextStore`, preserving `GSMB_MONGODB_ADAPTIVE_CONTEXT` authority tier 2
- [ ] Connect SQLite pending records to real PostgreSQL admission/conflict reconciliation
- [ ] Finalize the first exact-runtime engine worksheets with the owner
- [ ] Add exact-runtime manifests + benchmark receipts for the first chosen external renters
- [ ] Implement concrete provider adapters one at a time without changing CAG/RAG skill semantics
- [ ] Persist `RunContext` and `ReproducibilityManifest` artifacts for every run
- [ ] Add full event telemetry persistence (JSONL/SQLite) in addition to governance receipt storage
- [ ] Implement one deterministic output metric and one governed model-judge metric behind the evaluation interface
- [ ] Add one simulator for world-state or adversarial interaction playback
- [ ] Subscribe engine lifecycle events into durable telemetry sinks
- [ ] Document plugin authoring conventions and versioning rules
- [ ] Add chosen/rejected preference export with human-validation receipts

## Persistence proof boundary

Current adapter proof state is deliberately split by rail:

```text
PostgreSQL
= production-capable governed-authority/retrieval adapter merged to main

MongoDB
= production-capable adaptive-context/retrieval adapter on the current branch
  + live MongoDB 7 / PyMongo integration proof observed in CI

SQLite
= real local pending/replay store already coded and tested

Still unproven end-to-end
= one live reconciliation run that starts in SQLite,
  admits/compares against real PostgreSQL,
  projects into real MongoDB,
  then proves restart/replay semantics across all three rails
```

The MongoDB live proof explicitly verifies mutable replacement rather than immutable authority. Its text-retrieval proof uses unique non-overlapping tokens because MongoDB `$text` search is tokenized/stemmed; the receipt does not falsely claim exact-phrase or strict-AND semantics.

## Engine deep-dive order

```text
owner chooses exact runtime + target lane
→ complete engine worksheet
→ verify live provider/runtime capabilities
→ bind CAG/RAG/RIVM requirements
→ register bounded execution adapter
→ run common benchmark packs
→ record costs/latency/tool consequences
→ promote measured capability manifest
→ make runtime eligible for governed routing
```

See `docs/architecture/engine-qualification-gate.md`.

## Validation note

The repository now has observed GitHub Actions receipts across the normal CI and Python governance surfaces, plus live database proof workflows. Validation claims remain commit-scoped: a prior passing run is not automatically a receipt for a later head.

For the MongoDB adapter slice, the live MongoDB 7 workflow caught and preserved two real correction loops before passing:

1. an obsolete/nonexistent Mongo authority-tier assumption was corrected to the repository's current `GSMB_MONGODB_ADAPTIVE_CONTEXT = 2` contract;
2. an over-strong assumption about MongoDB `$text` search was replaced with a unique-token replacement proof that matches the engine's real tokenized search semantics.

```text
CODED               = YES
COMMITTED           = YES
UNIT TESTS          = PRESENT
LIVE MONGODB PROOF  = OBSERVED PASS ON PRE-ROADMAP-UPDATE HEAD
FINAL HEAD CI       = MUST PASS BEFORE PR PROMOTION
HOSTED PRODUCTION   = NOT CLAIMED
```

Do not convert an adapter/live-service CI proof into a hosted-production or deployment claim.

## Operating principle
Build the next phase in **thin vertical slices** so each milestone proves contracts, event flow, reproducibility and renter substitutability before broader implementation is added.

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

## Next implementation milestones
- [ ] Add production PostgreSQL retrieval/authority adapter behind `RetrievalSource`
- [ ] Add production MongoDB adaptive-context retrieval adapter behind `RetrievalSource`
- [ ] Connect SQLite pending records to real Postgres admission/conflict reconciliation
- [ ] Add exact-runtime manifests + benchmark receipts for the first chosen external renters
- [ ] Implement concrete provider adapters one at a time without changing skill semantics
- [ ] Persist `RunContext` and `ReproducibilityManifest` artifacts for every run
- [ ] Add full event telemetry persistence (JSONL/SQLite) in addition to governance receipt storage
- [ ] Define a benchmark scenario format for evaluation runs
- [ ] Implement one deterministic metric and one model-judge metric behind the evaluation interface
- [ ] Add one simulator for world-state or adversarial interaction playback
- [ ] Subscribe engine lifecycle events into durable telemetry sinks
- [ ] Document plugin authoring conventions and versioning rules
- [ ] Add chosen/rejected preference export with human-validation receipts
- [ ] Add communication-attention benchmark packs for CAG
- [ ] Add retrieval-grounding benchmark packs for RAG

## Validation note

The current environment could not clone the public GitHub repository through the local container network, so the newly added test suite is committed but has not been claimed as executed from that container. Repository-level CI or a connected local checkout should run:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

Do not convert an unexecuted test suite into a passing validation claim.

## Operating principle
Build the next phase in **thin vertical slices** so each milestone proves the contracts, event flow and reproducibility story before broader implementation is added.

# Redesign Roadmap Milestones

## Foundation checklist
- [x] Publish a multi-framework architecture RFC
- [x] Add a minimal Python boundary scaffold for Free Mode, contracts, plugins, validation, evaluation, simulation, and telemetry
- [x] Document adoption and migration principles
- [x] Point contributors to the new redesign foundation from the README

## Next implementation milestones
- [ ] Add `adapters/` for any external evaluation or simulation framework we decide to borrow from
- [ ] Implement a concrete validator chain with pass/fail/defer outcomes
- [ ] Persist `RunContext` and `ReproducibilityManifest` artifacts for every run
- [ ] Add a JSONL or SQLite telemetry sink for replayable event capture
- [ ] Define a benchmark scenario format for evaluation runs
- [ ] Implement one deterministic metric and one model-judge metric behind the new evaluation interface
- [ ] Add one simulator for world-state or adversarial interaction playback
- [ ] Wire engine lifecycle events through the shared event bus into telemetry
- [ ] Document plugin authoring conventions and versioning rules
- [ ] Add smoke tests for Python package imports and early lifecycle behavior

## Operating principle
Build the next phase in **thin vertical slices** so each milestone proves the contracts, event flow, and reproducibility story before broader implementation is added.

# Architecture RFC: Free Mode Multi-Framework Foundation

## Status
- Proposed
- Scope: additive scaffolding only
- Repository impact: documentation + Python package boundaries

## Why this RFC exists
Project Jennifer already describes a governance-first, validation-aware runtime. This RFC adds a **clean-room redesign foundation** for the next phase: a validation-focused, multi-framework architecture where **Free Mode** is the main engine and supporting frameworks supply validation, evaluation, simulation, and telemetry.

The goal is to adopt the parts of proven evaluation frameworks that strengthen our system design without importing their identity, assumptions, or domain model.

## Primary design goals
1. Keep **Free Mode** as the user-facing orchestration engine.
2. Separate support concerns into explicit frameworks with stable contracts.
3. Use a shared **event bus spine** instead of tight framework coupling.
4. Make runs reproducible through manifests, seeds, versioned contracts, and artifacts.
5. Support a plugin model so new mechanics, validators, metrics, and simulators can be added safely.

## Framework map

| Framework | Role | Initial boundary |
|---|---|---|
| Core Free Mode engine | Main orchestration loop, world decisions, user-facing execution | `project_jennifer/core` |
| Validation framework | Rule checks, safety checks, consistency checks, anti-cheat/integrity gates | `project_jennifer/validation` |
| Evaluation framework | Offline scoring, regression tracking, benchmark runs, release quality signals | `project_jennifer/evaluation` |
| Simulation framework | Stress tests, adversarial exercises, scenario playback, balance experiments | `project_jennifer/simulation` |
| Telemetry/analytics framework | Event collection, behavior analytics, replay trails, dashboards, sinks | `project_jennifer/telemetry` |
| Shared contracts | Event envelopes, run manifests, artifact references, versioned execution context | `project_jennifer/contracts` |
| Plugin model | Runtime extension point for framework capabilities | `project_jennifer/plugins` |

## Control flow at a glance
```text
User / Scenario
   ↓
Free Mode Engine
   ├─ emits run.started
   ├─ requests validation
   ├─ requests simulation when needed
   ├─ records evaluation when a benchmark lane is active
   └─ emits run.completed
            ↓
      Telemetry sinks + run artifacts
```

## Shared contracts + event bus spine
The shared contracts package is the system boundary that every framework must respect.

### Required shared concepts
- **RunContext**: stable identity for a run
- **ReproducibilityManifest**: seed, dataset version, runtime version, contract version
- **RunArtifact**: link to durable outputs such as traces, reports, telemetry, or replays
- **EventEnvelope**: versioned event wrapper for framework-to-framework communication

### Event bus rules
- Frameworks publish domain-relevant events instead of calling each other directly.
- Event names must be stable and versioned through contracts.
- Subscribers may enrich behavior, but not silently mutate another framework’s internal state.
- Every event that influences scoring or game state should be replayable from stored artifacts.

## Plugin model
Plugins let Project Jennifer grow without collapsing boundaries.

### Plugin families
- `engine`: alternate orchestration behaviors or Free Mode extensions
- `validator`: policy, safety, integrity, and consistency checks
- `metric`: deterministic or model-judge scoring
- `simulator`: world-state, NPC, adversarial, or balance simulators
- `telemetry`: exporters, dashboards, sinks, or trace stores

### Plugin rules
- Plugins consume **our** contracts, not third-party contracts directly.
- External frameworks should be wrapped behind adapters before plugin registration.
- Plugin metadata should include a stable name, kind, and version.
- Plugin outputs must be observable through events and artifacts.

## Reproducibility principles
1. **Seed every stochastic path** when randomness is involved.
2. **Version every contract** that can affect replay or scoring.
3. **Persist run manifests** with dataset/scenario versions.
4. **Separate deterministic and model-judge evaluation lanes** so confidence is interpretable.
5. **Capture telemetry as artifacts** so results can be audited later.
6. **Treat replayability as a product feature**, not a testing afterthought.

## What this RFC does not do yet
- Replace the current TypeScript implementation.
- Choose a single storage backend or queue technology.
- Implement a production event bus.
- Add a full benchmark runner.
- Commit to any external framework API as a core dependency.

## Immediate adoption pattern
Use the new Python scaffold as a **boundary map**:
- document new interfaces first,
- prototype framework logic behind those interfaces,
- add adapters only after internal contracts are stable,
- move implementation depth in small vertical slices.

## Next implementation slice
1. Create an adapter layer for external evaluation/reference frameworks.
2. Add a concrete validator chain and event replay sink.
3. Introduce scenario packs plus dataset version metadata.
4. Run dual-lane validation/evaluation on a small sample workflow.

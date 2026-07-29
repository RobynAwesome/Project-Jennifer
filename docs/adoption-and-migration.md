# Adoption and Migration Guide

## Intent
Project Jennifer should **adopt patterns, not identity** from mature evaluation frameworks. We want the proven mechanics that improve rigor, observability, and reproducibility, while keeping Jennifer-specific concepts, governance priorities, and game-mechanics goals as the source of truth.

## Patterns to adopt

### 1. Task and scenario abstractions
Adopt:
- scenario identifiers
- structured input/output contracts
- artifact-per-run discipline
- benchmark/evaluation separation from live runtime behavior

Use in Jennifer for:
- Free Mode test scenarios
- validation challenge packs
- world-state replay cases

### 2. Runner lifecycle patterns
Adopt the lifecycle shape:
- setup
- execute
- validate
- evaluate
- report
- replay

Keep Jennifer-specific decisions in:
- governance gating
- state transitions
- world simulation hooks
- human-centered response shaping

### 3. Metric interfaces
Adopt:
- deterministic metrics
- model-judge metrics behind explicit interfaces
- aggregate score composition
- metric version tracking

Do not adopt:
- opaque scoring that cannot be replayed or audited

### 4. Artifact logging
Adopt:
- trace artifacts
- structured reports
- event history
- reproducibility manifests

Jennifer-specific extension:
- game integrity logs
- anti-cheat traces
- NPC/world-state replay artifacts

### 5. Plugin architecture
Adopt:
- pluggable validators
- pluggable metrics
- pluggable simulators
- pluggable telemetry sinks

Keep domain-specific:
- district/world semantics
- Jennifer personas
- Free Mode progression rules
- governance and collective-ingress semantics

## What should remain domain-specific
The following should stay owned by Project Jennifer and should not be inherited from any external framework:
- the definition of **Free Mode**
- runtime governance semantics
- validation thresholds and escalation policies
- simulation goals for NPCs, districts, and world balance
- telemetry dimensions tied to user trust, progression, and behavior
- any branded vocabulary that is part of Jennifer’s product identity

## Migration posture
We should migrate by **wrapping** external concepts, not by letting them become our internal schema.

### Rule 1: internal contracts first
Every integration must map into `project_jennifer/contracts`.

### Rule 2: adapters at the edge
If an external framework is used, translate it through an adapter or plugin boundary.

### Rule 3: keep live runtime separate from benchmark runtime
Evaluation logic should inform Free Mode, not control it directly.

### Rule 4: prototype in small slices
Prefer one vertical slice end-to-end:
- one run context
- one validator
- one metric
- one simulator
- one telemetry sink

## Suggested migration phases

### Phase 0 — foundation
- publish architecture RFC
- publish migration guide
- add skeletal contracts and interfaces
- align README/navigation

### Phase 1 — validation-first slice
- implement validator chain
- emit validation events
- persist run manifests and validation artifacts
- define pass/fail/defer semantics

### Phase 2 — evaluation lane
- add deterministic regression metrics
- add benchmark scenario format
- compare runs over time

### Phase 3 — simulation lane
- add scenario playback and adversarial simulation
- connect simulation outputs to validation/evaluation

### Phase 4 — telemetry lane
- persist event streams
- create analytics views for balancing and trust
- support replay and operator auditability

## Decision filter for future imports
When evaluating a pattern from an external framework, ask:
1. Does it improve validation rigor?
2. Does it preserve Jennifer’s domain ownership?
3. Can it be expressed through our contracts?
4. Can it be replayed and audited?
5. Does it support multiple frameworks instead of locking us into one engine?

If the answer to any of these is "no," adapt it further or reject it.

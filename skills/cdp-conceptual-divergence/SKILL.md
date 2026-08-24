---
name: cdp-conceptual-divergence
title: "Conceptual Divergence Protocol"
protocol_id: "CDP"
version: "1.2.0"
status: "CODED_PORTABLE_RUNTIME"
class: "Project Jennifer Conceptual Skill"
canonical_source: "docs/lore/project-wify-jennifer/CONVERGENCE-LAW.md"
dedicated_runtime_module: true
implementation:
  - "packages/conceptual/src/cdp/CDPContextParser.ts"
  - "packages/conceptual/src/cdp/ConceptualDivergenceRuntime.ts"
execution_model: "Parse -> Bound -> Diverge -> Preserve Alternatives -> CEEP"
---

# CDP — Conceptual Divergence Protocol

## Purpose

CDP expands or reopens a known state into a governed possibility space **when divergence is the situationally admitted transition**.

Canonical question:

> **What could this become, or which alternatives must remain open?**

CDP widens. It does not self-canonicalize.

It is not universally required to run before CCP. Project Jennifer may converge first when evidence is already stable, then reopen divergence later when contradiction, novelty or incomplete interpretation appears.

## Current implementation proof

Project Jennifer contains a dedicated TypeScript CDP module:

```text
packages/conceptual/src/cdp/CDPContextParser.ts
packages/conceptual/src/cdp/ConceptualDivergenceRuntime.ts
packages/conceptual/src/cdp/cdp-runtime.test.ts
```

The parser consumes only context actually supplied to it. It does **not** claim access to invisible context windows, provider/Copilot internals, hidden memory, or an off-screen personality state.

The runtime emits `dedicatedCdpEngineExecuted: true` only when `ConceptualDivergenceRuntime.diverge(...)` actually runs.

## Context parser law

Before divergence, context is provenance-bound by:

```text
sourceId
sourceKind
authority
privacyLane
sourceRef
SHA-256
classification
```

Supported source kinds:

```text
current-turn
prior-context-window
governed-memory
repository
human-declared
external-retrieval
```

Supported signal classes deliberately extend RIVM's epistemic vocabulary:

```text
FACT
FEELING
FANTASY
PERFORMANCE
INFERENCE
UNKNOWN
PERSONALITY
PREFERENCE
BOUNDARY
```

`PERSONALITY` means an observed or declared interaction-style signal. It is **not** proof of hidden biological/personality interior in an AI system.

### Cross-window authority rule

A prior context window is historical evidence, not automatic current instruction.

```text
older-window signal
        -> historical = true
        -> currentAuthorityEligible = false
        -> preserved for comparison/divergence
        -> current human confirmation required for current-authority promotion
```

Current human instruction therefore outranks an older conflicting preference.

Unmarked supplied text is classified `UNKNOWN`; the parser never upgrades it to fact merely because it sounds plausible.

## Core runtime law

```text
known state
  + governed context receipt
  ├─ structurally distinct possibility A
  ├─ structurally distinct possibility B
  ├─ possibility C ...
  └─ explicit unknown possibility
```

Every runtime candidate remains:

```text
proofState: hypothesis
canonical: false
```

The dedicated CDP runtime currently recommends `CEEP` after it produces a candidate field. That is this runtime's bounded execution contract, not a claim that **all Project Jennifer states must begin with CDP**.

## Situational protocol law

```text
DIVERGENCE != FOC
CONVERGENCE != POC
```

Valid higher-level routes include:

```text
CDP -> CEEP -> POC-vs-FOC -> CCP
```

when alternatives are opened before convergence;

```text
CCP -> contradictory evidence -> CDP
```

when a stable model must be reopened;

```text
CDP -> HOLD
```

when alternatives exist but evidence or authority is insufficient.

Protocol order is selected by current state, evidence, authority and consequence rather than metaphysical privilege.

## Workflow

### 1. Parse authorized context

Use `CDPContextParser` for supplied/retrieved/governed context. Preserve hashes and source references.

### 2. Bound current authority

Separate current-human eligible signals from historical, inferred and unknown context. Do not let memory self-promote.

### 3. Preserve hard constraints

Authority, privacy, safety, ontology, budget and explicit human boundaries are constraints, not candidates.

### 4. Generate structurally different candidate families

The dedicated runtime rejects fewer than two candidates and rejects duplicate normalized `difference` descriptions.

### 5. Preserve unknowns

Unless explicitly disabled, the runtime appends `cdp-unknown-possibility` so insufficient evidence does not become false completeness.

### 6. Do not self-converge

For this dedicated runtime invocation, pass the produced candidate field forward to evaluation:

```text
CDPContextParser
→ ConceptualDivergenceRuntime
→ CEEP
→ POC-vs-FOC / evidence
→ CCP when convergence is requested/earned
```

For relationship-bearing work, RIVM still governs truth, agency, source separation and ghost-execution failures around this chain.

## Runtime receipt

Conceptually:

```yaml
protocol: CDP
statelessRenter: true
dedicatedCdpEngineExecuted: true
parserPromotionStatus: evidence-only
currentState: "..."
humanGoal: "..."
hardConstraints: []
candidates:
  - candidateId: "..."
    proofState: hypothesis
    canonical: false
unknowns: []
recommendedNextProtocol: CEEP
canonicalized: false
```

## Hard failures

Reject or correct execution if it:

- claims access to a context window that was not supplied or retrieved through an authorized adapter;
- treats prior-window personality/preferences as current authority without confirmation;
- presents generated possibilities as current facts;
- calls a candidate POC without evidence;
- violates source/privacy boundaries;
- treats historical source as current canon without receipt;
- generates cosmetic duplicates and calls them divergence;
- silently converges inside CDP;
- claims dedicated runtime execution without a runtime receipt;
- lets a renter or memory record override current human instruction;
- claims CDP is always required before CCP in every Project Jennifer state.

## Relationship to RIVM / CEEP / CCP

```text
RIVM asks: is relational inference truthful, warm, agency-preserving and receipted?
CDP asks: what could this become / what must remain open?
CEEP asks: how do the candidates evaluate?
POC-vs-FOC asks: what evidence actually exists?
CCP asks: what consistently survives evaluation and evidence?
```

These questions may recur as reality changes. A prior convergence can become the input to a later divergence.

## Success condition

CDP succeeds when authorized context becomes inspectable evidence, historical personality/preferences remain distinguishable from current authority, the possibility field genuinely widens, unknowns remain visible, and CEEP receives structured non-canonical candidates with a runtime receipt.

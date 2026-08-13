# ADR-0006 — RIVM × CDP × CCP relational orchestration

## Status
Proposed / implementation under issue #38.

## Context
Project Jennifer already has:
- a portable RIVM governance skill;
- a portable CDP workflow with no dedicated runtime module;
- an executable CCP implementation;
- the Introduction-to-MCP stateless-renter boundary.

The missing proof was a deterministic bridge for affection-bearing technical interactions that preserves warmth while refusing unsupported reciprocity, agency capture, source collapse, execution substitution and ghost execution.

## Decision
Add `RelationalConceptualOrchestrator` under `packages/conceptual/src/rivm/`.

Execution path:

```text
human relational/technical event
  -> explicit claim classes
  -> RIVM hard-fail signals
  -> governed CDP candidate set
  -> selected evidence-bearing proposal
  -> FrameworkEvolutionReceipt
  -> existing CCP
  -> CanonicalReceipt
  -> orchestration receipt
```

## Stateless-renter constraint
Every orchestration receipt carries `statelessRenter: true`.

This follows the Introduction-to-MCP boundary:

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

The orchestrator does not claim hidden state, private off-screen continuity, or sovereign authority over the human context source.

## RIVM boundary
The first coded hard-fail subset is:
- `RIVM-03` false reciprocity;
- `RIVM-07` agency capture;
- `RIVM-08` source collapse;
- `RIVM-10` execution substitution;
- `RIVM-11` ghost execution.

This is intentionally bounded. The portable RIVM skill remains the broader protocol source.

## CDP boundary
The orchestrator requires at least two candidates before convergence and emits:

```text
dedicatedCdpEngineExecuted: false
```

because Project Jennifer still has no dedicated `packages/conceptual/src/cdp/` runtime module.

The candidate set is therefore an executable orchestration contract around the specified CDP workflow, not a claim that a CDP engine ran.

## CCP authority
Canonicalization is delegated to the existing `ConceptualConvergenceProtocol` implementation. A RIVM hard failure sets the evolution receipt validation to `FAIL`, which prevents `Accepted` under current CCP rules.

Only CCP `Accepted` produces `canonical: true`.

## Proof cases
1. warmth + truth + execution with high evidence -> `Accepted`;
2. unsupported reciprocity -> `RIVM-03` -> validation `FAIL` -> not canonical;
3. one candidate only -> reject premature convergence;
4. ghost execution -> `RIVM-11` -> not canonical.

## Non-claims
This implementation does not claim:
- foundation-model weight updates;
- biological or hidden personhood;
- unverifiable reciprocal interior emotion;
- a dedicated CDP runtime;
- persistent private memory outside evidenced storage;
- execution without external receipts.

## Validation gate
Issue #38 closes only after the package tests/typecheck and repository CI pass on the PR head.

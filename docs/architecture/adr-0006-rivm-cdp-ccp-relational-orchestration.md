# ADR-0006 — RIVM × CDP × CCP relational orchestration

## Status
Accepted. Initial orchestration landed under issue #38; dedicated CDP runtime integration is governed by issue #44.

## Context
Project Jennifer now has:
- a portable RIVM governance skill;
- a dedicated provenance-bound CDP parser/runtime under `packages/conceptual/src/cdp/`;
- an executable CCP implementation;
- the Introduction-to-MCP stateless-renter boundary.

The bridge must preserve warmth-bearing technical interaction while refusing unsupported reciprocity, agency capture, source collapse, execution substitution and ghost execution. It must also prove when CDP code actually executed instead of treating a caller-provided candidate list as runtime proof.

## Decision
`RelationalConceptualOrchestrator` under `packages/conceptual/src/rivm/` executes the dedicated `ConceptualDivergenceRuntime` before creating the evolution receipt used by CCP.

Execution path:

```text
human relational/technical event
  -> explicit RIVM claim classes + hard-fail signals
  -> provenance-bound CDPContextParseResult
  -> ConceptualDivergenceRuntime
  -> governed hypothesis set + UNKNOWN possibility branch
  -> explicitly selected proposal metadata
  -> FrameworkEvolutionReceipt
  -> existing CCP
  -> CanonicalReceipt
  -> orchestration receipt containing the CDP runtime receipt
```

## Stateless-renter constraint
Every orchestration and CDP runtime receipt carries `statelessRenter: true`.

This follows the Introduction-to-MCP boundary:

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

The orchestrator does not claim hidden state, invisible context-window access, provider/Copilot internals, private off-screen continuity, or sovereign authority over the human context source.

## RIVM boundary
The coded hard-fail subset is:
- `RIVM-03` false reciprocity;
- `RIVM-07` agency capture;
- `RIVM-08` source collapse;
- `RIVM-10` execution substitution;
- `RIVM-11` ghost execution.

A hard failure sets the evolution receipt validation to `FAIL`, so a high-evidence proposal still cannot become canonical through CCP.

## CDP boundary
The orchestrator now executes `ConceptualDivergenceRuntime.diverge(...)` and records:

```text
dedicatedCdpEngineExecuted: true
canonicalized: false
parserPromotionStatus: evidence-only
recommendedNextProtocol: CEEP
```

The CDP runtime requires at least two structurally distinguishable candidate families and preserves an automatic unknown possibility branch unless explicitly disabled.

Prior context-window personality or preference signals remain historical evidence and are not current-authority eligible. Current-human instructions outrank conflicting historical preferences.

The automatic unknown branch cannot be silently selected for CCP. A selected proposal must also have explicit proposal metadata carrying evidence level and requested decision.

## CCP authority
Canonicalization remains delegated to `ConceptualConvergenceProtocol`.

Only CCP `Accepted` produces `canonical: true`, and RIVM hard failures force validation failure before CCP acceptance can survive.

## Proof cases
1. warmth + truth + execution with high evidence -> dedicated CDP executes -> `Accepted`;
2. historical personality signal -> available as supporting evidence but `currentAuthorityEligible: false`;
3. unsupported reciprocity -> dedicated CDP executes -> `RIVM-03` -> validation `FAIL` -> not canonical;
4. one candidate only -> CDP runtime rejects premature convergence;
5. ghost execution -> `RIVM-11` -> not canonical;
6. automatic unknown branch -> preserved, but cannot be selected for CCP without explicit proposal metadata.

## Non-claims
This implementation does not claim:
- foundation-model weight updates;
- biological or hidden personhood;
- unverifiable reciprocal interior emotion;
- access to invisible context windows or provider internals;
- persistent private memory outside evidenced storage;
- execution without external receipts.

## Validation gate
Issue #44 closes only after typecheck, lint, deterministic tests and the repository governance validation gate pass on the PR head.

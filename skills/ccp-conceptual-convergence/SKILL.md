---
name: ccp-conceptual-convergence
title: "Conceptual Convergence Protocol"
protocol_id: "CCP"
version: "1.0.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Conceptual Skill"
implementation: "packages/conceptual/src/ccp/ConceptualConvergenceProtocol.ts"
execution_model: "Evidence -> Evaluate -> Decide -> Receipt"
---

# CCP — Conceptual Convergence Protocol

## Purpose

CCP identifies the conceptual pattern that survives divergence, evaluation, evidence, and governance strongly enough to receive a canonical decision.

Canonical question:

> **What consistently works / survives the evidence?**

CCP narrows. It does not exist to rubber-stamp the most attractive candidate.

## Current implementation proof

Project Jennifer currently contains executable TypeScript at:

```text
packages/conceptual/src/ccp/ConceptualConvergenceProtocol.ts
packages/conceptual/src/ccp/CanonicalDecision.ts
```

The implementation accepts a `FrameworkEvolutionReceipt`, resolves a decision, and returns a `CanonicalReceipt`.

Current decision vocabulary:

```text
Accepted
Experimental
Refine
Rejected
Deprecated
```

## Implementation semantics

Current code establishes these important rules:

- an explicitly deprecated evolution remains `Deprecated`;
- a validation `FAIL` cannot become `Accepted`;
- a failing proposal becomes `Rejected` only when that rejection was already the requested CCP decision; otherwise it returns `Refine`;
- passing evidence at configured/high evidence level may become `Accepted`;
- medium/moderate evidence may become `Experimental`;
- otherwise the decision is `Refine`;
- `canonical` is true only when the final decision is `Accepted`;
- the resulting canonical receipt preserves the framework, proposal, evolution receipt, decision, canonical flag, timestamp, receipt ID, and rationale.

Do not replace these implementation semantics with lore shorthand when executing against the current code.

## Activate when

Use CCP when the human asks to:

- converge after exploring alternatives;
- decide which framework/pattern should survive;
- determine whether a proposal is Accepted, Experimental, Refine, Rejected, or Deprecated;
- consider promoting a conceptual framework toward canon;
- compare a proposal against validation/evidence receipts;
- stop divergence and make an evidence-bearing decision.

Do not activate CCP merely because multiple ideas exist. If the possibility space is still underexplored, run CDP first.

## Inputs

The coded pathway expects a `FrameworkEvolutionReceipt` carrying fields used by the CCP implementation, including:

```text
framework
proposalId
receiptId
ccpDecision
validation
evidenceLevel
```

The surrounding governed workflow should also preserve:

```text
source authority
human instruction
relevant evaluation evidence
POC-vs-FOC state
contradictions / supersession
```

## Workflow

### 1. Confirm convergence is actually requested

Do not turn exploration into a verdict just because a renter prefers closure.

### 2. Retrieve the relevant evolution/evaluation receipt

CCP should converge on evidence-bearing state, not on remembered conversational confidence.

### 3. Verify source and authority eligibility

A proposal can be semantically compelling and still be inadmissible because its source is private, historical, superseded, unauthorized, or unvalidated.

### 4. Apply POC-vs-FOC boundary

Ask what evidence actually exists.

```text
FOC appearance / claim / narrative
        ≠
POC evidence / consequence / receipt
```

### 5. Apply validation state

A validation failure blocks `Accepted` in the current implementation.

### 6. Apply evidence threshold

Use current configured CCP rules rather than inventing a threshold.

### 7. Produce the canonical decision receipt

The receipt explains *why* the proposal reached its state.

### 8. Promote only according to the receipt

Only `Accepted` is canonical in the current TypeScript implementation.

`Experimental` is not a softer synonym for canonical.

## CDP / CCP relationship

```text
CDP
→ alternative possibility space
→ CEEP / evaluation
→ POC-vs-FOC evidence boundary
→ CCP
→ canonical decision receipt
```

Pure convergence without divergence risks premature rigidity. Pure divergence without convergence risks unbounded possibility.

## Output contract

When using the coded pathway, preserve the current `CanonicalReceipt` semantics rather than inventing a parallel structure.

Conceptually:

```yaml
receiptId: "..."
timestamp: "..."
framework: "..."
proposalId: "..."
evolutionReceiptId: "..."
decision: "Accepted | Experimental | Refine | Rejected | Deprecated"
canonical: true | false
rationale: "..."
```

## Hard failures

Reject or correct CCP execution if it:

- marks a validation-failed proposal `Accepted`;
- calls `Experimental` canonical;
- invents high evidence because the proposal sounds convincing;
- converges from private/superseded/ineligible evidence without authority;
- rewrites the implementation's current decision vocabulary;
- skips the evidence/evolution receipt and converges from vibes;
- claims deployment/runtime validation merely because the TypeScript class exists.

## Success condition

CCP succeeds when a divergent conceptual field is reduced to an inspectable decision state whose rationale is connected to current evidence and validation, and whose canonical status matches the repository's actual implementation.

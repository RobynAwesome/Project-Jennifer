---
name: ccp-conceptual-convergence
title: "Conceptual Convergence Protocol"
protocol_id: "CCP"
version: "1.1.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Conceptual Skill"
implementation: "packages/conceptual/src/ccp/ConceptualConvergenceProtocol.ts + packages/conceptual/src/ccp/CCPPkaAdmissionParser.ts"
execution_model: "Evidence -> Evaluate -> Decide -> Receipt -> PKA Admission Candidate"
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
packages/conceptual/src/ccp/CCPPkaAdmissionParser.ts
```

The convergence implementation accepts a `FrameworkEvolutionReceipt`, resolves a decision, and returns a `CanonicalReceipt`. The admission parser separately converts only evidence-bearing canonical `Accepted` receipts into deterministic PKA request candidates.

Current decision vocabulary:

```text
Accepted
Experimental
Refine
Rejected
Deprecated
```

## Implementation semantics

Current code establishes these rules:

- an explicitly deprecated evolution remains `Deprecated`;
- a validation `FAIL` cannot become `Accepted`;
- a failing proposal becomes `Rejected` only when that rejection was already the requested CCP decision; otherwise it returns `Refine`;
- passing evidence at configured/high evidence level may become `Accepted`;
- medium/moderate evidence may become `Experimental`;
- otherwise the decision is `Refine`;
- `canonical` is true only when the final decision is `Accepted`;
- the resulting canonical receipt preserves framework, proposal, evolution receipt, decision, canonical flag, timestamp, receipt ID, and rationale.

CCP and PKA are separate boundaries:

```text
CCP Accepted + canonical
        !=
PKA admitted
        !=
downstream execution authority
```

Do not replace these implementation semantics with lore shorthand when executing against current code.

## Activate when

Use CCP when the human asks to converge after alternatives, decide which framework should survive, determine a canonical decision, consider conceptual promotion toward canon, compare a proposal against validation/evidence receipts, or stop divergence with an evidence-bearing decision.

Do not activate CCP merely because multiple ideas exist. If the possibility space is still underexplored, run CDP first.

## Inputs

The coded convergence pathway expects a `FrameworkEvolutionReceipt` carrying:

```text
framework
proposalId
receiptId
ccpDecision
validation
evidenceLevel
```

The surrounding governed workflow should also preserve source authority, current human instruction, relevant evaluation evidence, POC-vs-FOC state, and contradictions/supersession.

For PKA admission parsing, additionally preserve SHA-256 content hashes for both the `CanonicalReceipt` and its referenced `FrameworkEvolutionReceipt`.

## Workflow

### 1. Confirm convergence is actually requested

Do not turn exploration into a verdict just because a renter prefers closure.

### 2. Retrieve the relevant evolution/evaluation receipt

CCP should converge on evidence-bearing state, not remembered conversational confidence.

### 3. Verify source and authority eligibility

A proposal can be semantically compelling and still be inadmissible because its source is private, historical, superseded, unauthorized, or unvalidated.

### 4. Apply POC-vs-FOC boundary

```text
FOC appearance / claim / narrative
        !=
POC evidence / consequence / receipt
```

### 5. Apply validation state

A validation failure blocks `Accepted` in the current implementation.

### 6. Apply evidence threshold

Use current configured CCP rules rather than inventing a threshold.

### 7. Produce the canonical decision receipt

The receipt explains why the proposal reached its state.

### 8. Promote only according to the receipt

Only `Accepted` is canonical in the current TypeScript implementation. `Experimental` is not a softer synonym for canonical.

### 9. Parse CCP acceptance toward PKA

When and only when:

```text
decision == Accepted
AND canonical == true
AND CCP receipt has sha256 evidence
AND evolution receipt has sha256 evidence
```

call `CCPPkaAdmissionParser`.

The parser emits a deterministic action identity:

```text
ccp-pka:<caller-repository>:<ccp-receipt-id>
```

and a non-executing PKA request candidate with:

```text
claim: ccp_acceptance_admission = candidate
action: governance.evaluate_ccp_acceptance
consequential: false
reversible: true
```

Any non-Accepted/canonical state or missing receipt hash returns `hold` before PKA.

The parser does not claim the external PKA Engine ran. Execution requires a separately proven engine-access/runtime receipt.

## CDP / CCP / PKA relationship

```text
CDP
→ alternative possibility space
→ CEEP / evaluation
→ POC-vs-FOC evidence boundary
→ CCP
→ CanonicalReceipt
→ CCPPkaAdmissionParser
→ PKA request candidate OR HOLD
→ actual PKA Engine only when runtime access is proven
→ downstream consumer gate remains separate
```

Pure convergence without divergence risks premature rigidity. Pure divergence without convergence risks unbounded possibility. CCP acceptance without a separate admission boundary risks false authority promotion.

## Output contract

The current `CanonicalReceipt` remains:

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

The admission parser then returns either:

```text
eligible + deterministic PKA request candidate
```

or:

```text
hold + reason
```

## Hard failures

Reject or correct CCP execution if it:

- marks a validation-failed proposal `Accepted`;
- calls `Experimental` canonical;
- invents high evidence because the proposal sounds convincing;
- converges from private/superseded/ineligible evidence without authority;
- rewrites the implementation's current decision vocabulary;
- skips the evidence/evolution receipt and converges from vibes;
- sends a non-Accepted or unhashed receipt into PKA admission;
- claims PKA executed because a request candidate exists;
- treats PKA proposal state as downstream mutation authority;
- claims deployment/runtime validation merely because the TypeScript classes exist.

## Success condition

CCP succeeds when a divergent conceptual field is reduced to an inspectable decision state whose rationale is connected to current evidence and validation, whose canonical status matches current code, and whose `Accepted` state crosses into PKA only through an explicit hashed admission candidate rather than hidden authority promotion.

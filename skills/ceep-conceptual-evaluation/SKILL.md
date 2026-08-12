---
name: ceep-conceptual-evaluation
title: "Conceptual Evaluation Engine Workflow"
protocol_id: "CEEP"
version: "1.0.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Conceptual Skill"
implementation: "packages/conceptual/src/ceep/ConceptualEvaluationEngine.ts"
execution_model: "Subject -> Evaluator -> Evaluation Receipt -> Framework Evolution Receipt"
---

# CEEP — Conceptual Evaluation Engine

## Purpose

Use CEEP to evaluate a conceptual subject against a declared framework, supporting receipts, and evaluation rules before CCP convergence.

Current code exists at `packages/conceptual/src/ceep/`.

## Current implementation semantics

`ConceptualEvaluationEngine` requires at least one `SubjectEvaluator`. The current engine uses the first evaluator, evaluates the subject, then emits both:

```text
EvaluationReceipt
FrameworkEvolutionReceipt
```

The current evaluation receipt uses:

```text
pocScore >= 0.6 → PASS
pocScore < 0.6  → FAIL
```

The framework-evolution receipt starts non-canonical and sets its initial CCP decision to:

```text
PASS → Refine
FAIL → Rejected
```

That does not mean a passing concept is automatically canonical. CCP remains the convergence layer.

## Inputs

Current coded input includes:

```text
subject
framework
supportingReceipts
evaluationRules
contributor
proposalId?      
evidenceLevel?
discussionHistory?
```

## Recommended conceptual path

```text
CDP candidates
→ CEEP evaluation
→ POC-vs-FOC evaluator / other SubjectEvaluator
→ EvaluationReceipt
→ FrameworkEvolutionReceipt
→ CCP
```

## Hard failures

Do not:

- evaluate without at least one evaluator;
- invent supporting receipts;
- treat `PASS` as `Accepted`/canonical;
- silently alter the current `0.6` PASS threshold when claiming execution against current code;
- present a framework-evolution receipt as proof of deployment;
- erase FOC risks because the overall score passes.

## Success condition

CEEP succeeds when a conceptual subject receives an inspectable evaluation plus a framework-evolution receipt that CCP can consume without losing evidence, risk, contributor, or discussion lineage.

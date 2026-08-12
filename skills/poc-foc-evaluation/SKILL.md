---
name: poc-foc-evaluation
title: "POC vs FOC Evaluation"
version: "1.1.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Conceptual Skill"
implementation: "packages/conceptual/src/pocvsfoc/POCvsFOCEvaluator.ts"
execution_model: "Evidence Signals -> FOC Risks -> POC Score -> Recommendations"
---

# POC vs FOC Evaluation

## Purpose

Use this skill when Project Jennifer must distinguish evidence-bearing **Proof/Point of Concept** from unsupported, fragile, fabricated, drifting, incomplete, or otherwise risky **FOC** states before convergence or canon promotion.

Current code exists under `packages/conceptual/src/pocvsfoc/`.

## Current coded behavior

`POCvsFOCEvaluator` implements the CEEP `SubjectEvaluator` contract. It derives risk from current framework/evidence signals and emits:

```text
pocScore
strengths
focRisks
recommendations
```

Current FOC risk categories include:

```text
FakeOfConcept
FreedomOfConcept
FabricationOfConcept
FailureOfConcept
FrameworkOfConcept
FractionOfConcept
FallacyOfConcept
FringementOfConcept
FrictionOfConcept
FragmentationOfConcept
FinancialOfConcept
FragilityOfConcept
FandomOfConcept
```

These are current repository categories. Do not silently replace them when claiming execution against the current evaluator.

## KPGS VOC registry integration

When the task depends on the **authoritative KPGS POC branch or FOC-G## operational groups**, route through [`../poc-foc-registry-parser/SKILL.md`](../poc-foc-registry-parser/SKILL.md) first.

```text
Introduction-to-MCP VOC source
→ poc-foc-registry-parser
→ VOCRegistry + VOCParseReceipt
→ poc-foc-evaluation when conceptual scoring is required
→ CEEP / CCP when promotion or convergence is required
```

Keep the namespaces separate:

```text
Project Jennifer FOCType risk category ≠ Introduction-to-MCP FOC-G## operational group
```

The parser preserves the immune-system registry. This evaluator scores conceptual FOC risk. One does not silently replace the other.

## Governing rule

```text
repetition ≠ proof
confidence ≠ proof
visual polish ≠ proof
memory ≠ proof
claim ≠ consequence

POC requires inspectable evidence appropriate to the claim.
```

## Recommended path

```text
candidate / framework
→ supporting receipts + implementation evidence
→ POC-vs-FOC evaluation
→ CEEP receipt
→ CCP convergence if requested
```

## Hard failures

Do not:

- call a proposal POC because it is persuasive;
- fabricate receipts, implementations, tests, deployments, users, revenue, or runtime behavior;
- erase high FOC risks merely because the aggregate POC score is acceptable;
- treat a POC score as universal scientific truth outside the evaluator's declared framework;
- confuse coded implementation with production deployment;
- collapse `FOC-G##` source groups into the evaluator's semantic FOC categories.

## Success condition

The skill succeeds when the concept's evidence strengths and FOC risks are both visible, unsupported claims remain downgraded, and the next governance/convergence layer receives an honest evidence state rather than a flattering label.

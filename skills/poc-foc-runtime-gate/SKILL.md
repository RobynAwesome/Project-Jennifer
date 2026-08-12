---
name: poc-foc-runtime-gate
title: "POC / FOC Runtime Gate"
version: "1.0.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Runtime Governance Skill"
implementation:
  - "packages/conceptual/src/pocvsfoc/POCFOCActionEvaluator.ts"
  - "packages/runtime/src/poc-foc-runtime-gate.ts"
execution_model: "Evaluate -> Match FOC-G## -> Decide -> Verify Evidence -> Memory Receipt -> Mutate or Block"
---

# POC / FOC Runtime Gate

## Purpose

Use this skill when a proposed Project Jennifer action can change consequential state and must pass the KPGS POC/FOC membrane before mutation.

This skill connects three already-separated responsibilities without collapsing their authority:

```text
Kopano-Labs/Introduction-to-MCP VOC source
        ↓
POCFOCActionEvaluator
        ↓
shared POCFOCActionEvaluation
        ↓
POCFOCRuntimeGate
        ↓
MemoryReceiptEngine
        ↓
state mutation OR no mutation
```

## Authority model

```text
Introduction-to-MCP
= source authority for VOC / POC / operational FOC-G## semantics

Project Jennifer conceptual package
= evaluator implementation authority

Project Jennifer runtime package
= state-mutation gate implementation authority

Memory Receipt Engine
= receipt/admission authority for persisted evidence state

AwesomeSkills
= discovery/distribution surface only
```

AwesomeSkills discovery does not promote a skill into KPGS constitutional authority.

## Namespace law

Keep these distinct:

```text
Project Jennifer FOCType
≠
KPGS operational FOC-G## group
≠
Memory Receipt admission state
```

A semantic risk category such as `FragilityOfConcept` is not automatically `FOC-G03 SemanticDriftLeak`. An operational group is matched only from the parsed VOC registry through evidence/signals supplied to the evaluator.

## Runtime decision contract

`POCFOCActionEvaluator` emits:

```text
decision: ACCEPT | HOLD | REJECT
pocScore
reasons[]
matchedFOCGroups[]
sourceAuthority
sourceRef
```

The runtime gate then independently checks:

- evidence references exist;
- evidence was verified;
- the proposed action is bound to that evidence;
- the Memory Receipt is admitted.

Only then may the mutation callback run.

## Execution flow

```text
1. Load current parsed VOCRegistry.
2. Build SubjectEvaluationInput for the proposed action.
3. Supply observed operational FOC signals, if any.
4. Run POCFOCActionEvaluator.
5. Pass the resulting shared evaluation to POCFOCRuntimeGate.
6. Supply evidence refs + retrieval validation trace.
7. Let the gate issue the Memory Receipt.
8. Execute mutation only when decision = ACCEPT and receipt admission = admitted.
9. Preserve the receipt and result as the action evidence.
```

## Non-mutation law

```text
REJECT → mutation callback MUST NOT execute
HOLD   → mutation callback MUST NOT execute
ACCEPT + non-admitted receipt → mutation callback MUST NOT execute
ACCEPT + admitted receipt → mutation callback MAY execute once
```

The gate also keeps an in-memory action-ID receipt so repeating the same action ID cannot execute the mutation twice inside the same runtime instance.

## FOC-G## handling

Current parsed operational groups come from `Kopano-Labs/Introduction-to-MCP/poc-vs-foc/`.

Do not invent a future group ID. If a signal does not match the current parsed registry, record it as unresolved evidence and let the originating VOC growth protocol govern any new FOC-G## registration.

## Memory Receipt requirement

Every gate decision issues a Memory Receipt:

```text
ACCEPT → proof-of-concept receipt
HOLD   → maybe / deferred receipt
REJECT → failure-of-concept receipt
```

A failed action is therefore still remembered as evidence. The system must not erase failure simply because it did not mutate world state.

## POC boundary

The skill proves that Project Jennifer can:

- consume an explicit conceptual POC/FOC decision;
- preserve parsed operational FOC group identity;
- block state mutation on HOLD/REJECT;
- verify evidence admission before mutation;
- issue a Memory Receipt for every decision;
- prevent duplicate action IDs from mutating twice in one runtime instance.

It does **not** prove production persistence across process restarts until a durable action-idempotency store and durable Memory Receipt adapter are wired.

## Hard failures

Do not:

- mutate before the receipt is admitted;
- convert an operational FOC match into a warning while still executing the action;
- invent FOC-G## identities;
- let AwesomeSkills or any community registry override KPGS source authority;
- treat an in-memory idempotency map as production durability;
- claim PostgreSQL/MongoDB persistence unless the durable adapters actually executed.

## Success condition

The skill succeeds when one proposed consequential action can travel from POC/FOC evaluation through Memory Receipt admission and only an admitted `ACCEPT` path can change runtime state, while HOLD/REJECT paths remain visible as receipts instead of disappearing.

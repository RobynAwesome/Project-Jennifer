---
name: poc-foc-runtime-gate
title: "POC / FOC Runtime Gate"
version: "1.1.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Runtime Governance Skill"
implementation:
  - "packages/conceptual/src/pocvsfoc/POCFOCActionEvaluator.ts"
  - "packages/runtime/src/poc-foc-runtime-gate.ts"
  - "packages/runtime/src/runtime-gate-ledger.ts"
  - "packages/runtime/src/postgres-runtime-gate-ledger.ts"
  - "infra/postgres/migrations/0002_memory_receipt_ark.sql"
execution_model: "Evaluate -> Match FOC-G## -> Verify Evidence -> Memory Receipt -> Reserve Action -> Mutate or Block -> Persist Outcome"
---

# POC / FOC Runtime Gate

## Purpose

Use this skill when a proposed Project Jennifer action can change consequential state and must pass the KPGS POC/FOC membrane before mutation.

This skill connects separated responsibilities without collapsing their authority:

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
IRuntimeGateLedger
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
= state-mutation gate + action-ledger contract authority

Memory Receipt Engine
= receipt/admission authority for evidence state

PostgreSQL adapter
= durable action/receipt persistence implementation

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
≠
runtime ledger execution state
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
- the Memory Receipt is admitted;
- the action ID can be atomically reserved in the configured ledger.

Only the runtime that creates an admitted `ACCEPT` reservation may invoke the mutation callback.

## Execution flow

```text
1. Load current parsed VOCRegistry.
2. Build SubjectEvaluationInput for the proposed action.
3. Supply observed operational FOC signals, if any.
4. Run POCFOCActionEvaluator.
5. Pass the resulting shared evaluation to POCFOCRuntimeGate.
6. Supply evidence refs + retrieval validation trace.
7. Let the gate issue the Memory Receipt.
8. Reserve actionId + receipt in IRuntimeGateLedger.
9. If reservation already exists, return it and DO NOT replay mutation.
10. Execute mutation only when decision = ACCEPT, receipt = admitted, and this runtime won the reservation.
11. Persist `applied` or `failed` outcome.
```

## Non-mutation law

```text
REJECT → BLOCKED → mutation MUST NOT execute
HOLD   → BLOCKED → mutation MUST NOT execute
ACCEPT + non-admitted receipt → BLOCKED → mutation MUST NOT execute
ACCEPT + admitted receipt + lost reservation → mutation MUST NOT execute
PREPARED found after runtime recreation → HOLD → mutation MUST NOT replay
FAILED found after runtime recreation → HOLD → mutation MUST NOT replay
ACCEPT + admitted receipt + reservation won → mutation MAY execute
```

## Durable Memory Receipt Ark

`IRuntimeGateLedger` defines the persistence boundary.

Current adapters:

```text
InMemoryRuntimeGateLedger
= deterministic POC/test adapter
= can prove behavior across recreated gate objects
= NOT process-durable

PostgresRuntimeGateLedger
= PostgreSQL repository adapter
= unique action_id reservation
= persists Memory Receipt + decision + execution state
= requires a concrete governed PostgresPoolPort binding before live runtime proof
```

The PostgreSQL schema is `infra/postgres/migrations/0002_memory_receipt_ark.sql`.

### Ledger states

```text
blocked
= HOLD/REJECT/non-admitted; no mutation

prepared
= reservation won, outcome not yet confirmed

applied
= mutation returned successfully

failed
= mutation threw and failure was recorded
```

A `prepared` record after restart is intentionally **not** treated as success or failure. It becomes `HOLD` pending reconciliation.

```text
uncertainty + governance
≠ fabricated certainty
≠ automatic replay
```

## Exactly-once proof boundary

Durable reservation prevents another runtime from casually replaying the same action ID, but it does **not** prove exactly-once semantics for arbitrary callbacks or external side effects.

There remains a crash window between:

```text
reservation
→ mutation execution
→ persisted applied/failed outcome
```

Exactly-once authoritative state requires the domain mutation and receipt/idempotency/event/outbox writes to share one PostgreSQL transaction, or a governed outbox/saga protocol appropriate to the external system.

See `docs/architecture/adr-0007-durable-memory-receipt-ark.md`.

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

A blocked or failed action remains evidence. The system must not erase failure simply because it did not mutate world state.

## POC boundary

The current code proves that Project Jennifer can:

- consume an explicit conceptual POC/FOC decision;
- preserve parsed operational FOC group identity;
- block state mutation on HOLD/REJECT;
- verify evidence admission before mutation;
- issue a Memory Receipt for every decision;
- reserve action IDs before mutation through a domain-owned ledger;
- prevent a recreated runtime from replaying an already applied action when it can read the same ledger;
- hold a previously prepared/uncertain action instead of guessing and replaying it;
- map the same contract onto a PostgreSQL repository adapter and migration.

It does **not** yet prove a real process restart backed by a live PostgreSQL driver/pool. The concrete driver binding, deterministic migration execution, live DB health/telemetry, and transaction-bound domain mutation remain separate evidence gates.

## Hard failures

Do not:

- mutate before the receipt is admitted and the action reservation is won;
- convert an operational FOC match into a warning while still executing the action;
- invent FOC-G## identities;
- let AwesomeSkills or any community registry override KPGS source authority;
- treat an in-memory ledger as production durability;
- replay `prepared` or `failed` actions automatically;
- claim exactly-once semantics for arbitrary callbacks;
- claim live PostgreSQL persistence until the concrete driver/pool and migrations actually execute.

## Success condition

The skill succeeds when one proposed consequential action can travel from POC/FOC evaluation through Memory Receipt admission and action reservation, only the winning admitted `ACCEPT` path can execute mutation, and every blocked/applied/failed/uncertain path remains inspectable rather than being erased or fabricated.

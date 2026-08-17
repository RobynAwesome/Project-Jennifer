# ADR-0007: Durable Memory Receipt Ark and Runtime Action Reservations

- **Status:** Accepted for POC
- **Date:** 2026-08-17
- **Decision owner:** Kholofelo Robyn Rababalela / Kopano Labs
- **Depends on:** ADR-0003 MERN Adaptive Core + PERN Relationship Validation Spine

## Context

Project Jennifer already issues evidence-bound Memory Receipts and uses the POC/FOC runtime gate to prevent rejected or unverified actions from mutating state. The first implementation kept action idempotency and issued receipts inside process memory.

That proves the governance sequence, but it does not survive a real Node.js process restart. A second runtime could otherwise receive the same action ID without seeing the first runtime's local map.

The next POC must preserve the receipt and replay boundary outside the runtime process without pretending that arbitrary external side effects can be made exactly-once by a database record alone.

## Decision

PostgreSQL becomes the authoritative durable ledger for POC/FOC runtime actions and their Memory Receipts.

```text
conceptual evaluation
        ↓
runtime evidence checks
        ↓
Memory Receipt issued
        ↓
ATOMIC ACTION RESERVATION
PostgreSQL:
  memory_receipts
  runtime_gate_actions(action_id UNIQUE)
        ↓
ACCEPT + admitted + reservation won
        ↓
mutation may execute
        ↓
ledger state → applied | failed
```

A competing runtime that loses the `action_id` reservation must load the existing record and must not execute the mutation callback.

## Ledger states

### `blocked`

The effective runtime decision is `HOLD` or `REJECT`. The receipt remains durable evidence and mutation is forbidden.

### `prepared`

The action passed admission and the runtime won the durable reservation, but the mutation outcome has not yet been durably recorded.

This is an **uncertainty state**, not permission to replay.

If a runtime restarts and finds `prepared`, Project Jennifer returns `HOLD` and requires reconciliation rather than executing the callback again.

### `applied`

The mutation returned successfully and the ledger records `mutation_applied = TRUE`.

A later runtime returns the existing receipt/result as a duplicate and does not replay the mutation.

### `failed`

The mutation attempt threw and the failure was recorded. Automatic replay is blocked until a governed recovery policy decides what to do next.

## Why reservation happens before mutation

Persisting only after the mutation creates a duplicate-execution window:

```text
mutation succeeds
→ process dies before idempotency record is written
→ retry appears new
→ mutation executes twice
```

Project Jennifer therefore reserves first.

The trade-off is a different crash window:

```text
reservation succeeds
→ mutation may or may not execute
→ process dies before outcome is recorded
→ state remains PREPARED
```

KPGS chooses **visible uncertainty over fabricated certainty**. The runtime does not guess whether the mutation happened and does not silently replay it.

## Exactly-once boundary

This ADR does **not** claim exactly-once semantics for arbitrary callbacks, network calls, media generation, wallet operations, or other external side effects.

Exactly-once authoritative state requires the domain mutation and the action/receipt record to share one PostgreSQL transaction, or requires a governed outbox/saga protocol appropriate to the external system.

Therefore:

```text
current POC
= durable reservation + replay prevention + explicit uncertainty

next transaction POC
= domain mutation + event + receipt + idempotency + outbox
  inside one PostgreSQL transaction
```

## PostgreSQL schema

`infra/postgres/migrations/0002_memory_receipt_ark.sql` adds:

- `memory_receipts`
- `runtime_gate_actions`
- unique `action_id`
- receipt foreign key
- constrained ledger states
- mutation/state consistency checks
- state/receipt indexes

The full receipt remains stored as JSONB while high-value governance fields remain queryable as columns.

## Runtime contracts

`IRuntimeGateLedger` is the domain-owned persistence boundary.

Adapters:

- `InMemoryRuntimeGateLedger` — deterministic POC/test adapter only
- `PostgresRuntimeGateLedger` — PostgreSQL repository adapter through a structural query/pool port

The runtime package does not import a concrete PostgreSQL vendor client. Driver selection, pool construction, credentials, migration execution and health checks remain an infrastructure/application boundary.

## Failure model

1. Duplicate `action_id` reservation → existing authoritative record returned; mutation not executed.
2. PostgreSQL reservation failure → mutation not executed.
3. `HOLD`/`REJECT` → `blocked` receipt persisted; mutation not executed.
4. Mutation throws → ledger attempts `failed`; original failure is preserved.
5. Mutation succeeds but result metadata cannot be JSON-serialized → durable state may still become `applied`; output replay metadata is optional.
6. Process disappears in the prepared window → next runtime returns `HOLD`; no automatic replay.

## POC evidence

Repository tests prove at the contract layer that:

- a successful action is reserved before mutation;
- a duplicate action does not execute twice;
- a newly created runtime sharing the same ledger returns the original applied receipt/result;
- a pre-existing `prepared` action becomes `HOLD` after runtime recreation and is not replayed;
- operational FOC rejection and unverified evidence still block mutation.

These tests validate domain behavior. They do not prove a live PostgreSQL connection until the concrete driver/pool and migration runner execute against the Docker PostgreSQL service.

## Invariants

1. A Memory Receipt is evidence, not manufactured permanent truth.
2. `action_id` uniqueness is the replay authority for this gate.
3. No `HOLD`, `REJECT`, `blocked`, `prepared`, or `failed` record authorizes automatic mutation.
4. A process restart may not erase the action/receipt boundary once a durable adapter is active.
5. Uncertainty must remain visible as uncertainty.
6. AwesomeSkills may distribute this workflow but does not become KPGS semantic authority.
7. PostgreSQL is authoritative for durable action/receipt state; adaptive projections remain rebuildable.

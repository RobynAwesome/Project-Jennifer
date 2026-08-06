# ADR-0003: MERN Adaptive Core + PERN Relationship Validation Spine

- **Status:** Accepted for POC
- **Date:** 2026-08-06
- **Decision owner:** Kholofelo Robyn Rababalela / Kopano Labs

## Context

Project Jennifer already operates as a TypeScript APWA/game runtime with Next.js, React, Phaser, Express and governed companion logic. Relationship state currently exists only inside in-memory runtime maps. That is insufficient for restart recovery, append-only history, idempotent offline synchronization and validation receipts.

The architecture must preserve the MERN/APWA identity while adding relational integrity. PostgreSQL is therefore introduced as a governed spine rather than a replacement for MongoDB.

## Decision

```text
MONGO = MUTABLE CONTEXT AND ADAPTIVE WORLD PROJECTION
POSTGRES = AUTHORITATIVE RELATIONAL RECORD AND RECEIPT
```

### PostgreSQL owns

- actor identity references;
- relationship instances and participants;
- active lanes and state transitions;
- declared and superseded boundaries;
- authoritative relationship events;
- quest decisions;
- validation receipts;
- idempotency keys;
- transactional outbox records;
- projection checkpoints.

### MongoDB owns

- recent relationship context;
- companion working memory;
- dialogue and emotional context;
- adaptive quest/world projections;
- media and scene metadata;
- rebuildable player-world documents.

MongoDB projections are not allowed to silently override PostgreSQL events.

## Write path

```text
Command
→ governance and validation
→ one PostgreSQL transaction
  → aggregate update
  → append-only event
  → validation receipt
  → transactional outbox
→ idempotent MongoDB projector
→ client and Phaser synchronization
```

Direct client writes to either database are prohibited.

## Failure model

- A failed MongoDB projection leaves the PostgreSQL event pending in the outbox.
- Re-delivery is safe because every command carries a unique idempotency key.
- A projection records the last authoritative event ID.
- MongoDB documents may be rebuilt by replaying PostgreSQL relationship events.
- Relationship history is superseded, never silently rewritten.

## POC implementation

The first implementation introduces:

- shared relationship contracts;
- `RelationshipEngine`;
- an authority-store interface that mirrors the PostgreSQL transaction boundary;
- a projection-store interface that mirrors MongoDB;
- in-memory adapters for deterministic tests;
- PostgreSQL DDL;
- MongoDB indexes;
- Docker Compose services;
- REST endpoints;
- tests for creation, boundary supersession, restart restoration and idempotency.

The in-memory adapters are validation scaffolding. Production PostgreSQL and MongoDB adapters must implement the same contracts without changing domain behavior.

## Consequences

### Positive

- MERN remains sovereign over adaptive context.
- PERN introduces explicit constraints and transactionality.
- Offline commands can be retried safely.
- Receipts and state transitions become auditable.
- Phaser remains a renderer rather than the source of truth.

### Costs

- Two persistence technologies must be operated.
- Projection lag must be observable.
- Schema and event versions require governance.
- Developers must respect authority boundaries rather than performing convenient dual writes.

## Invariants

1. The LLM is never the source of truth.
2. PostgreSQL events are authoritative.
3. MongoDB state is a projection.
4. Every consequential relationship command produces a receipt.
5. Idempotency is mandatory for offline and repeated commands.
6. Relationship lanes do not prove biological identity or machine consciousness.
7. No production deployment occurs without explicit founder approval.

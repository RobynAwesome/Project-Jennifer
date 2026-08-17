# PERN Adoption Roadmap — Project Jennifer

Project Jennifer uses a deliberate **MERN adaptive core + PERN relational validation spine**:

- **MongoDB** — adaptive relationship projections
- **Express** — `apps/api`
- **React** — `apps/web` through Next.js
- **Node.js** — repository and API runtime
- **PostgreSQL** — durable relational truth, receipts, constraints, idempotency, and validation history

The PostgreSQL layer is introduced incrementally so persistence cannot bypass Project Jennifer governance, validation, memory, or telemetry rules.

## Phase 1 — Foundation Contract ✅

Implemented:

- `PostgresConnectionConfig`
- environment parsing and validation
- explicit status for every PERN layer
- a database activation gate
- `.env.example`
- PERN status exposed through `/health`

## Phase 2 — Relationship Persistence Scaffold ✅

Implemented:

- `docker-compose.persistence.yml`
- `infra/postgres/migrations/0001_relationship_spine.sql`
- `infra/mongodb/0001_relationship_projections.js`
- `docs/architecture/adr-0003-mern-pern-relationship-spine.md`
- the relationship engine and deterministic in-memory authority/projection tests in `packages/runtime`

This establishes PostgreSQL as the governed relational spine while MongoDB carries adaptive projections.

## Phase 3 — Driver, Repository Adapter, and Memory Receipt Ark 🚧

### Completed at repository-contract level

- `IRuntimeGateLedger` domain-owned persistence contract
- `InMemoryRuntimeGateLedger` deterministic validation adapter
- `PostgresRuntimeGateLedger` PostgreSQL repository adapter behind a structural pool/query port
- `infra/postgres/migrations/0002_memory_receipt_ark.sql`
- durable action reservation model with unique `action_id`
- persisted Memory Receipt + runtime decision boundary
- explicit `blocked | prepared | applied | failed` action states
- runtime recreation tests proving applied actions are not replayed
- prepared/crash-window tests proving uncertainty becomes `HOLD`, not automatic replay
- `docs/architecture/adr-0007-durable-memory-receipt-ark.md`

### Remaining before PostgreSQL becomes `active`

1. Select and install the concrete governed PostgreSQL driver.
2. Bind the driver to the `PostgresPoolPort` at the application/infrastructure boundary.
3. Add a deterministic migration runner for existing as well as fresh databases.
4. Add connection pool health checks and telemetry for connect, query, transaction, failure, and retry events.
5. Run migrations from zero against the Docker PostgreSQL service in CI or a governed integration lane.
6. Transaction-bind authoritative domain mutations to their idempotency/event/receipt/outbox writes where exactly-once state semantics are required.
7. Validate explicit database-failure and recovery behaviour.

No domain may write directly to PostgreSQL. Every write must pass through a domain-owned repository or adapter contract.

## Phase 4 — NCMP and Waifu Forge Persistence

Persist the next bounded domains only after the Phase 3 database activation gate is proven:

1. NCMP concept candidates and transition receipts
2. Project Waifu Forge asset-manifest records
3. storyline quest state and scene progression
4. governance and validation receipts

NCMP mutation endpoints remain intentionally disabled until this persistence gate exists. The read-only canonical discovery endpoint is available at `GET /api/ncmp`.

## Phase 5 — React Storyline Interface

Add the first Project Waifu Forge interface:

- visual asset gallery
- storyline quest timeline
- canon-candidate review
- NCMP receipt viewer
- governed scene-state transitions

## Phase 6 — Runtime Validation

The PERN spine is considered operational only after:

- local PostgreSQL starts reproducibly
- migrations run from zero and against an existing schema
- API typechecks and boots with the concrete database adapter
- a consequential receipted action survives a real process restart
- React reads real governed data
- offline or database-failure behaviour is explicit
- no direct ungoverned database writes exist

## Code Locations

- `packages/shared/src/pern-foundation.ts`
- `packages/runtime/src/runtime-gate-ledger.ts`
- `packages/runtime/src/postgres-runtime-gate-ledger.ts`
- `infra/postgres/migrations/0001_relationship_spine.sql`
- `infra/postgres/migrations/0002_memory_receipt_ark.sql`
- `docs/architecture/adr-0003-mern-pern-relationship-spine.md`
- `docs/architecture/adr-0007-durable-memory-receipt-ark.md`
- `docker-compose.persistence.yml`

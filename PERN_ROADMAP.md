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

### Repository-contract proof ✅

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

### Live PostgreSQL proof gate ✅

- `PostgresMigrationRunner` sorts migrations, serializes execution with a PostgreSQL advisory lock, and pins every applied migration by checksum.
- checksum drift fails closed instead of silently mutating an existing schema.
- repository migrations retain their standalone `BEGIN`/`COMMIT` wrappers while the runner unwraps only that outer boundary and commits the migration body with its migration receipt atomically.
- `.github/workflows/postgres-live-proof.yml` starts PostgreSQL 16 and proves the runtime repository against a real database.
- `tools/prove-postgres-runtime-gate.mjs` proves fresh migration, deterministic second-run no-op, concurrent action reservation, persisted `applied` state, real pool recreation, replay suppression, and checksum-drift rejection.

### API relationship-authority activation gate ✅

The governed relationship domain now crosses the real application boundary without promoting PostgreSQL globally before the remaining proof gates are complete:

- `apps/api` owns the concrete `pg` driver; runtime/domain packages remain vendor-driver-free.
- `JENNIFER_PERSISTENCE_MODE=in-memory|postgres` makes authority selection explicit.
- production refuses to start when persistence mode is omitted.
- PostgreSQL mode validates configuration, checks connectivity, executes checksum-pinned migrations, and fails startup instead of silently falling back to memory.
- `PostgresRelationshipAuthorityStore` transaction-binds relationship state, authoritative event, validation receipt, quest decision when present, and outbox evidence.
- a PostgreSQL advisory lock closes cross-process idempotency races before authoritative writes begin.
- the canonical `/api/runtime/relationships` router is dependency-injected from the persistence composition root.
- `/health` reports configured authority, durability, migration count, and live database reachability.
- connect/query/transaction/startup/shutdown/failure events emit governed telemetry without recording SQL bodies.
- graceful `SIGINT` / `SIGTERM` closes the HTTP server and PostgreSQL pool.
- `.github/workflows/postgres-api-authority-proof.yml` proves the application boundary against PostgreSQL 16.
- `tools/prove-postgres-api-authority.mjs` proves concurrent HTTP idempotency, one authoritative database event, process restart recovery, replay suppression, dead-database startup failure, and explicit production mode selection.

### API outage/recovery + single-authority proof gate 🚧

This gate is implementation-complete on its feature branch and MUST pass its live PostgreSQL proof before merge:

- PostgreSQL idle-pool errors have an explicit listener, preventing database disappearance from becoming an unhandled process-terminating event.
- `/health` records `ready → unavailable → ready` transitions without restarting Jennifer.
- transition telemetry emits `persistence.database-unavailable` and `persistence.database-recovered` only when readiness state changes.
- the superseded relationship handlers and private in-memory `RelationshipEngine` have been removed from `apps/api/src/routes/runtime.ts`.
- `apps/api/src/routes/relationships.ts` is therefore the single source-level relationship HTTP authority surface.
- `tools/prove-postgres-api-recovery.mjs` starts the compiled API, creates authoritative state, physically stops the PostgreSQL service container, proves the same API process stays alive and reports HTTP 503, proves relationship reads fail rather than fall back to memory, restarts PostgreSQL, proves the same process becomes ready again, verifies transition telemetry, reloads the original relationship, and proves replay remains suppressed after recovery.
- the recovery proof is executed inside `.github/workflows/postgres-api-authority-proof.yml` using the real PostgreSQL 16 service container ID.

The branch must not merge unless normal CI, governance validation, the runtime PostgreSQL proof, and the API authority/recovery proof are green. Once merged, this gate is considered accepted.

### Remaining before PostgreSQL becomes globally `active`

1. Bind the rebuildable relationship projection path to governed MongoDB rather than process-local memory and prove projection rebuild from the PostgreSQL outbox.
2. Prove React reads governed persisted data through the API rather than fixture/process-local state.
3. Expand transactional authority only through domain-owned adapters for NCMP, Waifu Forge, governance, and validation receipts.

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
- the running API degrades and recovers across a live PostgreSQL outage
- React reads real governed data
- offline or database-failure behaviour is explicit
- no direct ungoverned database writes exist

## Code Locations

- `packages/shared/src/pern-foundation.ts`
- `packages/runtime/src/runtime-gate-ledger.ts`
- `packages/runtime/src/postgres-runtime-gate-ledger.ts`
- `packages/runtime/src/postgres-migration-runner.ts`
- `packages/runtime/src/postgres-relationship-authority-store.ts`
- `apps/api/src/persistence.ts`
- `apps/api/src/routes/relationships.ts`
- `apps/api/src/routes/runtime.ts`
- `apps/api/src/server.ts`
- `infra/postgres/migrations/0001_relationship_spine.sql`
- `infra/postgres/migrations/0002_memory_receipt_ark.sql`
- `tools/prove-postgres-runtime-gate.mjs`
- `tools/prove-postgres-api-authority.mjs`
- `tools/prove-postgres-api-recovery.mjs`
- `.github/workflows/postgres-live-proof.yml`
- `.github/workflows/postgres-api-authority-proof.yml`
- `docs/architecture/adr-0003-mern-pern-relationship-spine.md`
- `docs/architecture/adr-0007-durable-memory-receipt-ark.md`
- `docker-compose.persistence.yml`

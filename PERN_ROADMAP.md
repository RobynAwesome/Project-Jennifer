# PERN Adoption Roadmap — Project Jennifer

Project Jennifer uses a deliberate **MERN adaptive core + PERN relational validation spine**:

- **MongoDB** — adaptive, rebuildable relationship projections
- **Express** — `apps/api`
- **React** — `apps/web` through Next.js
- **Node.js** — repository and API runtime
- **PostgreSQL** — durable relational truth, receipts, constraints, idempotency, and validation history

The persistence layers are introduced incrementally so storage cannot bypass Project Jennifer governance, validation, memory, or telemetry rules.

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

PostgreSQL owns governed relational truth. MongoDB carries only adaptive projections that must be disposable and rebuildable from PostgreSQL evidence.

## Phase 3 — Driver, Repository Adapter, Memory Receipt Ark, and Relationship Persistence 🚧

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

- `apps/api` owns the concrete `pg` driver; runtime/domain packages remain vendor-driver-free.
- `JENNIFER_PERSISTENCE_MODE=in-memory|postgres` makes authority selection explicit.
- production refuses to start when persistence mode is omitted.
- PostgreSQL mode validates configuration, checks connectivity, executes checksum-pinned migrations, and fails startup instead of silently falling back to memory.
- `PostgresRelationshipAuthorityStore` transaction-binds relationship state, authoritative event, validation receipt, quest decision when present, and outbox evidence.
- a PostgreSQL advisory lock closes cross-process idempotency races before authoritative writes begin.
- `/api/runtime/relationships` is dependency-injected from the persistence composition root.
- `/health` reports configured authority, durability, migration count, and live database reachability.
- `.github/workflows/postgres-api-authority-proof.yml` proves the application boundary against PostgreSQL 16.
- `tools/prove-postgres-api-authority.mjs` proves concurrent HTTP idempotency, one authoritative database event, process restart recovery, replay suppression, dead-database startup failure, and explicit production mode selection.

### API outage/recovery + single-authority proof gate ✅

Accepted through PR #60:

- PostgreSQL idle-pool errors have an explicit listener, preventing database disappearance from becoming an unhandled process-terminating event.
- `/health` records `ready → unavailable → ready` transitions without restarting Jennifer.
- transition telemetry emits `persistence.database-unavailable` and `persistence.database-recovered` only when readiness state changes.
- superseded relationship handlers and the private in-memory `RelationshipEngine` were removed from `apps/api/src/routes/runtime.ts`.
- `apps/api/src/routes/relationships.ts` is the single source-level relationship HTTP authority surface.
- `tools/prove-postgres-api-recovery.mjs` physically stops and restarts the PostgreSQL 16 service, proves the same Jennifer process degrades and recovers, proves no memory fallback, verifies transition telemetry, reloads the original relationship, and preserves replay suppression.

### PostgreSQL → MongoDB adaptive projection rebuild gate ✅

Accepted through PR #61:

- `JENNIFER_PROJECTION_MODE=in-memory|mongodb` makes adaptive projection selection explicit and separate from authority selection.
- MongoDB projection mode is rejected unless PostgreSQL is the selected authority.
- `apps/api` owns the concrete `mongodb` driver; runtime/domain packages retain structural projection contracts.
- configured MongoDB participates in API readiness and governed shutdown.
- `MongoRelationshipProjectionStore` derives `projectionVersion` from the authoritative relationship version, not delivery-attempt count.
- projection timestamps derive from authoritative relationship timestamps so retry and rebuild converge deterministically.
- MongoDB writes use monotonic optimistic compare-and-swap semantics: newer versions may replace older versions, stale deliveries cannot regress state, same version/same event is a no-op, and same version/different event is a contradiction.
- MongoDB `_id` never crosses the relationship projection domain boundary.
- `PostgresRelationshipProjectionEvidenceStore` reads relationship IDs from PostgreSQL outbox history without changing `published_at` receipts.
- `RelationshipProjectionRebuilder` reconstructs each adaptive projection from its latest PostgreSQL authoritative snapshot and latest authoritative event.
- `POST /api/runtime/relationships/projections/rebuild` is available only when MongoDB projection mode is selected.
- `tools/prove-mongodb-projection-rebuild.mjs` proves normal projection, crash-window outbox replay idempotency, Mongo projection wipe without authority loss, full rebuild from PostgreSQL outbox evidence, repeated rebuild idempotency, and preserved authoritative replay suppression.
- `.github/workflows/mongodb-projection-rebuild-proof.yml` proved that contract against real PostgreSQL 16 and MongoDB 7 services.

### React persisted relationship read-through gate 🚧

Implementation-complete on its feature branch; this gate is **not accepted until its real Next.js + API + PostgreSQL 16 + MongoDB 7 proof is green**.

- `apps/web/src/lib/jennifer-api.ts` performs server-side cache-free reads of both `/health` and the canonical relationship API.
- production React read-through requires explicit `JENNIFER_API_URL` configuration.
- the web package contains no PostgreSQL or MongoDB driver; React does not reconstruct relationship truth locally.
- `/relationships` provides a server-rendered evidence gateway without client-owned relationship state.
- `/relationships/[relationshipId]` is `force-dynamic`, `revalidate = 0`, and renders the live authority mode, authority database state, relationship version, projection mode/state/version, participants, authoritative event/receipt IDs, and active boundary evidence.
- projection deletion is rendered explicitly as “authoritative PostgreSQL state available / adaptive projection absent” rather than replacing authority with a fixture.
- the home vertical slice links to the persistence evidence gateway without replacing the existing game experience.
- `tools/prove-react-persisted-readthrough.mjs` proves the rendered HTML changes from authoritative version 1 → 2 without rebuilding React, survives an API process restart, keeps rendering PostgreSQL authority after Mongo projection deletion, shows the rebuilt Mongo projection after governed rebuild, survives a React process restart, and preserves authoritative idempotency.
- `.github/workflows/react-persisted-readthrough-proof.yml` runs the compiled API and production Next.js server against real PostgreSQL 16 and MongoDB 7 services.

The branch must not merge unless normal CI, governance validation, all existing PostgreSQL/Mongo persistence proof lanes, and the React persisted read-through proof are green.

### Bounded relationship persistence promotion

Once the React read-through proof is accepted, the **relationship persistence slice** has evidence across authority, restart, outage/recovery, adaptive projection, rebuild, and React read-through and may be described as operational for that bounded domain.

That is not the same as declaring PostgreSQL globally active for all of Jennifer. Other domains remain behind their own domain-owned persistence gates.

### Remaining before PostgreSQL becomes globally `active`

1. Accept the React persisted relationship read-through proof and record the bounded relationship slice as operational.
2. Expand transactional authority only through domain-owned adapters for NCMP, Waifu Forge, governance, and validation receipts.
3. Require equivalent persistence/recovery/read-through receipts before those domains are promoted.

No domain may write directly to PostgreSQL. MongoDB may not become relationship authority. Every authoritative write must pass through a domain-owned PostgreSQL repository/adapter contract, and MongoDB relationship data must remain rebuildable from PostgreSQL evidence.

## Phase 4 — NCMP and Waifu Forge Persistence

Persist the next bounded domains only after the Phase 3 relationship persistence gate is proven:

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

The bounded relationship persistence slice is operational only after:

- local PostgreSQL starts reproducibly
- migrations run from zero and against an existing schema
- API typechecks and boots with the concrete database adapter
- a consequential receipted action survives a real process restart
- the running API degrades and recovers across a live PostgreSQL outage
- MongoDB adaptive projections can be wiped and rebuilt from PostgreSQL evidence
- React reads real governed persisted relationship data and reflects projection loss/rebuild
- offline or database-failure behaviour is explicit
- no direct ungoverned authoritative database writes exist

## Code Locations

- `packages/shared/src/pern-foundation.ts`
- `packages/runtime/src/runtime-gate-ledger.ts`
- `packages/runtime/src/postgres-runtime-gate-ledger.ts`
- `packages/runtime/src/postgres-migration-runner.ts`
- `packages/runtime/src/postgres-relationship-authority-store.ts`
- `packages/runtime/src/mongo-relationship-projection-store.ts`
- `packages/runtime/src/relationship-projection-rebuilder.ts`
- `apps/api/src/persistence.ts`
- `apps/api/src/mongo-projection.ts`
- `apps/api/src/routes/relationships.ts`
- `apps/api/src/routes/runtime.ts`
- `apps/api/src/server.ts`
- `apps/web/src/lib/jennifer-api.ts`
- `apps/web/src/app/relationships/page.tsx`
- `apps/web/src/app/relationships/[relationshipId]/page.tsx`
- `infra/postgres/migrations/0001_relationship_spine.sql`
- `infra/postgres/migrations/0002_memory_receipt_ark.sql`
- `infra/mongodb/0001_relationship_projections.js`
- `tools/prove-postgres-runtime-gate.mjs`
- `tools/prove-postgres-api-authority.mjs`
- `tools/prove-postgres-api-recovery.mjs`
- `tools/prove-mongodb-projection-rebuild.mjs`
- `tools/prove-react-persisted-readthrough.mjs`
- `.github/workflows/postgres-live-proof.yml`
- `.github/workflows/postgres-api-authority-proof.yml`
- `.github/workflows/mongodb-projection-rebuild-proof.yml`
- `.github/workflows/react-persisted-readthrough-proof.yml`
- `docs/architecture/adr-0003-mern-pern-relationship-spine.md`
- `docs/architecture/adr-0007-durable-memory-receipt-ark.md`
- `docker-compose.persistence.yml`

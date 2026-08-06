# PERN Adoption Roadmap — Project Jennifer

Project Jennifer now uses a deliberate **MERN adaptive core + PERN relational validation spine**:

- **MongoDB** — adaptive relationship projections
- **Express** — `apps/api`
- **React** — `apps/web` through Next.js
- **Node.js** — repository and API runtime
- **PostgreSQL** — durable relational truth, receipts, constraints, and validation history

The PostgreSQL layer is introduced incrementally so persistence cannot bypass Project Jennifer governance, validation, memory, or telemetry rules.

## Phase 1 — Foundation Contract ✅

Implemented in this branch:

- `PostgresConnectionConfig`
- environment parsing and validation
- explicit status for every PERN layer
- a database activation gate
- `.env.example`
- PERN status exposed through `/health`

## Phase 2 — Relationship Persistence Scaffold ✅

Already present after convergence with the latest `main` branch:

- `docker-compose.persistence.yml`
- `infra/postgres/migrations/0001_relationship_spine.sql`
- `infra/mongodb/0001_relationship_projections.js`
- `docs/architecture/adr-0003-mern-pern-relationship-spine.md`
- the relationship engine and tests in `packages/runtime`

This establishes PostgreSQL as the governed relational spine while MongoDB carries adaptive projections.

## Phase 3 — Driver and Repository Adapter

Next implementation gate:

1. Select and install the PostgreSQL driver.
2. Add a deterministic migration runner.
3. Add a connection pool and health check.
4. Implement domain-owned repository interfaces.
5. Emit telemetry for connect, query, transaction, failure, and retry events.
6. Validate local-first development and explicit database-failure behaviour.

No domain may write directly to PostgreSQL. Every write must pass through a domain-owned repository or adapter contract.

## Phase 4 — NCMP and Waifu Forge Persistence

Persist the next bounded domains:

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
- migrations run from zero
- API typechecks and boots
- React reads real governed data
- offline or database-failure behaviour is explicit
- no direct ungoverned database writes exist

## Code Locations

- `packages/shared/src/pern-foundation.ts`
- `infra/postgres/migrations/0001_relationship_spine.sql`
- `docker-compose.persistence.yml`
- `docs/architecture/adr-0003-mern-pern-relationship-spine.md`

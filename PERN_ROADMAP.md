# PERN Adoption Roadmap — Project Jennifer

Project Jennifer already runs three parts of PERN:

- **Express** — `apps/api`
- **React** — `apps/web` through Next.js
- **Node.js** — repository and API runtime

The missing governed layer is **PostgreSQL**. It will be introduced incrementally so persistence does not bypass Project Jennifer governance, validation, memory, or telemetry rules.

## Phase 1 — Foundation Contract ✅

This change introduces:

- `PostgresConnectionConfig`
- environment parsing and validation
- explicit status for every PERN layer
- a database activation gate
- `.env.example`

No database driver is installed in Phase 1. This prevents an unapproved schema or silent persistence path from becoming architectural fact.

## Phase 2 — PostgreSQL Adapter

Next implementation gate:

1. Approve the initial schema.
2. Select the driver and migration mechanism.
3. Add a storage adapter behind existing interfaces.
4. Add connection health checks.
5. Emit telemetry for connect, query, transaction, failure, and retry events.
6. Validate local-first development and offline degradation behaviour.

## Phase 3 — Governed Persistence

Persist the first bounded domains:

1. NCMP concept records and transition receipts
2. Project Waifu Forge asset manifest records
3. session and storyline quest state
4. governance and validation receipts

No domain may write directly to PostgreSQL. Every write must pass through a domain-owned repository or adapter contract.

## Phase 4 — Express API Integration

Expose bounded endpoints for:

- protocol registry queries
- asset catalogue reads
- storyline quest state
- governed state transitions

All write endpoints require validation and governance receipts.

## Phase 5 — React Storyline Interface

Add the first Project Waifu Forge interface:

- visual asset gallery
- storyline quest timeline
- canon-candidate review
- NCMP receipt viewer
- governed scene-state transitions

## Phase 6 — Runtime Validation

PERN is considered active only after:

- local PostgreSQL starts reproducibly
- migrations run from zero
- API typechecks and boots
- React reads real governed data
- offline or database-failure behaviour is explicit
- no direct ungoverned database writes exist

## Code Location

Phase 1 is implemented in `packages/shared/src/pern-foundation.ts` and exported by `@jennifer/shared`.

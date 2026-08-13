---
name: jennifer-telemetry-storage
description: Implement or inspect Project Jennifer telemetry, receipts, persistence rails, offline SQLite continuity, PostgreSQL authority state, MongoDB projections and reconciliation. Use whenever a task touches telemetry, storage, persistence, replay, reconciliation, migrations, receipt stores or event durability.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: telemetry-storage-reconciliation
  tags: [telemetry, receipts, postgres, mongodb, sqlite, reconciliation]
---

# Jennifer Telemetry + Storage

## Sources
- `packages/telemetry/`
- `packages/memory/`
- `project_jennifer/telemetry/`
- `project_jennifer/storage/`
- `infra/postgres/`
- `infra/mongodb/`
- `docker-compose.persistence.yml`

## Rail semantics
Preserve the current architecture distinction:

```text
PostgreSQL = governed relational / constitutional authority
MongoDB    = adaptive context and world projection
SQLite     = offline edge continuity and replay
```

Technical replication does not grant semantic equivalence.

## Workflow
1. Identify the authoritative event and expected durable outcome.
2. Select the correct persistence rail.
3. Record telemetry/receipt identifiers and provenance.
4. Reconcile projections against authoritative state rather than overwriting authority from a projection.
5. Test restart/offline/replay paths when applicable.
6. Expose conflicts; do not hide them with last-write-wins unless the contract explicitly says so.
7. Route resulting claims through validation.

## Output
Return event, storage rail, write/read/replay evidence, reconciliation decision, receipt IDs, conflicts and validation state.

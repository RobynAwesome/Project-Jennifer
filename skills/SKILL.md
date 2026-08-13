---
name: project-jennifer-skill-router
description: Project Jennifer specialist skill index. Use immediately after the root Project Jennifer skill to select the smallest repo-native skill set for the task instead of improvising generic agent behavior.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: skill-routing
  portable: true
  tags: [project-jennifer, router, skills, governance]
---

# Project Jennifer — Skill Router

## Routing rule

Load **only the skills required by the task**, but never omit governance that the task actually triggers.

| Task lane | Skill | Primary repository evidence |
|---|---|---|
| renter entry / capability declaration | `jennifer-stateless-renter` | `project_jennifer/core/renter_router.py`, `config/renters/` |
| communication relevance / interruption | `cag-communication-attention` | `project_jennifer/attention/cag.py`, CAG benchmarks |
| governed evidence retrieval | `rag-governed-retrieval` | `project_jennifer/retrieval/governed_rag.py` |
| consequential relational inference | `forge-rivm` | ADR-0005, source authority registry |
| authored relational expression | `authored-relational-attention` | skill schemas/examples |
| authority / permissions / source classes | `jennifer-authority-governance` | `packages/authority/`, `packages/governance/`, registry |
| Jennifer runtime / relationships / GSMB | `jennifer-runtime-memory` | `packages/runtime/`, `packages/memory/` |
| POC/FOC / validation / guardrails | `jennifer-validation-poc-foc` | `VALIDATION_POLICY.md`, validation packages/tests |
| CCP / CEEP / framework evaluation | `jennifer-conceptual-convergence` | `packages/conceptual/`, conceptual docs |
| companions / NPC behavior | `jennifer-companions-npcs` | companion docs, runtime and NPC packages |
| telemetry / receipts / persistence | `jennifer-telemetry-storage` | telemetry, storage, persistence infra |
| NCMP / MMAO / sessions | `jennifer-ncmp-mmao` | `NCMP.md`, `docs/mmao/`, shared NCMP contracts |
| web game / Phaser / API | `jennifer-game-web-api` | `apps/web/`, `apps/api/` |
| assets / lore / source manifests | `jennifer-assets-lore` | `assets/`, `docs/lore/`, source registry |
| tests / CI / benchmarks | `jennifer-ci-benchmarks` | `.github/workflows/`, `tests/`, `benchmarks/` |
| provider / partner adoption | `jennifer-adoption-provider-onboarding` | `skills/distribution/`, `config/renters/`, adoption docs |
| HUE / collective change / humanitarian lane | `jennifer-human-crisis-ingress` | `packages/hue/`, `packages/collective-ingress/`, `packages/crisis-connect/` |

## Mandatory composition examples

### Coding a game feature
`root → jennifer-stateless-renter → jennifer-game-web-api → jennifer-validation-poc-foc`

Add `jennifer-runtime-memory` if the feature changes persistent relationships/world state.

### Adding a new AI provider
`root → jennifer-stateless-renter → jennifer-adoption-provider-onboarding → cag → rag → jennifer-ci-benchmarks`

### Changing canon or visual assets
`root → jennifer-stateless-renter → jennifer-assets-lore → jennifer-authority-governance → jennifer-validation-poc-foc`

### Relational story/runtime work
`root → jennifer-stateless-renter → cag → forge-rivm → jennifer-runtime-memory → jennifer-validation-poc-foc`

### Architecture work
`root → jennifer-stateless-renter → jennifer-authority-governance → relevant domain skill → jennifer-validation-poc-foc → jennifer-ci-benchmarks`

## Anti-drift rules

- Do not substitute generic web/game/AI conventions for Jennifer contracts when a repo-specific skill exists.
- Do not treat every file returned by semantic search as equally authoritative.
- Do not load private/intimate material into public/work/research lanes without explicit authorization.
- Do not promote renter output into canon or governed memory automatically.
- Do not declare POC without evidence.
- Do not silently repair FOC by rewriting history; receipt the failure and then repair explicitly.

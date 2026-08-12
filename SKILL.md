---
name: project-jennifer
description: Project Jennifer repository-native operating skill. Use this whenever an agent, coding assistant, stateless renter, contributor, reviewer, or external runtime enters RobynAwesome/Project-Jennifer, changes its architecture or code, works on the game/runtime, touches governance, memory, validation, companions, lore, telemetry, retrieval, or needs to discover the correct Project Jennifer specialist skill before acting.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  repository: RobynAwesome/Project-Jennifer
  capability: repository-router
  portable: true
  renter_contract: skills/jennifer-stateless-renter/SKILL.md
  skill_index: skills/SKILL.md
  source_authority_registry: governance/source-authority-registry.json
  validation_policy: VALIDATION_POLICY.md
  tags:
    - project-jennifer
    - governance
    - tactical-rpg
    - stateless-renter
    - agent-skills
    - repository-router
---

# Project Jennifer — Repository Skill

## Purpose

This is the public entry contract for any AI runtime entering **Project Jennifer**.

Do not begin by treating the repository as an undifferentiated code dump. Project Jennifer contains executable runtime code, game code, governance contracts, source-authority classifications, research references, story/lore sources, visual sources, quarantined evidence, tests and portable skills. They do not all carry the same authority.

The governing invariant is:

> **Semantic relevance does not imply authority, privacy eligibility, canon status, or proof.**

## Stateless renter entry

An external model/runtime enters Project Jennifer as a **stateless renter**. This describes its constitutional relationship to Jennifer, not whether the provider itself has memory.

```text
ENTER REPOSITORY
→ read this root SKILL.md
→ read skills/jennifer-stateless-renter/SKILL.md
→ read skills/SKILL.md
→ classify the task
→ load only the required specialist skills
→ inspect authoritative source/code/tests
→ execute bounded work
→ validate
→ return evidence + consequences + receipts
```

Never self-promote generated output into Jennifer canon, governed memory or validated architecture merely because a tool call succeeded.

## Authority order

Before changing or asserting Project Jennifer truth, inspect:

1. current human instruction;
2. `governance/source-authority-registry.json`;
3. `VALIDATION_POLICY.md` and relevant validation state;
4. current executable source and tests;
5. relevant ADRs / declared architecture artifacts;
6. historical, research, visual and lore references according to their registered class.

A private or historical source does not become public/project canon because retrieval ranked it highly.

## Repository map

### Public game and product

- `README.md` — public front door and current product/story explanation.
- `apps/web/` — Next.js / Phaser web game and UI.
- `apps/api/` — API surface for runtime, governance, memory, NCMP and Crisis Connect.
- `assets/` — governed visual/story assets, manifests and quarantine evidence.

### Runtime and intelligence packages

- `packages/authority/` — roles, permission/semantic contracts, elevation firewall.
- `packages/governance/` — policy engine and governance contracts.
- `packages/runtime/` — Jennifer, companion, Forge-role and relationship runtime.
- `packages/memory/` — GSMB, memory receipt engine and persistence schema.
- `packages/telemetry/` — telemetry engine.
- `packages/validation/` — validation engine.
- `packages/conceptual/` — CCP, CEEP and POC-vs-FOC conceptual evaluation.
- `packages/npc/` — NPC runtime.
- `packages/hue/` — Human Understanding Engine.
- `packages/collective-ingress/` — collective change/ingress processing.
- `packages/crisis-connect/` — Crisis Connect integration.
- `packages/shared/` — shared contracts, constructs, relationships, NCMP and event bus.

### Python governed runtime

- `project_jennifer/attention/` — CAG implementation.
- `project_jennifer/retrieval/` — governed RAG.
- `project_jennifer/core/` — Free Mode and renter routing.
- `project_jennifer/contracts/` — receipts, events, renter, retrieval and storage contracts.
- `project_jennifer/validation/` — guardrails and validation.
- `project_jennifer/storage/` — SQLite edge and reconciliation.
- `project_jennifer/telemetry/` — receipt/telemetry persistence.
- `project_jennifer/evaluation/` and `benchmarks/` — measurable renter/system evidence.

### Governance and architecture

- `Project_Jennifer.md` — declared architecture source; preserve its declared validation state.
- `VALIDATION_POLICY.md` — POC/FOC enforcement and merge gates.
- `NCMP.md` — NCMP contract.
- `docs/architecture/` — current architecture and ADRs.
- `docs/mmao/` — MMAO governance/session material.
- `governance/source-authority-registry.json` — source class/admission authority.
- `skills/` — portable repository-native execution skills.

## Specialist skill routing

Always consult `skills/SKILL.md` for the current index. Core paths include:

- communication/context relevance → `cag-communication-attention`;
- governed evidence retrieval → `rag-governed-retrieval`;
- external/local agent execution → `jennifer-stateless-renter`;
- consequential relational inference → `forge-rivm`;
- authored relational expression → `authored-relational-attention`;
- authority, permissions, source classes → `jennifer-authority-governance`;
- runtime, GSMB and relationship continuity → `jennifer-runtime-memory`;
- validation and POC/FOC → `jennifer-validation-poc-foc`;
- conceptual evaluation/convergence → `jennifer-conceptual-convergence`;
- companion/NPC work → `jennifer-companions-npcs`;
- telemetry/persistence/reconciliation → `jennifer-telemetry-storage`;
- NCMP/MMAO → `jennifer-ncmp-mmao`;
- web game/API work → `jennifer-game-web-api`;
- lore/assets/canon intake → `jennifer-assets-lore`;
- CI/evals/benchmarks → `jennifer-ci-benchmarks`;
- provider/partner onboarding → `jennifer-adoption-provider-onboarding`;
- HUE / Collective Ingress / Crisis Connect → `jennifer-human-crisis-ingress`.

## Validation law

Project Jennifer uses **POC vs FOC**.

A claim is not validated because it is plausible, elegant, generated confidently, or present in concept art. Architecture and runtime truth must survive the repository's evidence gates.

Do not silently reconstruct missing architecture. If a required authoritative source is missing, preserve that absence and report the validation state.

## Mutation law

Before changing files:

1. identify the authoritative source and applicable specialist skill;
2. preserve source metadata and privacy/canon lane;
3. inspect tests and dependent contracts;
4. make the smallest coherent change;
5. run or inspect relevant validation;
6. report changed files, validation state, unresolved conflicts and receipt/evidence references.

Architecture/governance changes must follow `VALIDATION_POLICY.md` merge gates.

## Final renter receipt

Return at minimum:

```text
runtime / renter identity
task + selected skills
sources consulted
files/actions changed
validation performed
POC / Pending / UNVERIFIED / FOC state where applicable
unresolved conflicts
receipts / evidence
memory or canon promotion recommendation (never automatic)
```

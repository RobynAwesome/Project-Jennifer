# Project Jennifer Repository Skill Membrane — Source Declaration

## Source Provenance & Validation State

| Field | Value |
|---|---|
| **Declared Source** | Current `RobynAwesome/Project-Jennifer` repository architecture, code, tests, existing skills and governance sources at base commit `a268b65be69560d13bce8f6635c18680316e5481`; plus the repository owner's 2026-08-12 instruction to make Project Jennifer self-describing through repo-native Agent Skills for stateless renters. |
| **Declared By** | Kholofelo Robyn Rababalela (`@RobynAwesome`) |
| **Declaration Date** | 2026-08-12 |
| **Validation State** | Pending |
| **Governance Classification** | Source-Declared + Repository-Derived (not model-reconstructed architecture) |

## Ecosystem anchor resolution

The owner-declared ecosystem anchor remains `Kopano-Labs/Introduction-to-MCP`. GitHub currently resolves that repository to `RobynAwesome/Introduction-to-MCP`, which is also the source URL exposed by the live AwesomeSkills entry. The redirect is recorded as repository evidence; it does not transfer governance authority to this skill membrane.

## Scope

This declaration covers the repository-level skill membrane introduced on branch `agent/project-jennifer-repo-skills`:

- `/SKILL.md` repository entry skill;
- `/skills/SKILL.md` specialist router;
- new `jennifer-*` specialist skills introduced by the same change;
- the accompanying `skills/README.md` index update.

## Derivation rule

The skills do not declare new Project Jennifer architecture simply because a model wrote a workflow. They route repeatable work to architecture and code that already exists in the repository.

Where a skill summarizes an existing system, the underlying repository source remains authoritative. If a skill conflicts with executable code, a declared canonical artifact, `VALIDATION_POLICY.md`, or `governance/source-authority-registry.json`, the conflict must be receipted and resolved through governance rather than silently treating the skill as higher authority.

## Primary evidence families

- Existing skill contracts in `skills/*/SKILL.md`;
- `Project_Jennifer.md`;
- `VALIDATION_POLICY.md`;
- `governance/source-authority-registry.json`;
- `packages/*` runtime/governance implementations;
- `project_jennifer/*` Python runtime/governance implementations;
- `apps/web` and `apps/api`;
- `docs/architecture`, `docs/mmao`, `docs/lore` and `docs/protocols`;
- `.github/workflows`, `tests` and `benchmarks`;
- governed asset manifests and audits under `assets/` and `docs/audits/`.

## Validation boundary

`Pending` is intentional. The stateless renter that assembled this skill membrane must not promote its own output to `Validated`.

Promotion to `Validated` requires the evidence and governance approver sign-off defined by `VALIDATION_POLICY.md`.

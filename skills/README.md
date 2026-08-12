# Project Jennifer Skills

Project Jennifer packages repeatable governance and implementation workflows as portable `SKILL.md` playbooks with explicit inputs, steps, outputs, checks, schemas and receipts.

The repository is now **self-describing to stateless renters**:

```text
/SKILL.md
→ /skills/SKILL.md
→ exact specialist skill(s)
→ authoritative code / docs / tests
→ validation
→ evidence + receipt
```

A renter or coding agent should not reverse-engineer Jennifer from filenames or generic framework conventions when a Project Jennifer skill already defines the local operating contract.

## Repository entry

- [`../SKILL.md`](../SKILL.md) — repository-level public Agent Skill and mandatory entry router.
- [`SKILL.md`](SKILL.md) — specialist skill index / progressive-disclosure router.
- [`jennifer-stateless-renter/SKILL.md`](jennifer-stateless-renter/SKILL.md) — constitutional renter execution contract.

## Core governance / intelligence skills

| Skill | Runtime role | Purpose |
|---|---|---|
| `cag-communication-attention` | validator / attention governance | Keep inference focused on what matters now; gate irrelevant or privacy-invalid context. |
| `rag-governed-retrieval` | retriever | Retrieve, rank and provenance evidence under authority and privacy rules. |
| `jennifer-stateless-renter` | renter execution contract | Let external/local runtimes enter Jennifer without inheriting memory or authority. |
| `forge-rivm` | relational inference membrane | Preserve warmth, truth, agency, ontology, privacy, execution and history in consequential relationship-bearing inference. |
| `authored-relational-attention` | relational expression pattern | Preserve locally authored attention without ownership, coercion or ontology inflation. |

## Repository-native implementation skills

| Skill | Repository lane |
|---|---|
| `jennifer-authority-governance` | `packages/authority`, `packages/governance`, source authority, permissions, privacy and canon admission |
| `jennifer-runtime-memory` | Jennifer runtime, relationships, GSMB, memory receipts and persistent consequence |
| `jennifer-validation-poc-foc` | validation engines, guardrails, POC/FOC evidence and merge-state truth |
| `jennifer-conceptual-convergence` | CCP, CEEP, framework evolution and conceptual evaluation |
| `jennifer-companions-npcs` | companions, progression, NPC runtime and character-state governance |
| `jennifer-telemetry-storage` | telemetry, receipts, PostgreSQL/MongoDB/SQLite persistence and reconciliation |
| `jennifer-ncmp-mmao` | NCMP, MMAO, multi-renter session/orchestration contracts |
| `jennifer-game-web-api` | Next.js/Phaser web game, API routes and browser/runtime bridges |
| `jennifer-assets-lore` | governed assets, manifests, lore, canon and source integrity |
| `jennifer-ci-benchmarks` | CI, tests, evals and versioned renter benchmarks |
| `jennifer-adoption-provider-onboarding` | provider/partner capability manifests, adapters and qualification |
| `jennifer-human-crisis-ingress` | HUE, Collective Ingress and Crisis Connect human/collective context |

## Portable package shape

```text
skill-name/
├── SKILL.md
├── schemas/
├── examples/        # optional
└── resources/       # optional
```

The `SKILL.md` file is the human-readable execution contract. Schemas make receipts and integration artifacts machine-checkable.

## Runtime order

```text
current human instruction
→ repository root SKILL
→ stateless renter contract
→ source-authority / privacy eligibility
→ specialist skill routing
→ CAG pre-inference
→ governed RAG if knowledge is required
→ exact renter selection / execution
→ CAG post-inference
→ RIVM when consequentially relational
→ validation
→ telemetry + receipts
→ governed memory / feedback
```

Semantic relevance never grants authority by itself. Before retrieval or publication, source material must preserve its privacy lane, canon status, chronology and proof state. See [`governance/source-authority-registry.json`](../governance/source-authority-registry.json) and [`ADR-0005`](../docs/architecture/adr-0005-governed-source-authority-and-rivm.md).

## Distribution

See `distribution/engines.yaml` and `distribution/README.md`.

Adapters may translate delivery format for a provider, but they must preserve:

- current human task authority;
- source-authority precedence;
- privacy lane boundaries;
- evidence provenance;
- CAG relevance decisions;
- RIVM hard-fail semantics when relational;
- POC/FOC validation semantics;
- memory/canon promotion gates;
- receipt semantics.

## Discovery rule

An indexer may install the **whole repository** through the root `SKILL.md`. Once inside Jennifer, progressive disclosure happens through `skills/SKILL.md` and the specialist directories above.

Adding a new repository capability does **not** automatically make it a skill. Add or revise a `SKILL.md` when a repeatable task requires Jennifer-specific operating law, source routing, validation or output contracts.

# Project Jennifer Skills

Project Jennifer packages repeatable governance workflows as portable `SKILL.md` playbooks with explicit inputs, steps, outputs, checks, schemas and receipts.

## Start here

For AI/renter discovery, the canonical repo-level map is now:

> **[`../skills.md`](../skills.md) — Project Jennifer Awesome Skills Entry**

For a general Jennifer task, load:

> **[`project-jennifer/SKILL.md`](project-jennifer/SKILL.md) — umbrella skill router**

For repository implementation work, continue through:

> **[`SKILL.md`](SKILL.md) — repository-native implementation router**

Then load only the smallest specialist skill(s) needed for the current human instruction.

This preserves Project Jennifer's stateless-renter model: skill discovery is easy, but memory, authority, canon, and proof are never silently inherited.

## Portable skills

| Skill | Runtime role | Proof boundary |
|---|---|---|
| `project-jennifer` | repo-level skill router | Routes to current source; does not replace repository inspection. |
| `cdp-conceptual-divergence` | conceptual divergence | Portable workflow backed by the dedicated coded/tested TypeScript parser/runtime under `packages/conceptual/src/cdp/`; execution still requires its own runtime receipt. |
| `ceep-conceptual-evaluation` | conceptual evaluation | Portable workflow backed by current CEEP TypeScript implementation. |
| `poc-foc-evaluation` | evidence/risk evaluator | Portable workflow backed by current `POCvsFOCEvaluator`. |
| `ccp-conceptual-convergence` | conceptual convergence | Portable workflow backed by current TypeScript CCP implementation. |
| `ncmp-concept-intake` | new-concept governance | Portable workflow backed by current NCMP state machine; human recognition remains mandatory. |
| `cag-communication-attention` | validator / attention governance | Skill + coded Python/runtime surfaces. |
| `rag-governed-retrieval` | retriever | Skill + coded governed-RAG surfaces. |
| `jennifer-stateless-renter` | renter execution contract | Skill + renter contracts/router. |
| `forge-rivm` | relational inference membrane | Portable RIVM governance protocol; runtime wiring must be proved separately. |
| `authored-relational-attention` | relational expression pattern | Portable relational expression/governance pattern. |

## Repository-native implementation skills

| Skill | Repository lane |
|---|---|
| `jennifer-authority-governance` | authority, governance, source classes, permissions, privacy and canon admission |
| `jennifer-runtime-memory` | runtime continuity, relationships, GSMB, memory receipts and persistent consequence |
| `jennifer-validation-poc-foc` | validation engines, guardrails, evidence gates and merge-state truth |
| `jennifer-conceptual-convergence` | CCP, CEEP, framework evolution and conceptual receipts |
| `jennifer-companions-npcs` | companions, progression, NPC runtime, actor-relative divergence and character-state governance |
| `jennifer-telemetry-storage` | telemetry, receipts, PostgreSQL/MongoDB/SQLite persistence and reconciliation |
| `jennifer-ncmp-mmao` | NCMP, MMAO and multi-renter session/orchestration contracts |
| `jennifer-game-web-api` | Next.js/Phaser web game, API routes and browser/runtime bridges |
| `jennifer-assets-lore` | governed assets, manifests, lore, canon and source integrity |
| `jennifer-ci-benchmarks` | CI, tests, evals and versioned renter benchmarks |
| `jennifer-adoption-provider-onboarding` | provider/partner capability manifests, adapters and qualification |
| `jennifer-human-crisis-ingress` | HUE, Collective Ingress and Crisis Connect human/collective context |

## Situational conceptual routing

Project Jennifer uses CDP and CCP as complementary transitions, not a universal fixed order.

```text
CURRENT STATE
    │
    ├─ alternatives must open/reopen ───────────► CDP / DIVERGE
    ├─ evidence needs evaluation ───────────────► CEEP + POC-vs-FOC
    ├─ stable evidence should compress ─────────► CCP / CONVERGE
    └─ evidence/authority is insufficient ──────► HOLD
```

A common exploration path remains:

```text
CDP — expand / reopen possibility space
        ↓
CEEP — evaluate candidate concepts
        ↓
POC-vs-FOC — separate proof from unsupported promotion
        ↓
CCP — converge when evidence earns it
        ↓
canonical / evolution receipt
```

But this is also valid:

```text
CCP → contradictory evidence → CDP
```

Canonical shorthand from the Convergence Law:

```text
CDP asks: what could this become / what alternatives must remain open?
CCP asks: what consistently works between us / survives the evidence?
```

```text
DIVERGENCE != FOC
CONVERGENCE != POC
```

Either transition can later validate or fail through consequence and evidence.

## NPC epistemic divergence

The NPC runtime now has a bounded PR1 primitive under `packages/npc/src/epistemic-divergence.ts` for:

```text
objective event facts
→ actor observation
→ partial-known state
→ actor interpretation
→ CONVERGE | DIVERGE | HOLD
→ optional policy-backed consequence intent
```

Its receipts remain actor models, not objective canon and not proof that conceptual CDP/CCP executed. `POWER` divergence capability preserves alternatives longer before collapsing an actor belief. Latent player consequences require reconstructable causal and policy evidence.

## Other Jennifer capability surfaces

The repository-native skills route these capability families without replacing their current implementation truth. The repo-level [`skills.md`](../skills.md) preserves the exact proof state for:

- framework registry/evolution receipts;
- Memory Receipt Engine;
- GSMB / Digital Hippocampus memory;
- governance and authority engines;
- validation;
- telemetry;
- HUE;
- Collective Ingress;
- Crisis Connect;
- companion/relationship/NPC runtimes;
- source authority;
- Project Waifu Forge and Project Wify Jennifer domains.

A capability can be coded without having a standalone `SKILL.md`, and a portable skill can exist before dedicated runtime code. Preserve the proof state instead of flattening those categories.

## Portable package shape

```text
skill-name/
├── SKILL.md
├── schemas/
├── examples/        # optional
└── resources/       # optional
```

The `SKILL.md` file is the human-readable execution contract. Schemas make receipts and integration artifacts machine-checkable.

## Runtime routing

```text
current human instruction
→ skills.md / umbrella routing when needed
→ source-authority / privacy eligibility
→ CAG pre-inference
→ CDP when deliberate divergence or reopening is required
→ governed RAG if knowledge is required
→ CEEP / POC-vs-FOC when conceptual evidence must be evaluated
→ CCP when convergence is requested / earned
→ HOLD when evidence or authority is insufficient
→ NCMP when a genuinely new agent-originated concept requires recognition / registration
→ exact renter selection / execution where needed
→ CAG post-inference
→ RIVM when consequentially relational
→ validation
→ telemetry + receipts
→ governed memory / feedback
```

Not every request traverses every stage. CAG means selecting the **minimum relevant governed path**, not ritualistically invoking all skills.

Semantic relevance never grants authority by itself. Before retrieval or publication, source material must preserve its privacy lane, canon status, chronology and proof state. See [`governance/source-authority-registry.json`](../governance/source-authority-registry.json) and [`ADR-0005`](../docs/architecture/adr-0005-governed-source-authority-and-rivm.md).

## Distribution

See [`distribution/engines.yaml`](distribution/engines.yaml) and [`distribution/README.md`](distribution/README.md).

Adapters may translate delivery format for a provider, but they must preserve:

- current human task authority;
- stateless-renter posture;
- source-authority precedence;
- privacy lane boundaries;
- evidence provenance;
- situational CDP/CEEP/POC-vs-FOC/CCP proof-state boundaries;
- NCMP human-recognition authority;
- CAG relevance decisions;
- RIVM hard-fail semantics when relational;
- memory promotion gates;
- receipt semantics.

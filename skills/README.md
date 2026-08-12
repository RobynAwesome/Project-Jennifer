# Project Jennifer Skills

Project Jennifer packages repeatable governance workflows as portable `SKILL.md` playbooks with explicit inputs, steps, outputs, checks, schemas and receipts.

## Start here

For AI/renter discovery, the canonical repo-level map is now:

> **[`../skills.md`](../skills.md) — Project Jennifer Awesome Skills Entry**

For a general Jennifer task, load:

> **[`project-jennifer/SKILL.md`](project-jennifer/SKILL.md) — umbrella skill router**

Then load only the smallest specialist skill(s) needed for the current human instruction.

This preserves Project Jennifer's stateless-renter model: skill discovery is easy, but memory, authority, canon, and proof are never silently inherited.

## Portable skills

| Skill | Runtime role | Proof boundary |
|---|---|---|
| `project-jennifer` | repo-level skill router | Routes to current source; does not replace repository inspection. |
| `cdp-conceptual-divergence` | conceptual divergence | Portable/specification-backed workflow; no dedicated `packages/conceptual/src/cdp/` engine currently proven. |
| `ceep-conceptual-evaluation` | conceptual evaluation | Portable workflow backed by current CEEP TypeScript implementation. |
| `poc-foc-evaluation` | evidence/risk evaluator | Portable workflow backed by current `POCvsFOCEvaluator`. |
| `ccp-conceptual-convergence` | conceptual convergence | Portable workflow backed by current TypeScript CCP implementation. |
| `ncmp-concept-intake` | new-concept governance | Portable workflow backed by current NCMP state machine; human recognition remains mandatory. |
| `cag-communication-attention` | validator / attention governance | Skill + coded Python/runtime surfaces. |
| `rag-governed-retrieval` | retriever | Skill + coded governed-RAG surfaces. |
| `jennifer-stateless-renter` | renter execution contract | Skill + renter contracts/router. |
| `forge-rivm` | relational inference membrane | Portable RIVM governance protocol; runtime wiring must be proved separately. |
| `authored-relational-attention` | relational expression pattern | Portable relational expression/governance pattern. |

## Conceptual reasoning spine

```text
CDP — expand possibility space
        ↓
CEEP — evaluate candidate concepts
        ↓
POC-vs-FOC — separate proof from unsupported promotion
        ↓
CCP — converge on evidence-bearing decision
        ↓
canonical / evolution receipt
        ↓
NCMP when genuinely new agent-originated concepts need human recognition + governed registration
```

Canonical shorthand from the Convergence Law:

```text
CDP asks: what could this become?
CCP asks: what consistently works between us / survives the evidence?
```

CDP and CCP are intentionally complementary. Pure divergence becomes chaos; pure convergence without exploration becomes rigidity.

## Other Jennifer capability surfaces

Not every implemented system has been duplicated into a separate portable skill package. The repo-level [`skills.md`](../skills.md) routes agents to current implementations for:

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

## Runtime order

```text
current human instruction
→ skills.md / umbrella routing when needed
→ source-authority / privacy eligibility
→ CAG pre-inference
→ CDP when deliberate divergence is required
→ governed RAG if knowledge is required
→ CEEP / POC-vs-FOC when conceptual evidence must be evaluated
→ CCP when convergence is requested / earned
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
- CDP/CEEP/POC-vs-FOC/CCP proof-state boundaries;
- NCMP human-recognition authority;
- CAG relevance decisions;
- RIVM hard-fail semantics when relational;
- memory promotion gates;
- receipt semantics.

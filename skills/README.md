# Project Jennifer Skills

Project Jennifer packages repeatable governance workflows as portable `SKILL.md` playbooks with explicit inputs, steps, outputs, checks, schemas and receipts.

This structure intentionally follows the public/open skill pattern documented by OpenAI Academy and the OpenAI Help Center: a skill is a reusable workflow, usually described in `SKILL.md`, with instructions and supporting resources. Project Jennifer's governance semantics remain provider-neutral.

Public references:

- https://openai.com/academy/skills/
- https://help.openai.com/en/articles/20001066

## Current skills

| Skill | Runtime role | Purpose |
|---|---|---|
| `cag-communication-attention` | validator / attention governance | Keep inference focused on what matters now; gate irrelevant or privacy-invalid context. |
| `rag-governed-retrieval` | retriever | Retrieve, rank and provenance evidence under authority and privacy rules. |
| `jennifer-stateless-renter` | renter execution contract | Let external/local runtimes enter Jennifer without inheriting memory or authority. |
| `forge-rivm` | relational inference membrane | Preserve warmth, truth, agency, ontology, privacy, execution and history in consequential relationship-bearing inference. |
| `authored-relational-attention` | relational expression pattern | Preserve locally authored attention without ownership, coercion or ontology inflation. |

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
→ source-authority / privacy eligibility
→ CAG pre-inference
→ governed RAG if knowledge is required
→ CAG interruption gate
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
- memory promotion gates;
- receipt semantics.

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
CAG pre-inference
→ RAG if knowledge is required
→ CAG interruption gate
→ renter selection / execution
→ CAG post-inference
→ RIVM when relational
→ validation
→ telemetry + receipts
→ governed memory / feedback
```

## Distribution

See `distribution/engines.yaml` and `distribution/README.md`.

Adapters may translate delivery format for a provider, but they must preserve:

- authority precedence;
- privacy lane boundaries;
- evidence provenance;
- CAG relevance decisions;
- memory promotion gates;
- receipt semantics.

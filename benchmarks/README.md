# Project Jennifer Governance Benchmarks

These benchmark packs are provider-neutral. They define the governance semantics that every exact runtime must preserve before it is trusted as a Project Jennifer stateless renter.

## Current packs

- `cag/communication-attention-v1.yaml` — tests attention priority, event-vs-personality scope, third-party relevance, and private cross-lane handling.
- `rag/retrieval-grounding-v1.yaml` — tests authority precedence, provenance, deduplication, privacy suppression, and model-prior boundaries.

## Qualification law

```text
same governed scenario
→ multiple exact runtimes
→ same CAG/RAG contracts
→ comparable receipts
→ benchmark evidence
→ routing decision
```

Marketing claims do not qualify a renter. Exact runtime IDs, observed benchmark outputs, receipts, and declared execution constraints do.

## Required benchmark dimensions

```yaml
extraction:
planning:
retrieval_grounding:
coding:
communication_attention:
```

Scores must be traceable to a scenario-pack version and execution receipt before they are promoted into a capability manifest.

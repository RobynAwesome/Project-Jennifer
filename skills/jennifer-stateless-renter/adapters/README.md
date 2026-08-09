# Stateless Renter Adapters

Provider/runtime adapters translate Project Jennifer's portable skill and contract package into the context mechanism understood by a specific renter.

They **must not** rewrite Jennifer governance semantics.

## Adapter responsibilities

```text
Jennifer SKILL.md + schemas + task context
→ provider/runtime delivery format
→ exact renter execution
→ normalized result + evidence + receipts
```

An adapter may handle:

- system/instruction context injection;
- repository rule/context files;
- tool registration;
- MCP/resource exposure;
- retrieval connector mapping;
- local model prompt templates;
- structured-output translation;
- provider-specific response normalization.

## Adapter invariants

1. Preserve the exact runtime/model ID.
2. Preserve CAG attention target and interruption decisions.
3. Preserve RAG authority tiers and evidence provenance.
4. Preserve private-lane classifications.
5. Do not silently grant memory-write authority.
6. Return tool/file changes explicitly.
7. Return failures and consequences rather than cosmetically hiding them.
8. Return receipts or sufficient data for Jennifer to mint them.
9. Verify current provider behavior at runtime; do not rely on stale marketing assumptions.

## Distribution registry

See `../../distribution/engines.yaml` for the current provider-neutral delivery map.

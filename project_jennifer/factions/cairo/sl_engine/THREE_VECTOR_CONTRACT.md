# Cairo Three-Vector Contract

## Law

Cairo's SL Engine is governed by exactly three first-class canonical vectors:

| Vector | Canonical role | Engine question |
|---|---|---|
| Seduction | attraction, influence, approach, tension | **What move is available?** |
| Kama | intimacy, desire, reciprocity, relational context | **What does desire mean here?** |
| Rhythm | cadence, timing, pause, escalation, release | **When and how should the signal move?** |

These are the first sources consulted for Cairo-specific reasoning.

## 3-of-3 gate

A Cairo turn is eligible for downstream generation only after the engine produces a retrieval status for all three vectors.

```yaml
canonical_gate:
  seduction: consulted
  kama: consulted
  rhythm: consulted
```

`consulted` does not mean that a vector must invent relevant evidence. A vector may truthfully return `no_relevant_evidence`. The engine must preserve that state in the receipt.

Example:

```yaml
canonical_gate:
  seduction: evidence
  kama: no_relevant_evidence
  rhythm: evidence
result: pass
```

The gate fails when a vector was skipped, unavailable without disclosure, or its provenance cannot be established.

## CDP → CCP

After the canonical gate:

### CDP — Conceptual Divergence Protocol

Produces multiple bounded interpretations or action candidates from the three-vector evidence.

### CCP — Conceptual Convergence Protocol

Selects or synthesizes the candidate that best satisfies:

- current world state;
- Cairo identity;
- faction mandate;
- relationship state;
- KPGS boundaries;
- evidence provenance.

## Prompting as world interaction

When a player speaks to an agentic NPC, Project Jennifer treats that interaction as **prompting inside the world**.

The player does not directly command the underlying language model. The player addresses Cairo; Cairo's SL Engine interprets the input through the three vectors before any downstream model realization.

## Progression

The engine may evolve through:

```text
Generative → Agentic → Identic
```

but the three-vector gate remains canonical unless a later constitutional change explicitly supersedes it with a receipt-bearing migration.

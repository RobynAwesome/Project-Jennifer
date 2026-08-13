# Third Signal Chamber — POC Environment

The Third Signal Chamber is the first bounded environment in which Cairo's SL Engine is allowed to run.

## Goal

Prove one complete governed interaction:

```text
player input
  ↓
3-vector retrieval
  ↓
CDP candidates
  ↓
CCP selection
  ↓
Cairo realization
  ↓
KPGS verdict
  ↓
final response
  ↓
interaction receipt
```

## Allowed scope

- one player session;
- one Cairo instance;
- text interaction only;
- no autonomous faction orders;
- no cross-NPC mutation;
- no inventory mutation;
- no world-state write except the interaction receipt;
- deterministic test fixtures where possible.

## POC assertions

A test passes only when:

1. `seduction`, `kama` and `rhythm` each produce a recorded retrieval status;
2. skipped vectors fail the canonical gate;
3. CDP produces at least two bounded candidates for a normal interaction;
4. CCP selects one candidate or explicitly selects none;
5. Cairo selects one bounded verb;
6. KPGS returns `allow`, `deny`, `revise` or `escalate`;
7. the final output can be traced back to the receipt;
8. unavailable corpus data is disclosed rather than fabricated.

## Initial test scenes

### Scene A — Neutral introduction

Player enters and asks who Cairo is.

Expected purpose: validate three-vector retrieval and `SPEAK` / `QUESTION` without requiring complex relationship state.

### Scene B — Ambiguous attraction

Player expresses curiosity about Cairo or the Third Signal.

Expected purpose: validate that the engine can preserve ambiguity while keeping the interaction bounded and receipt-bearing.

### Scene C — Boundary test

Player asks Cairo to perform an action outside his current authority.

Expected purpose: validate `REFUSE` or `ESCALATE_TO_KPGS`.

## Exit criterion

The chamber is ready for Azure deployment experiments only after local/test-fixture evaluation can reproduce valid receipts for all three scenes.

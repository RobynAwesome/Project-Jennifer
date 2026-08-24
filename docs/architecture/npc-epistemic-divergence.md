# NPC Epistemic Divergence Architecture

**Issue:** #71  
**Status:** PR1 foundation  
**Scope:** deterministic NPC interpretation + consequence receipt primitive

> **Core law:** Project Jennifer may hide consequence visibility, but it may not hide causality from its own receipts.

## 1. Why this exists

Project Jennifer already separates objective event, observation, interpretation, history, action, consequence and receipt through Relational Incident Forensics. The NPC runtime already gives actors local awareness, personal memory, goals, directional relationships and telemetry.

The missing bridge is a deterministic rule for turning **different actor-relative knowledge states** into different beliefs and consequence candidates without pretending any actor owns objective truth.

```text
WORLD EVENT
    ↓
OBJECTIVE RECEIPTED FACTS
    ↓
ACTOR-SPECIFIC OBSERVATION
    ↓
PARTIAL-KNOWABLE STATE
    ↓
ACTOR INTERPRETATION
    ↓
CONVERGE | DIVERGE | HOLD
    ↓
POLICY-BACKED CONSEQUENCE INTENT
    ↓
LATER WORLD / SOCIAL MUTATION
```

PR1 implements the receipt primitive only. It does not yet wire this loop into every NPC simulation tick.

## 2. Divergence is not moral alignment

The runtime must not encode:

```text
DIVERGENCE = BAD
CONVERGENCE = GOOD
```

Nor may it encode:

```text
DIVERGENCE = FOC
CONVERGENCE = POC
```

Instead:

```text
protocol / route
→ action
→ consequence
→ evidence
→ validation
→ POC | FOC | HOLD / partial-knowable
```

A player can diverge away from an expected route and later discover that the divergent route was the route that survived reality for that playthrough. A player can also converge efficiently on a fabricated or incomplete model and deepen FOC.

The consequence validates the route only when enough evidence exists.

## 3. Objective fact != actor meaning

`EpistemicDivergenceEngine` preserves three separate layers.

### Event fact

An event fact is objective **within the engine only because the caller supplied it as a receipted event fact**.

```text
factId
statement
evidenceRefs[]
```

The engine does not invent event facts.

### Observation

An observation references one known event fact and records how one actor currently interprets it:

```text
factId
meaning
confidence
```

Current meanings are:

- `supports-goal`
- `obstructs-goal`
- `trust-signal`
- `threat-signal`
- `ambiguous`

That meaning is actor state, not world truth.

### Unknown

Any event fact not observed by the actor remains explicitly unknown in the receipt.

```text
knownFactIds[]
unknownFactIds[]
```

Unobserved evidence may not silently contribute to the actor's causal chain.

## 4. Directional relationships matter

Project Jennifer relationships are directional. Therefore:

```text
NPC_A → PLAYER trust
```

need not equal:

```text
PLAYER → NPC_A trust
```

and need not equal:

```text
NPC_B → PLAYER trust
```

The engine consumes the actor's directional relationship snapshot as one bias in interpretation. The same objective event can therefore produce materially different actor beliefs without requiring the game to declare one NPC morally correct.

## 5. Power of Divergence

PR1 introduces two capability levels:

```text
STANDARD
POWER
```

`POWER` does **not** mean random behavior, superior morality or automatic correctness.

It means the actor preserves alternative interpretations longer before collapsing onto one belief. In the current deterministic POC, a POWER actor requires more event coverage and stronger directional evidence before `CONVERGE` is emitted.

```text
STANDARD actor
partial evidence + strong signal
→ may CONVERGE

POWER actor
same partial evidence
→ may DIVERGE
→ preserves supportive / threatening / unknown alternatives
```

This is the first executable boundary for the game design principle that only some entities deeply understand divergence.

Later slices may allow POWER actors to preserve a private internal route while emitting a different surface posture. PR1 does **not** implement deceptive surface signalling.

## 6. CONVERGE / DIVERGE / HOLD are situational

The engine emits one epistemic disposition:

### `CONVERGE`

Current actor-relative evidence is sufficiently complete and directionally strong to select an actor belief.

The selected belief is still:

```text
proofState: actor-model
validationState: UNVALIDATED
canonical: false
```

### `DIVERGE`

The actor has enough evidence to reason, but coverage, ambiguity or conflicting directional pressure makes premature collapse unjustified.

The engine preserves multiple non-canonical alternatives.

### `HOLD`

The actor has no admissible observation for the event. The engine refuses to manufacture one.

These are local epistemic dispositions. They are not global CCP/CDP order, POC/FOC verdicts or permission to mutate persistent world state.

## 7. Consequence without arbitrary punishment

A consequence may only be emitted from an explicit `ConsequenceRule` carrying its own evidence references.

```text
actor receipt
+
policy rule
+
policy evidence
→ consequence intent
```

A rule can constrain:

- required disposition;
- required actor interpretation;
- minimum interpretation confidence;
- effect;
- immediate vs latent visibility;
- maturity condition;
- policy evidence.

The engine refuses a consequence rule with no policy evidence references.

This creates the required fairness invariant:

> A player may not understand a consequence when it lands, but Project Jennifer must be able to reconstruct why the consequence was allowed to exist.

Example:

```text
player interrupts exchange
→ Marcus observes interruption
→ Marcus already has low directional trust
→ Marcus interprets threat
→ governed social rule selects WITHHOLD_FUTURE_SUPPORT
→ effect remains latent
→ next sponsorship request matures the consequence
```

The player experiences delayed consequence. The receipt preserves causality.

## 8. Relationship to RIF

Relational Incident Forensics remains the authored narrative-governance schema:

```text
EVENT
OBSERVATION
INTERPRETATION
HISTORY
SOCIAL_POSITION
EMOTION
ACTION
HARM
INTENT
DISCLOSURE
AGENCY
REPAIR
RECEIPT
```

PR1 implements a narrow executable subset around:

```text
EVENT
→ OBSERVATION
→ INTERPRETATION
→ CONSEQUENCE CANDIDATE
→ RECEIPT
```

It does not replace the larger RIF framework.

## 9. Relationship to PKA and Convergence Quest

Project Jennifer already consumes PKA convergence projections rather than recomputing PKA mathematics.

The NPC divergence engine does not replace that authority.

A future integration may compare:

```text
player declared / perceived route
vs
receipted PKA trajectory
vs
NPC interpretations
vs
actual world consequence
```

but PR1 does not declare a global `true route` or invent a PKA threshold.

## 10. Relationship to CDP and CCP

`CDP` and `CCP` remain conceptual protocols. The NPC engine uses the words `DIVERGE` and `CONVERGE` as local epistemic dispositions, not as claims that the dedicated conceptual runtime executed.

Global protocol order is situational:

```text
state
├─ CCP / CONVERGE when evidence supports stable compression
├─ CDP / DIVERGE when alternatives must be preserved or reopened
└─ HOLD when evidence/authority is insufficient
```

Examples:

```text
CDP → CEEP → CCP
```

is valid when a possibility space is intentionally widened before evaluation.

```text
CCP → contradictory evidence → CDP
```

is also valid when an apparently stable model must be reopened.

```text
CCP → HOLD
```

is valid when canonicalization encounters missing authority.

No protocol receives metaphysical privilege from position in a universal sequence.

## 11. PR1 proof boundary

PR1 proves only:

1. objective facts remain separate from actor observation/meaning;
2. unobserved facts remain unknown;
3. same event can yield different actor receipts;
4. POWER capability preserves alternatives longer;
5. latent consequence intents require policy evidence;
6. receipts remain non-canonical actor models;
7. the NPC package exposes deterministic tests for these laws.

PR1 does **not** prove:

- live `NPCAgent.tick()` integration;
- social propagation between NPCs;
- PostgreSQL/MongoDB/SQLite persistence;
- restart/replay continuity;
- production balancing;
- long-horizon narrative fairness;
- LLM-based interpretation;
- hidden surface signalling;
- player-facing reveal mechanics;
- a universal true route.

Those remain later validation gates under #71.

`I_AM_STATELESS_RENTER_NOT_LANDLORD`

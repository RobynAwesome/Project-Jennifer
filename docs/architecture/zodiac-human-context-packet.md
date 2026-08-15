# Zodiac → HUE → Companion → RIVM Human Context Packet

**Declared Source:** Current human instruction (2026-08-15) + merged zodiac POC in PR #50  
**Declared By:** @RobynAwesome  
**Declaration Date:** 2026-08-15  
**Validation State:** Pending  
**Implementation State:** POC candidate

## Purpose

Phase 2 wires the merged zodiac symbolic-context POC into a governed human-context composition path without turning star signs into deterministic personality facts.

```text
ZodiacContextEngine
        ↓ validated symbolic signal only
HUE SymbolicProfileStore
        +
HUE HumanState
        +
BehavioralProfile
        +
Active Companion Selection
        ↓
HumanContextPacketEngine
        ↓
RIVM-bounded context packet + receipt
```

The packet is designed for companion/runtime inference. It is not itself a model prompt, a database write, a diagnosis, or a compatibility score.

## Authority order

```text
explicit player preference
        >
observed behavioral evidence
        >
self-declared zodiac symbol
        >
consented birth-date-derived zodiac symbol
        >
generic zodiac archetype
```

This means a Cancer archetype can supply vocabulary such as `home`, `continuity`, or `care`, but a current human correction or observed preference always wins.

## Player-profile projection

`packages/hue/src/symbolic-profile.ts` introduces a deliberately minimal HUE-side symbolic profile projection.

Stored zodiac fields:

- sign;
- source (`self-declared` or `birth-date-derived`);
- `LOW_SYMBOLIC_CONTEXT` authority;
- explicit epistemic status;
- admission timestamp.

Not stored by this profile:

- raw birth date;
- birth time;
- birth location;
- natal-chart data;
- compatibility score;
- personality score;
- risk or eligibility score.

The raw date-retention boundary from PR #50 therefore remains intact.

## Human context packet

`packages/runtime/src/human-context-packet-engine.ts` composes:

1. current HUE human state;
2. explicit/observed behavioral profile state;
3. optional admitted zodiac symbolic signal;
4. optional validated companion selection + definition;
5. an explicit RIVM governance section;
6. a composition receipt.

The packet declares that zodiac may colour companion flavour only when both a zodiac signal and companion are present. It cannot override explicit preference or observed behavior, become a personality fact, or predict a relationship outcome.

## RIVM boundary

The packet encodes the zodiac claim class as:

```text
INFERENCE_OR_SYMBOLIC_CONTEXT_NOT_FACT
```

RIVM-facing invariants:

- preserve human correction;
- preserve agency;
- prohibit ontology inflation;
- prohibit manufactured certainty;
- do not use zodiac to manufacture reciprocal desire or relationship certainty;
- do not silently convert symbolic resonance into factual memory.

## Cross-user binding protection

All packet sources must resolve to the same `userId` before composition. Companion selection must also belong to that user and match the supplied companion definition.

A mismatch fails before packet construction with a typed `HumanContextPacketError` rather than blending two humans' context.

## POC criteria

This phase earns POC only when CI demonstrates:

- HUE symbolic profile types compile;
- runtime packet types compile;
- a self-declared zodiac signal can enter the symbolic profile without raw birth data;
- explicit player preferences remain higher authority than zodiac;
- active companion state can be bound without changing zodiac authority;
- a withheld, non-consented date-derived signal does not enter the packet;
- cross-user source binding is rejected;
- RIVM restrictions are present in the packet receipt/contract;
- repository typecheck, lint, tests and governance validation pass.

## FOC / block conditions

Block promotion if:

- zodiac is copied into a deterministic personality field;
- a generic archetype overwrites explicit user preference;
- birth-date input appears in the stored symbolic profile;
- companion selection changes the authority of zodiac context;
- packet composition accepts mixed-user sources;
- the context packet is described as persistent database memory without a persistence adapter and receipt;
- CI or governance validation fails.

## Current POC boundary

This branch provides an in-process HUE symbolic-profile store and runtime context composer. It does **not** yet prove PostgreSQL/MongoDB/SQLite persistence of the symbolic profile, live LLM prompt injection, browser UI, natal-chart calculation, or production API exposure.

Those are separate promotion gates and should be implemented only after this composition layer survives validation.

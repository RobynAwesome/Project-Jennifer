# NCMP — New Concept MMAO Protocol

**Protocol ID:** `MMAO.NCMP`  
**Version:** `1.0.0`  
**Declared:** 2026-08-06  
**Authority:** Kholofelo Robyn Rababalela / `@RobynAwesome`

## Definition

**NCMP is the governed recognition of a new concept that was created inside Multi-Agent Mobile Orchestration.**

It exists for a rare but valid event: an agent or group of agents working inside an MMAO focus station produces a protocol-level concept that was not supplied beforehand by the human architect.

NCMP does **not** give agents independent constitutional authority. Agents may originate and propose the concept. The human architect decides whether the concept is recognized. Recognition then enters validation before it can become permanent Project Jennifer canon.

## Why NCMP Exists

MMAO already governs contributions from temporary agents, but it previously lacked an explicit lifecycle for concepts that originate inside the orchestration itself. Without NCMP, an agent-created concept could either disappear with the session or be silently treated as authoritative without governance.

NCMP prevents both failures.

## Lifecycle

```text
candidate
   ↓ human architect recognition
recognized
   ↓ evidence-based validation
validated
   ↓ governed registration
registered
   ↓ optional replacement
superseded
```

A candidate may also become `rejected`. A deferred validation remains `recognized` until more evidence exists.

## Invariants

1. **Origin must be traceable.** The focus station, originating agent, source wording, and timestamp must be recorded.
2. **Agents may propose, not self-authorize.** Agent origin does not equal governance authority.
3. **Recognition is human-owned.** The human architect supplies the recognition statement.
4. **Recognition is not validation.** A recognized concept must still survive evidence-based validation.
5. **Registration creates canon.** Only a validated concept may be registered as permanent protocol vocabulary.
6. **Every transition emits a receipt.** The repository must preserve actor, evidence, timestamp, prior state, and next state.

## First Self-Declaration

NCMP itself is the first concept registered for this use case:

> Recognition and governance of a new concept that originated inside Multi-Agent Mobile Orchestration.

It was recognized when the human architect identified that the agents had created one of the first protocols for themselves inside the Project Jennifer focus station.

## Code

The executable protocol primitives are implemented in:

- `packages/shared/src/ncmp.ts`
- exported through `@jennifer/shared`

The implementation provides:

- `NCMPConceptCandidate`
- `NCMPRecognition`
- `NCMPValidation`
- `NCMPReceipt`
- `NCMPRegistry`
- `NCMP_SELF_DECLARATION`

## Canonical Usage

```ts
import {
  NCMPRegistry,
  NCMP_SELF_DECLARATION,
} from "@jennifer/shared";

const registry = new NCMPRegistry();

registry.propose(
  NCMP_SELF_DECLARATION,
  "MMAO collaborative agents",
  "2026-08-06T09:36:00+02:00",
);

registry.recognize({
  conceptId: NCMP_SELF_DECLARATION.id,
  recognizedBy: "Kholofelo Robyn Rababalela",
  recognitionStatement:
    "NCMP is recognized as a new protocol concept created inside MMAO.",
  recognizedAt: "2026-08-06T09:36:00+02:00",
});
```

## Relationship to MMAO

MMAO is the orchestration environment. NCMP is the concept-origin governance protocol nested inside that environment.

```text
MMAO session
   ↓ agent-originated concept appears
NCMP candidate
   ↓ human recognition
NCMP governance lifecycle
   ↓ validation and registration
Project Jennifer protocol canon
```

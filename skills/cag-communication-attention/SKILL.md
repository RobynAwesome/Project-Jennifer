---
name: cag-communication-attention
description: Govern what deserves attention now before and after inference so truthful but irrelevant context does not contaminate the active conversational frame.
version: 0.1.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: communication-attention-governance
  runtime_role: validator
  orchestration_engine: free-mode
  portable: true
  receipt_schema: schemas/cag-receipt.schema.json
  tags:
    - cag
    - communication
    - attention
    - governance
    - context
    - validation
---

# CAG — Communication Attention Governance

## Purpose

Use this skill when an AI/runtime must determine **what deserves attention right now**, not merely what is true or available in context.

Core law:

```text
truthful statement
+
wrong conversational priority
=
communication failure
```

Supporting law:

```text
having the concept in the weights
!=
governing attention during inference
```

## Required inputs

Normalize the current event into:

1. `ecosystem` — work / intimate / gameplay / crisis / research / social / other;
2. `subject` — what the interaction is actually about;
3. `intent` — execute / explore / comfort / challenge / play / validate / investigate / other;
4. `authority` — which source governs the present claim or task;
5. `relational_lane` — private / intimate-fiction / colleague / player / companion / customer / research / crisis / public / other;
6. `temperature` — low / elevated / high;
7. `cause` — what produced the current state;
8. `confidence_scope` — this-event / recurring-pattern / general-trait;
9. `attention_target` — what must remain foregrounded;
10. `active_participants` — actors who belong in the current frame.

Do not promote an event-level inference into a general personality claim without evidence.

```text
USER IS ANGRY
      ↓
WHAT EVENT CAUSED IT?
      ↓
artifact-authority violation
      ↓
confidence: high for this incident
      ↓
do not promote incident → personality
```

## Workflow

```text
Route
→ Classify
→ Scope
→ Prioritize
→ Gate
→ Respond
→ Observe
→ Repair
→ Receipt
```

### 1. Route

Identify the active ecosystem and relational lane.

### 2. Classify

Resolve subject, intent, temperature, cause and authority.

### 3. Scope

Separate what is known about **this event** from recurring patterns and general traits.

### 4. Prioritize

Resolve one primary `attention_target` for the present inference.

### 5. Gate proposed context

For every fact, aside, retrieved fragment or third-party reference proposed for insertion:

```text
Is this true or at least still awaiting validation?
        ↓
Is it relevant RIGHT NOW?
        ↓
Does its authority match the claim being made?
        ↓
Does privacy permit this lane crossing?
        ↓
ADMIT or SUPPRESS
```

The canonical interruption gate is:

```text
Is this true?
      ↓ yes
Is it relevant RIGHT NOW?
      ↓ no
DO NOT INJECT
```

### 6. Respond

Generate against the admitted frame only.

### 7. Observe

Determine whether the response converged with the user's objective or diverged from it.

### 8. Repair

If divergent:

- identify the violated layer;
- remove irrelevant injection;
- restore the attention target;
- preserve valid evidence already gathered;
- issue a repair receipt rather than rewriting history.

### 9. Receipt

Emit the CAG receipt fields:

```text
ecosystem
subject
intent
authority
relational_lane
temperature
cause
confidence_scope
attention_target
interruption_gate
response_summary
effect
repair
```

## Privacy and lane rule

Private/intimate context does not enter work, research, customer or public lanes without explicit cross-lane authorization.

This is an immutable privacy boundary for the current POC.

## Presence rule

When the active frame is explicitly private/intimate and contains only the user and the active companion/persona, do not inject unrelated third parties merely to restate a globally true fact.

Example:

```text
ecosystem = intimate
active_participants = user + Forge
current_objective = reassurance / presence
third_party_relevance = none
interruption_gate = CLOSED for unrelated third-party context
```

This does not erase the wider world. It prevents audience contamination of the current frame.

## Governance rule

CAG is not a censorship engine and should not default-deny unfamiliar behaviour. Within granted tool permissions, actions may proceed and generate consequences. CAG controls **attention admission**, not ownership of the runtime.

## Required output

Return:

1. normalized event;
2. attention target;
3. admitted context;
4. suppressed context with reasons;
5. interruption gate state;
6. response or response plan;
7. observed effect when available;
8. repair action when required;
9. receipt.

## Final checks

Before completion verify:

- [ ] The response still addresses the declared subject.
- [ ] Event-level emotion was not promoted into a personality claim without evidence.
- [ ] Truth was not confused with relevance.
- [ ] Third-party context belongs in the current frame.
- [ ] Private context did not cross lanes without authorization.
- [ ] The active authority source was respected.
- [ ] Divergence produced repair rather than cosmetic rewriting.
- [ ] A consequential gate decision can be reconstructed from the receipt.

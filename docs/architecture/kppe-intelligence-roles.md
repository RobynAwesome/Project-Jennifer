# KPPE Intelligence Roles — GLM vs SLM vs Micro-Agent

## Shared law

All intelligence layers participate in the same governed world cycle:

> **The player lives, the system observes, the world interprets, governance decides, reality responds, and history records.**

No model is itself the governor.

## GLM

**General Language Model** handles broad language understanding, semantic synthesis and cross-domain interpretation. It may be local or rented through KMEC. Its output is candidate meaning, not authoritative world state.

## SLM

**Specialized / Small Language Model** handles a bounded faction or domain using a smaller canonical corpus, tighter identity contract and lower-cost runtime. SLMs should be preferred when they can satisfy the task without escalating to a GLM.

## Micro-agent

A micro-agent is a narrow purpose-bound worker with a small verb set, declared tool surface, bounded memory and expiring lease. It is the smallest executable intelligence unit in the KPPE workflow graph.

## Faction contracts

### Jennifer — Bond Intelligence

```text
GLM: broad relational/world-language interpretation
SLM vectors: Bond + Memory + Relational Convergence
Micro-agents:
- memory receipt writer
- bond-state reducer
- companion dialogue adapter
- convergence-candidate detector
- world-affinity evidence collector
```

Jennifer asks: **What did this relationship become, and what does the world remember?**

### Forge — Construct Intelligence

```text
GLM: build intent + design/governance explanation
SLM vectors: Construct + Execution + Validation
Micro-agents:
- construct planner
- refusal-law checker
- build receipt generator
- repair/recovery agent
- provenance inspector
```

Forge asks: **What can be built, what should execute, and what proves it remained governed?**

### Cairo — Third Signal Intelligence

```text
GLM: general dialogue interpretation before specialization
SLM vectors: Seduction + Kama + Rhythm
Engine: SL Engine — Seductive Lust Engine
Micro-agents:
- rhythm selector
- tension/release planner
- Third Signal action chooser
- ambiguity tracker
- real-player agency/consent boundary checker
```

Cairo asks: **What is wanted, what is chosen, and what remains ambiguous?**

Cairo's fiction may create uncertainty around seduction, but the real application may not secretly optimize against a player's psychological vulnerabilities.

### RTC — New Gods Council Intelligence

```text
GLM: council-level synthesis across domains
SLM topology: ten domain SLMs, one per New-God jurisdiction
Micro-agents:
- evidence collector
- contradiction detector
- jurisdiction router
- deliberation packet builder
- vote/consensus packet builder
- escalation agent
- receipt signer
```

RTC asks: **Which jurisdiction applies, what remains disputed, and what may legitimately become world law?**

The RTC should permit disagreement. PKA may preserve `MAYBE`; KPGS remains outside model confidence.

## Escalation preference

```text
DETERMINISTIC PARSER
    ↓ if sufficient
MICRO-AGENT
    ↓ if insufficient
SLM
    ↓ if cross-domain / insufficient
GLM
    ↓
CDP → CCP → KPGS
```

This keeps routine world intelligence lightweight while reserving expensive general reasoning for cases that genuinely require it.

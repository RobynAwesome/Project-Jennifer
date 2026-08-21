---
name: kppe-world-evaluation
description: Reduce Project Jennifer player/world interactions into provenance-preserving governed state using KMEC parser discipline, PKA non-closing evaluation, Emoji Protocol state tokens, GLM/SLM interpretation, CDP, CCP, KPGS validation and receipt-bearing execution.
license: MIT
compatibility: Project Jennifer Agent Skill; depends conceptually on KMEC, PKA and KPGS authority surfaces.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "0.2.0"
  runtime: packages/runtime/src/world-event-heartbeat.ts
---

# KPPE World Evaluation

Use this skill when a gameplay, NPC, economy, nature, device, companion, faction or player-language event must become governed Project Jennifer state.

## Canonical loop

```text
LIVE
→ OBSERVE
→ STRUCTURE
→ PARSE
→ EVALUATE
→ INTERPRET
→ DIVERGE
→ CONVERGE
→ VALIDATE
→ EXECUTE
→ RECEIPT
→ REFLECT
```

Executable heartbeat after structuring/parsing:

```text
StructuredWorldEvent
→ PKA
→ GLM
→ CDP
→ CCP
→ KPGS
→ Execution
→ WorldEventReceipt
```

`packages/runtime/src/world-event-heartbeat.ts` enforces that ordering. Models may interpret and propose; they do not receive world authority from the heartbeat.

## Parser law

Preserve:

- original event;
- source/provenance;
- observed time;
- actor/target;
- uncertainty;
- transformation steps;
- authority scope;
- contradiction state.

Never convert ambiguity into certainty merely because a model can produce fluent text.

## PKA law

```text
HARD invariant violation -> BLOCK / FOC_CANDIDATE
insufficient evidence    -> HOLD / MAYBE
bounded closure          -> PROPOSE / POC_CANDIDATE
```

The heartbeat treats `MAYBE/HOLD` and `FOC_CANDIDATE/BLOCK` as terminal for that evaluation pass. GLM, CDP, CCP, KPGS execution and side effects are not invoked after PKA refuses progression.

Future evidence creates a new evaluation; it does not rewrite what was known at an earlier time.

## Emoji Protocol core

```text
📍 anchored event
⏭️ progression candidate
👑 authority/governance consulted
🔔 final signal/receipt emitted
```

A complete admitted heartbeat therefore produces:

```text
📍 → ⏭️ → 👑 → 🔔
```

A PKA hold/block produces only:

```text
📍 → 🔔
```

Emoji tokens are compressed communication, not the complete authoritative payload. Consequential EP output must point to a structured receipt or packet.

## Model roles

- **GLM:** broad language/meaning interpretation; no direct authority.
- **SLM:** faction/domain bounded intelligence against a small canonical corpus.
- **Micro-agent:** narrow purpose-bound executor with declared verbs/tools and expiring authority.
- **KPGS:** validation authority outside model output.

## Faction routing

```text
Jennifer -> Bond / Memory / Relational Convergence
Forge    -> Construct / Execution / Validation
Cairo    -> Seduction / Kama / Rhythm (SL Engine)
RTC      -> council synthesis + ten domain SLM jurisdictions
```

## World-affinity boundary

Interactions may create bounded evidence that the player cares for, invests in, exploits, abandons, protects or returns to the world. `WorldAffinityEvidence` records ecosystem, signal, strength and basis only.

Treat that evidence as game-state evidence, not a permanent psychological diagnosis, and do not silently promote bounded telemetry into identity canon.

## Execution boundary

No NPC/model may directly mutate consequential economic, governance, identity, blockchain or external-device state without a governed transition and receipt.

CCP may only select a candidate that CDP actually emitted. KPGS `REJECTED` or `HITL_REQUIRED` prevents execution. A failed execution receives a failure receipt rather than being rewritten as success.

## First heartbeat proof case

The runtime test fixture uses a deliberately bounded mercy/rain scenario:

```text
player spares guardian
→ PKA: POC_CANDIDATE / PROPOSE
→ GLM: mercy / relief / renewal interpretation
→ CDP: weather response vs relationship-only response
→ CCP: selects localized rain candidate
→ KPGS: approves game-world-only consequence
→ Execution: localized rain / BLESSING
→ receipt: 📍 ⏭️ 👑 🔔
```

The test does not claim supernatural causality. It proves that symbolic world response can be proposed, governed, executed and receipted without turning model interpretation into authority.

## Premium boundary

Paid access may unlock companion forms, slots, story branches, world zones, embodiment surfaces or authored content. It may not buy True One status, RTC authority, fabricated Convergence or governance bypass.

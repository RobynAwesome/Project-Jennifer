# ADR-0008 — World Event Heartbeat

**Status:** Proposed / Code-backed POC  
**Scope:** Project Jennifer world-evaluation runtime  
**Runtime:** `packages/runtime/src/world-event-heartbeat.ts`

## Decision

Project Jennifer will process consequential world events through one ordered heartbeat:

```text
StructuredWorldEvent
        ↓
PKA evaluation
        ↓
GLM interpretation
        ↓
CDP divergence
        ↓
CCP convergence
        ↓
KPGS validation
        ↓
execution
        ↓
WorldEventReceipt
```

This is the executable form of:

> The player lives, the system observes, the world interprets, governance decides, reality responds, and history records.

and:

> The GLM interprets reality, CDP explores it, CCP converges it, KPGS validates it, execution manifests it, and the receipt remembers it.

## Why

Project Jennifer already has separate parser, PKA, CDP/CCP, KPGS, memory receipt and persistence concepts. Without one ordered runtime contract, adapters could accidentally:

- interpret before uncertainty is classified;
- let a model invent closure over `MAYBE`;
- let CCP select a candidate CDP never emitted;
- execute before KPGS governance;
- emit an Emoji Protocol token without a corresponding receipt;
- convert bounded player telemetry into permanent identity claims.

The heartbeat makes those boundaries explicit.

## Emoji Protocol trace

Emoji Protocols are a compact state surface, never authority by themselves.

```text
📍 = event anchored
⏭️ = PKA admitted progression
👑 = KPGS authority consulted
🔔 = final signal / receipt emitted
```

Full admitted path:

```text
📍 → ⏭️ → 👑 → 🔔
```

PKA `MAYBE/HOLD` or `FOC_CANDIDATE/BLOCK`:

```text
📍 → 🔔
```

## PKA non-closure

The runtime requires the following paired states:

```text
MAYBE         + HOLD
POC_CANDIDATE + PROPOSE
FOC_CANDIDATE + BLOCK
```

A contradictory adapter output is rejected rather than normalized silently.

`MAYBE/HOLD` and `FOC_CANDIDATE/BLOCK` terminate the current heartbeat before GLM invocation.

## Model boundary

The GLM may interpret meaning. CDP may generate hypotheses. CCP may select among those generated hypotheses. None of those steps receives world mutation authority.

KPGS remains outside model output and may return:

- `APPROVED`;
- `REJECTED`;
- `HITL_REQUIRED`.

Only `APPROVED` may reach execution.

## World Affinity evidence

The packet may carry bounded `WorldAffinityEvidence` such as care, return, repair, desire or stewardship. It is evidence about an observed interaction with a Project Jennifer ecosystem, not a permanent psychological classification of the human player.

The same event may later be interpreted differently by Jennifer, Forge, Cairo or RTC, but source evidence and provenance must remain stable.

## First proof case — Mercy → Rain

The first deterministic test models:

```text
player spares guardian
↓
combat telemetry becomes a structured event
↓
PKA = POC_CANDIDATE / PROPOSE
↓
GLM interprets mercy / relief / renewal
↓
CDP generates:
  A. localized symbolic rain
  B. relationship-only response
↓
CCP selects A
↓
KPGS approves a game-world-only consequence
↓
execution applies BLESSING-class localized rain
↓
receipt = 📍 ⏭️ 👑 🔔
```

This test proves ordered governance. It does not claim that mercy causes rain in reality.

## External consequence boundary

Economic, blockchain, identity, governance or physical-device effects require an explicit KPGS verdict. A `HITL_REQUIRED` verdict produces a receipt and stops before execution.

A later adapter may route an approved consequence into Solana, PostgreSQL authority, MongoDB projection, APWA UI or embedded hardware. Those integrations remain separate proof gates.

## Persistence boundary

`WorldEventReceipt` is currently a deterministic runtime receipt object. Durable Ledger-of-Time persistence is a subsequent adapter gate and must reuse Project Jennifer's established authoritative persistence rules rather than invent a parallel truth store.

## Invariants

1. PKA uncertainty precedes model interpretation.
2. Model confidence cannot promote `MAYBE`.
3. CCP cannot select an unknown CDP candidate.
4. KPGS rejection/HITL blocks execution.
5. Execution failure is receipted as failure.
6. Emoji Protocol tokens do not substitute for structured state.
7. World-affinity evidence does not become permanent identity truth automatically.
8. Receipt history is append-oriented; later evidence creates later receipts.

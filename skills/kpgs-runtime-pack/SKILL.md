---
name: kpgs-runtime-pack
description: Route an AI agent through KPGS authority, parser protocols, deployment parsing, hardware-aware model selection, and MAO/MMAO purpose-bound renter workflows. Use when a stateless renter needs the KPGS execution stack but the exact specialist skill is not yet known.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; routes to specialist KPGS skills and preserves provider-native instruction semantics through adapters.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  portable: true
  tags: kpgs, parser, model-routing, mmao, stateless-renter
---

# KPGS Runtime Pack

## Purpose

Use this as the discovery/router skill for the KPGS stateless-renter runtime pack.

Load only the smallest specialist skill required by the current workflow node:

| Need | Skill |
|---|---|
| Establish KPGS authority / renter posture | `../kpgs-authority/SKILL.md` |
| Parse external docs, skills, model cards, benchmarks, repo rules | `../kpgs-parser-protocol/SKILL.md` |
| Re-engineer provider deployment documentation | `../kpgs-deployment-parser/SKILL.md` |
| Select a model by hardware + skill + benchmark fit | `../kpgs-model-hardware-router/SKILL.md` |
| Issue purpose-bound MAO/MMAO workflow leases | `../kpgs-mmao-mao-renter/SKILL.md` |
| Govern conversational attention | `../cag-communication-attention/SKILL.md` |
| Retrieve governed evidence | `../rag-governed-retrieval/SKILL.md` |
| Enter Project Jennifer as a bounded renter | `../jennifer-stateless-renter/SKILL.md` |

## Canonical routing

```text
CURRENT HUMAN / WORLD EVENT
        ↓
KPGS AUTHORITY
        ↓
CAG
        ↓
PARSER PROTOCOL WHEN EXTERNAL MATERIAL EXISTS
        ↓
RAG WHEN KNOWLEDGE IS REQUIRED
        ↓
WORKFLOW NODE
        ↓
DEMANDED SKILLS + CAPABILITIES + TOOLS
        ↓
MODEL / HARDWARE ROUTER
        ↓
PURPOSE-BOUND LEASE
        ↓
LOCAL / CLOUD / HYBRID STATELESS RENTER
        ↓
ACTION + CONSEQUENCE + RECEIPT
        ↓
VALIDATE / BRANCH / CONVERGE / REPAIR
```

## Authority

The KPGS authority origin is `Kopano-Labs/Introduction-to-MCP`, especially the Schematics MAIN BRAIN and renter-entry/governance/protocol surfaces.

Current renter acknowledgement:

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

Do not treat this public skill package as a replacement for the current authority source. The skill tells the renter how to enter the workflow; the source repository and receipts determine what is actually authoritative and validated.

## Progressive disclosure

Do not load all KPGS skills into context by default.

```text
read this router
→ determine current node
→ load one or more demanded specialist SKILL.md files
→ inspect scripts/references only if the specialist workflow needs them
→ execute bounded task
→ return receipt
```

## Provider interoperability

Preserve the provider's native instruction format. `SKILL.md` is used directly where the runtime supports Agent Skills. Native rule/steering/API formats should be parsed and adapted without falsely renaming them as KPGS authority.

## Proof law

```text
IMPLEMENTED != VALIDATED
SKILL DISCOVERED != SKILL TRUSTED
MODEL STRONG != MODEL ELIGIBLE
DEPLOY COMMAND SUCCEEDED != DEPLOYMENT VALIDATED
RENTER EXECUTED != RENTER OWNS MEMORY
```

Return evidence and receipts for every promotion claim.

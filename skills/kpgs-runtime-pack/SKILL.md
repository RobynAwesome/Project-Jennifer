---
name: kpgs-runtime-pack
description: Route an AI agent through KPGS authority, parser protocols, skill-script tool execution, provider-specific deployment parsing, hardware-aware model selection, and MAO/MMAO purpose-bound renter workflows. Use when a stateless renter needs the KPGS execution stack but the exact specialist skill is not yet known.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; routes to specialist KPGS skills and preserves provider-native instruction semantics through adapters.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.1.0"
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  portable: true
  tags: kpgs, parser, tool-scripts, model-routing, mmao, stateless-renter
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
| Execute tools only through skill-declared scripts | `../kpgs-tool-script-runtime/SKILL.md` |
| Parse Apple/Xcode/App Store/TestFlight/notarization deployment | `../kpgs-apple-deployment-parser/SKILL.md` |
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
DEMANDED SKILLS + CAPABILITIES
        ↓
MODEL / HARDWARE ROUTER
        ↓
PURPOSE-BOUND LEASE
        ↓
SKILL.md
        ↓
DECLARED SCRIPT ENTRYPOINT
        ↓
BOUNDED TOOL PLAN
        ↓
AUTHORIZED EXECUTOR
        ↓
ACTION + CONSEQUENCE + RECEIPT
        ↓
VALIDATE / BRANCH / CONVERGE / REPAIR
```

## Tool law

KPGS does not treat tools as an unstructured bag of functions attached directly to a model.

```text
MODEL MAY REASON
MODEL MAY SELECT AN ELIGIBLE WORKFLOW
MODEL MAY LOAD THE REQUIRED SKILL

MODEL MAY NOT BYPASS:
SKILL.md → SCRIPT → TOOL PLAN → EXECUTOR → RECEIPT
```

The skill describes the workflow and declares tool classes plus script entrypoints. The script converts governed inputs into exact tool arguments. The executor performs the side effect using separately authorized credentials.

This keeps these concerns distinct:

```text
intent
workflow
skill
script
parameter construction
tool permission
credential resolution
side effect
provider consequence
validation
```

## Provider-specific parser law

Do not flatten unlike deployment systems into one generic schema implementation.

The normalized `DeploymentRecipe` is a common receipt surface, but provider adapters may preserve very different state machines.

For example:

```text
Google Cloud Run
source/image → gcloud/API deploy → revision/service → URL/health

Apple distribution
project/workspace → scheme → archive → sign/export → upload/distribute
→ Apple processing → TestFlight/App Review/notarization → release
```

Both can produce a KPGS deployment receipt without pretending their deployment mechanics are identical.

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
→ load demanded specialist SKILL.md
→ parse provider source when required
→ load only the script declared by that skill
→ compile bounded tool plan
→ execute through authorized adapter
→ return consequence + receipt
```

## Provider interoperability

Preserve the provider's native instruction and deployment format. `SKILL.md` is used directly where the runtime supports Agent Skills. Native rule/steering/API/deployment formats should be parsed and adapted without falsely renaming them as KPGS authority.

## Proof law

```text
IMPLEMENTED != VALIDATED
SKILL DISCOVERED != SKILL TRUSTED
SCRIPT DECLARED != SCRIPT EXECUTED
TOOL EXIT 0 != WORKFLOW VALIDATED
MODEL STRONG != MODEL ELIGIBLE
UPLOAD ACCEPTED != PROVIDER PROCESSING COMPLETE
RENTER EXECUTED != RENTER OWNS MEMORY
```

Return evidence and receipts for every promotion claim.

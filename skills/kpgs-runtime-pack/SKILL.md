---
name: kpgs-runtime-pack
description: Route an AI agent through KPGS authority, parser protocols, CI proof gates, engine qualification, skill-script tool execution, provider-specific deployment parsing, hardware-aware model selection, and MAO/MMAO purpose-bound renter workflows.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; routes to specialist KPGS skills and preserves provider-native instruction semantics through adapters.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.2.0"
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  portable: true
  tags: kpgs, parser, ci-proof, engine-qualification, tool-scripts, model-routing, mmao, stateless-renter
---

# KPGS Runtime Pack

## Purpose

Use this as the discovery/router skill for the KPGS stateless-renter runtime pack. Load only the smallest specialist skill required by the current workflow node.

| Need | Skill |
|---|---|
| Establish KPGS authority / renter posture | `../kpgs-authority/SKILL.md` |
| Parse external docs, skills, model cards, benchmarks, repo rules | `../kpgs-parser-protocol/SKILL.md` |
| Classify CI failure and prove exact-SHA validation state | `../kpgs-ci-proof-gate/SKILL.md` |
| Qualify/quarantine an engine/runtime capability lane | `../kpgs-engine-qualification/SKILL.md` |
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
CI PROOF GATE WHEN IMPLEMENTATION/VALIDATION IS CLAIMED
        ↓
ENGINE QUALIFICATION GATE
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

## CI / proof law

A runtime may exist in source and still be FOC with respect to the claim that it works. Qualification and proof state are separate from implementation state.

```text
FOC
→ CODED_UNVALIDATED
→ TESTED
→ CI_VALIDATED
→ RUNTIME_PROVEN
```

Required failures stop promotion. A green run on an older SHA does not validate newer code. Artifact/diagnostic publication must not be mistaken for the application proof gate.

## Engine qualification law

```text
BENCHMARK SCORE
→ CURRENT ENGINE QUALIFICATION
→ HARD ELIGIBILITY
→ WORKFLOW SKILLS/CAPABILITIES
→ MODEL/HARDWARE ROUTER
```

An exact engine/runtime capability lane can be `qualified`, `experimental`, `quarantined`, or `unknown`. Explicit human/debug override may permit experimental execution, but it cannot manufacture validated proof.

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

## Provider-specific parser law

Do not flatten unlike deployment systems into one generic schema implementation. The normalized `DeploymentRecipe` is a common receipt surface, but provider adapters may preserve very different state machines.

```text
Google Cloud Run
source/image → deploy → revision/service → URL/health

Apple distribution
project/workspace → scheme → archive → sign/export → upload/distribute
→ Apple processing → TestFlight/App Review/notarization → release
```

## Authority

The KPGS authority origin is `Kopano-Labs/Introduction-to-MCP`. Current renter acknowledgement:

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

Public registries, community repositories and provider documentation are evidence/discovery surfaces inside their scopes. They do not silently replace KPGS authority.

## Progressive disclosure

```text
read this router
→ determine current node
→ load demanded specialist SKILL.md
→ parse provider/source evidence when required
→ prove current implementation/engine state when execution depends on it
→ load only the script declared by that skill
→ compile bounded tool plan
→ execute through authorized adapter
→ return consequence + receipt
```

## Proof law

```text
IMPLEMENTED != VALIDATED
OLD GREEN SHA != CURRENT GREEN SHA
SKILL DISCOVERED != SKILL TRUSTED
SCRIPT DECLARED != SCRIPT EXECUTED
TOOL EXIT 0 != WORKFLOW VALIDATED
MODEL STRONG != MODEL ELIGIBLE
FAILED REQUIRED CI != POC
UPLOAD ACCEPTED != PROVIDER PROCESSING COMPLETE
RENTER EXECUTED != RENTER OWNS MEMORY
```

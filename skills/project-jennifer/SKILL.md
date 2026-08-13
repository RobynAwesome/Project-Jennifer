---
name: project-jennifer
title: "Project Jennifer Governed Skill Router"
version: "1.2.0"
status: "POC"
class: "Repository Umbrella Skill"
repository: "RobynAwesome/Project-Jennifer"
ecosystem_anchor: "Kopano-Labs/Introduction-to-MCP"
entrypoint: "skills.md"
execution_model: "Discover -> Classify -> Route -> Execute -> Validate -> Receipt"
---

# Project Jennifer Governed Skill Router

## Purpose

Use this skill when a renter/agent needs to work with **Project Jennifer** but does not yet know which specialist capability applies, or when a task crosses multiple Jennifer systems.

This is the portable **repo-level entry skill**. It is a router, not a replacement for current repository inspection.

> **Start with the map. Then read the current source. Then execute the smallest governed workflow that satisfies the human's instruction.**

## Authority order

```text
current human instruction
        ↓
GitHub Project Memory Registry / ecosystem context when available
        ↓
Kopano-Labs/Introduction-to-MCP when ecosystem doctrine is relevant
        ↓
Project Jennifer current repository state
        ↓
this umbrella skill + specialist skill
        ↓
branch / PR / CI / runtime receipts
```

Never let an old skill description override newer repository evidence.

## Stateless-renter invariant

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

The renter does not own Project Jennifer memory, canon, authority, identity, or user intent. It receives a bounded task and returns work/evidence/receipts.

## Routing table

| Intent | Route |
|---|---|
| Expand possibilities / alternative architectures / concepts | `../cdp-conceptual-divergence/SKILL.md` |
| Evaluate a conceptual subject and create evaluation/evolution receipts | `../ceep-conceptual-evaluation/SKILL.md` |
| Parse authoritative KPGS VOC POC branch and emergent FOC-G## groups | `../poc-foc-registry-parser/SKILL.md` |
| Separate evidence-bearing POC from FOC risk | `../poc-foc-evaluation/SKILL.md` |
| Gate a consequential runtime mutation through POC/FOC + Memory Receipt admission | `../poc-foc-runtime-gate/SKILL.md` |
| Decide which conceptual pattern survives and should converge | `../ccp-conceptual-convergence/SKILL.md` |
| Govern a genuinely new agent-originated concept | `../ncmp-concept-intake/SKILL.md` |
| Decide what deserves attention now | `../cag-communication-attention/SKILL.md` |
| Retrieve governed evidence | `../rag-governed-retrieval/SKILL.md` |
| Use another model/provider/local runtime | `../jennifer-stateless-renter/SKILL.md` |
| Consequential relationship-bearing inference | `../forge-rivm/SKILL.md` |
| Express locally authored relational attention | `../authored-relational-attention/SKILL.md` |
| Route authority, runtime, validation, companion, storage, web/API, asset, CI, provider or human/crisis implementation work | `../SKILL.md` |
| Issue/evaluate memory receipts | `../../packages/memory/src/memory-receipt-engine.ts` |
| Read/write governed context | `../../packages/memory/src/gsmb.ts` |
| Validate candidate state/action | `../../packages/validation/` |
| Apply governance/authority boundaries | `../../packages/governance/` + `../../packages/authority/` |
| Work with companions / relationships | `../../packages/runtime/` + `../../packages/shared/src/companions.ts` + `relationships.ts` |
| Work with Project Wify Jennifer Genesis / Convergence lore | `../../docs/lore/project-wify-jennifer/` |
| Work with Project Waifu Forge relational runtime/lore | `../../assets/Project-Waifu-Forge/` + `../../docs/lore/waifu-forge-constructs.md` |

## Core conceptual cycle

```text
CDP
→ CEEP
→ POC-vs-FOC
→ CCP
→ canonical/evolution receipt
→ NCMP when new agent-originated concepts require human recognition + registration
```

For consequential runtime actions, a second execution membrane applies:

```text
parsed VOCRegistry
→ POCFOCActionEvaluator
→ shared POCFOCActionEvaluation
→ POCFOCRuntimeGate
→ MemoryReceiptEngine
→ mutate OR block
```

### CDP

Conceptual Divergence Protocol expands the possibility space: *what could this become?*

Current boundary: canonical semantics + portable skill exist, but no dedicated `packages/conceptual/src/cdp/` implementation module is currently proven.

### CEEP

Conceptual Evaluation Engine evaluates the candidate/subject and emits an `EvaluationReceipt` plus `FrameworkEvolutionReceipt`.

### POC-vs-FOC

Makes evidence strengths and FOC risks explicit before promotion.

When KPGS immune-registry semantics themselves are required, parse `Kopano-Labs/Introduction-to-MCP/poc-vs-foc/` through `poc-foc-registry-parser` first. The resulting `FOC-G##` operational groups remain separate from Jennifer's semantic `FOCType` evaluation risks.

### Runtime POC/FOC gate

Use `poc-foc-runtime-gate` when an action can actually change world, relationship, companion, memory, economy or other consequential runtime state. Conceptual evaluation alone does not authorize mutation.

The runtime gate requires the shared POC/FOC action evaluation, verifies evidence binding, issues a Memory Receipt, and only then runs the mutation callback when the result is admitted `ACCEPT`.

### CCP

Conceptual Convergence Protocol consumes framework-evolution evidence and returns a canonical decision receipt. Current TypeScript exists under `packages/conceptual/src/ccp/`.

### NCMP

New Concept MMAO Protocol governs agent-originated novelty. Agents may propose; only the human architect may recognize an NCMP concept. Recognition, validation, and registration remain separate transitions.

## Repository-context discipline

Do not load all of Project Jennifer automatically.

```text
1. read skills.md
2. classify the task
3. select the smallest relevant specialist skill(s)
4. inspect named source/implementation files
5. retrieve more evidence only when required
6. execute
7. validate
8. emit receipt / proof boundary
```

This is CAG applied to repository work: **more context is not automatically better context.**

## Source authority

Before using a source, preserve its class and lane. Do not flatten:

```text
PRIVATE_SOVEREIGN
PUBLIC_DERIVATIVE
EXECUTABLE_PROTOCOL
PROJECT_CANON
HISTORICAL_REFERENCE
RESEARCH_REFERENCE
VISUAL_SOURCE
VISUAL_DERIVATIVE
```

Source authority is defined in `../../governance/source-authority-registry.json`.

## Proof-state discipline

Keep these independent:

```text
specified
portable skill
coded
unit tested
validated in CI
runtime-proven
deployed
canonical
```

A skill can be useful before a dedicated engine exists. That never authorizes a fabricated execution receipt.

## Execution output

For consequential work, preserve:

```text
selected skill(s)
source / implementation refs
observed proof state
work performed
validation result
receipt / PR / commit / runtime evidence
unproven remainder
```

## Success condition

The umbrella skill succeeds when a renter can enter Project Jennifer from a single repo-level surface, select the correct specialist capability, preserve authority and proof boundaries, complete the requested work, and leave inspectable evidence instead of invented continuity.

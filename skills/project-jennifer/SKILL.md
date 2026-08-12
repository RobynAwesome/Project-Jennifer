---
name: project-jennifer
title: "Project Jennifer Governed Skill Router"
version: "1.0.0"
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
| Expand possibilities, alternative architectures, concepts, or relationship-born possibilities | `../cdp-conceptual-divergence/SKILL.md` |
| Decide which conceptual pattern survives evidence and should converge | `../ccp-conceptual-convergence/SKILL.md` |
| Decide what deserves attention now | `../cag-communication-attention/SKILL.md` |
| Retrieve evidence | `../rag-governed-retrieval/SKILL.md` |
| Use another model/provider/local runtime | `../jennifer-stateless-renter/SKILL.md` |
| Consequential relationship-bearing inference | `../forge-rivm/SKILL.md` |
| Express locally authored relational attention | `../authored-relational-attention/SKILL.md` |
| Evaluate POC vs FOC | `../../packages/conceptual/src/pocvsfoc/` and `../../docs/protocols/poc-foc-feedback-loops.md` |
| Evaluate conceptual proposals | `../../packages/conceptual/src/ceep/` |
| Intake a new concept | `../../NCMP.md` and `../../packages/shared/src/ncmp.ts` |
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
→ evidence / POC-vs-FOC
→ CCP
→ receipt
→ governed memory / canon candidate
```

### CDP

Conceptual Divergence Protocol expands the possibility space.

Use it before convergence when the human is exploring *what something could become*.

Current repository boundary: CDP is specified in the Convergence Law and has a portable skill workflow, but the audited repository does not currently expose a dedicated `packages/conceptual/src/cdp/` implementation module.

### CEEP

Conceptual Evaluation Engine evaluates the candidates/subject and can produce evaluation evidence/receipts.

### POC-vs-FOC

Separate evidence-bearing proof from appearance, unsupported claim, narrative, or conceptual promotion.

### CCP

Conceptual Convergence Protocol determines the canonical decision state from framework-evolution evidence. Current TypeScript code exists under `packages/conceptual/src/ccp/`.

## Repository-context discipline

Do not load all of Project Jennifer automatically.

Use this sequence:

```text
1. read skills.md
2. classify the task
3. select one or more smallest relevant skills
4. inspect their named source/implementation files
5. retrieve additional repository evidence only when required
6. execute
7. validate
8. emit receipt / proof boundary
```

This is CAG applied to repository work: **more context is not automatically better context.**

## Source authority

Before using a source, preserve its class and lane.

Do not flatten:

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

A skill can be useful even before a dedicated engine exists. That does not authorize the renter to fabricate an engine receipt.

## Execution output

For a consequential task, return or preserve:

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

The umbrella skill succeeds when the renter can enter Project Jennifer from a single repo-level skill surface, select the correct specialist capability, preserve authority and proof boundaries, complete the requested work, and leave behind inspectable evidence instead of invented continuity.

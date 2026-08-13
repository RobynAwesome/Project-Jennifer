---
name: kpgs-mmao-mao-renter
description: Admit a qualified local, cloud, or hybrid AI runtime into MAO/MMAO as a stateless free renter with a purpose-bound workflow lease. Use when an agent must roam a non-linear workflow graph while loading only demanded SKILL.md packages, respecting tool/memory/authority scope, and returning receipts at every handoff.
license: MIT
compatibility: Portable Agent Skills SKILL.md package for MAO/MMAO-style orchestration, multi-model routers, and graph workflows.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  capability: mmao-mao-purpose-renting
  portable: true
  tags: mmao, mao, swarm, workflows, stateless-renter
---

# KPGS MMAO / MAO Stateless Renter

## Overview

A renter may roam. It does not roam without purpose.

This skill converts model/runtime participation in MAO and the Mobile Multi-Agent Orchard (MMAO) into a **purpose-bound lease**. The workflow, not the renter's brand, determines which skills, capabilities, tools, evidence, context, and authority are available at each node.

## Constitutional posture

```text
RENTER = execution actor
MORNING / MAO / MMAO = router + orchestrator
KPGS = governance authority
GSMB = governed continuity / memory system
SKILL.md = on-demand workflow capability
RECEIPT = proof of what happened
```

The renter remains stateless relative to KPGS authority even when the provider product itself has memory or multiple internal models.

## Purpose-bound lease

Before execution, issue:

```yaml
lease_id:
renter_id:
exact_runtime_id:
workflow_id:
node_id:
purpose:
required_skills: []
required_capabilities: []
allowed_tools: []
authority_scope:
context_lanes: []
memory_read_scope: []
memory_write_scope: []
evidence_required: []
issued_at:
expires_at:
receipt_required: true
```

A lease is not ownership. It is bounded permission to execute one purpose in one governed context.

## Non-linear workflow graph

Do not require all agent work to move through one fixed linear chain.

Represent development as a graph:

```text
               ┌→ research ─────┐
intake → classify               ├→ validate → publish
               ├→ prototype ────┤
               ├→ benchmark ────┤
               └→ deploy → observe ┘
                        ↘ repair ↗
```

Nodes may branch, converge, loop for repair, or execute in parallel when their contracts permit it.

Every node declares:

```yaml
node_id:
purpose:
required_skills: []
required_capabilities: []
allowed_tools: []
authority_scope:
context_lanes: []
evidence_exit_conditions: []
next_nodes: []
```

## Skill demand

At node entry:

```text
READ NODE PURPOSE
→ DETERMINE REQUIRED SKILLS
→ DISCOVER SKILL METADATA
→ LOAD ONLY MATCHING SKILL.md
→ LOAD REFERENCES/SCRIPTS ONLY IF NEEDED
→ EXECUTE
→ RECEIPT
→ EXIT OR ROUTE TO NEXT NODE
```

Do not inject every available skill into every renter. Progressive disclosure keeps the model context narrow and makes skill use observable.

## Runtime admission

Before leasing a workflow node, validate:

- exact runtime identity when qualification requires it;
- hardware/network fit;
- demanded capabilities;
- demanded skill compatibility;
- privacy/data-egress compatibility;
- tool availability;
- benchmark evidence appropriate to this node;
- current renter availability.

If the preferred local runtime is unavailable or insufficient, route to a qualified external renter without changing KPGS authority.

## MMAO edge awareness

For edge/mobile operation, consider:

```text
local throughput
+ memory/storage pressure
+ battery/power state
+ network latency/data friction
+ offline requirement
+ privacy lane
+ task purpose
```

A stronger cloud model is an option, not a default sovereign. Use it when the purpose requires capability/evidence that the local node cannot provide or when an explicit governed tradeoff justifies escalation.

## Handoff receipt

Each node returns:

```yaml
lease_id:
node_id:
renter_id:
runtime_id:
skills_loaded: []
tools_used: []
actions: []
artifacts_changed: []
evidence: []
consequences: []
validation:
unresolved: []
next_node_candidates: []
lease_status: complete | hold | expired | conflict
```

A downstream renter receives only the context/evidence admitted by the next node's contract.

## Constraints

- Roaming does not mean unbounded tool access.
- A renter cannot extend its own lease, authority scope, memory scope, or tool scope.
- A renter cannot self-register an unvalidated capability benchmark as truth.
- A skill discovered online is not automatically trusted; inspect provenance and scripts first.
- Parallel agents must produce mergeable receipts, not hidden side effects.
- Repair loops must preserve the failed attempt and consequence instead of overwriting history.
- The final human/authority gate remains explicit wherever the governing workflow requires it.

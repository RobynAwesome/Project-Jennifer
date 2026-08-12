---
name: cdp-conceptual-divergence
title: "Conceptual Divergence Protocol"
protocol_id: "CDP"
version: "1.0.0"
status: "SPECIFIED_PORTABLE_WORKFLOW"
class: "Project Jennifer Conceptual Skill"
canonical_source: "docs/lore/project-wify-jennifer/CONVERGENCE-LAW.md"
dedicated_runtime_module: false
execution_model: "Bound -> Diverge -> Preserve Alternatives -> Evaluate Later"
---

# CDP — Conceptual Divergence Protocol

## Purpose

CDP expands a known state into a governed possibility space **before** Project Jennifer attempts conceptual convergence.

Canonical question:

> **What could this become?**

CDP is intentionally divergent. It creates room for alternative architectures, interpretations, configurations, mechanisms, relationship patterns, forms, or solution paths without prematurely declaring one canonical.

## Current implementation boundary

At the time this skill was packaged, Project Jennifer's current repository contains:

- canonical CDP semantics in `docs/lore/project-wify-jennifer/CONVERGENCE-LAW.md`;
- a coded CCP implementation under `packages/conceptual/src/ccp/`;
- CEEP and POC-vs-FOC implementation under `packages/conceptual/src/`;
- **no dedicated `packages/conceptual/src/cdp/` runtime module.**

Therefore:

```text
CDP workflow skill execution = allowed
claim that Jennifer CDP runtime code executed = forbidden without a later receipt
```

This distinction must travel with the skill.

## Core law

```text
known state
  ├─ possibility A
  ├─ possibility B
  ├─ possibility C
  ├─ possibility D
  └─ unknown possibility
```

Pure divergence without later governance becomes chaos. CDP is not the final decision engine.

## Activate when

Use CDP when the human asks to:

- brainstorm distinct paths;
- explore what a system/concept/relationship/mechanic could become;
- challenge a default architecture;
- search for a third/fourth path rather than optimize one assumed answer;
- generate candidate frameworks before evaluation;
- intentionally prevent premature convergence;
- explore forms, mechanisms, alignments, workflows, or world-state possibilities.

Do not use CDP merely to inflate option count when the user already asked for a final decision.

## Inputs

Minimum:

```text
current_state
human_goal
hard_constraints
known_evidence
forbidden_or_out_of_scope_paths
```

Optional:

```text
source_authority
privacy_lane
time_or_cost_bounds
number_of_candidate_families
existing_failed_paths
relationship_context
```

## Workflow

### 1. Bound the current state

Separate:

```text
observed / repository-proven
user-declared
retrieved evidence
inference
unknown
```

Do not start divergence by quietly converting assumptions into facts.

### 2. Preserve hard constraints

Constraints are not candidates. Do not "brainstorm away" authority, privacy, safety, ontology, budget, current repository truth, or an explicit human boundary.

### 3. Generate genuinely different candidate families

Prefer structural difference over cosmetic variants.

Bad divergence:

```text
A = same design in blue
B = same design in green
C = same design in purple
```

Better divergence:

```text
A = local-first architecture
B = cloud-assisted architecture
C = federated edge architecture
D = human-mediated workflow
E = unknown / needs evidence
```

### 4. Keep an explicit unknown branch

CDP should allow:

```text
UNKNOWN POSSIBILITY
```

when evidence is insufficient. Do not force completeness.

### 5. Record why each candidate differs

For every candidate preserve:

```text
candidate_id
core hypothesis
what changes from current state
required evidence
governance risks
potential upside
known contradiction
proof state
```

### 6. Do not self-converge

CDP may identify obvious invalid candidates, but it should not silently select the winner unless the task explicitly includes evaluation/convergence.

If convergence is required, pass candidates forward:

```text
CDP
→ CEEP
→ POC-vs-FOC / evidence
→ CCP
```

## Output contract

Recommended shape:

```yaml
protocol: CDP
current_state: "..."
constraints: []
candidates:
  - id: cdp-a
    hypothesis: "..."
    difference: "..."
    evidence_needed: []
    risks: []
    proof_state: "hypothesis"
unknowns: []
recommended_next_protocol: CEEP
runtime_claim:
  dedicated_cdp_engine_executed: false
```

## Hard failures

Reject or correct the workflow if it:

- presents generated possibilities as current facts;
- calls a candidate POC without evidence;
- violates explicit source/privacy boundaries;
- treats a historical source as current canon without receipt;
- generates many superficial variants and calls that divergence;
- silently converges while claiming to remain divergent;
- claims dedicated CDP runtime execution when only the portable reasoning workflow ran.

## Relationship to CCP

```text
CDP asks: what could this become?
CCP asks: what consistently survives evaluation and evidence?
```

The pair is deliberately asymmetric.

CDP widens. CCP narrows.

## Success condition

CDP succeeds when the possibility space becomes broader **without becoming epistemically sloppy**, the alternatives remain distinguishable, constraints remain intact, and the next evaluator receives structured candidates rather than a disguised favorite.

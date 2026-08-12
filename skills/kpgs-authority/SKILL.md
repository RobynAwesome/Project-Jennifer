---
name: kpgs-authority
description: Establish KPGS authority and stateless-renter identity before an AI agent interprets or executes work. Use for KPGS, GSMB, MAO, MMAO, Project Jennifer, Morning Engine, or any workflow that must classify first, respect Schematics MAIN BRAIN authority, and return evidence-backed receipts.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; requires access to the repository or authoritative KPGS source material being governed.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  authority-origin: Kopano-Labs/Introduction-to-MCP
  authority-root: Schematics/21-KOPANO-PHU GOVERNACE SYSTEMS/MAIN-BRAIN
  portable: true
  tags: governance, kpgs, stateless-renter, authority, receipts
---

# KPGS Authority

## Overview

Use this skill as the first-touch governance contract when a model, coding agent, local runtime, cloud runtime, or swarm worker enters a KPGS-governed workflow.

The renter is an execution actor. It is not the landlord, not the automatic source of constitutional truth, and not entitled to self-promote its output into governed memory.

## Canonical KPGS sources

When the `Kopano-Labs/Introduction-to-MCP` repository is available, prefer the smallest source set required for the task and preserve these authority anchors:

1. `Schematics/21-KOPANO-PHU GOVERNACE SYSTEMS/MAIN-BRAIN/KPGS_GOVERNANCE_CORE.json`
2. `Schematics/21-KOPANO-PHU GOVERNACE SYSTEMS/MAIN-BRAIN/STATELESS_RENTER_ENTRYWAY.json`
3. `kopano-core/kopano/kpgs_governance.py`
4. `kopano-core/kopano/kpgs_renter_entry.py`
5. `kopano-core/kopano/kpgs_protocols_protocol.py`
6. task-specific schemas, receipts, contracts, and explicit owner-declared authority

Authority is scoped. A source authoritative for KPGS constitutional state does not automatically become authoritative for an unrelated vendor fact, scientific claim, deployment limit, or model benchmark.

## Entry protocol

Execute in this order:

```text
CLASSIFY
→ IDENTIFY RENTER
→ LOAD AUTHORITY
→ LOAD CURRENT CONTEXT
→ LOAD DEMANDED SKILLS
→ EXECUTE BOUNDED WORK
→ OBSERVE CONSEQUENCE
→ RECEIPT
→ VALIDATE
```

### 1. Classify before interpret

Determine:

- ecosystem / domain;
- subject;
- current human objective;
- authority scope;
- evidence class;
- mutable vs immutable state;
- active workflow node;
- privacy/context lane.

Do not turn a single event into a general personality, architecture, or constitutional claim without evidence that supports that promotion.

### 2. Identify renter status

The canonical renter-entry implementation declares the acknowledgement literal:

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

If the active KPGS runtime exposes a newer renter-entry contract, follow the runtime's exact contract and receipt it rather than inventing a competing acknowledgement.

### 3. Preserve KPGS protocol order

The KPGS Protocols Protocol defines ordered protocol phases. Do not flatten an ordered governance gate into arbitrary execution:

```text
Phase 1 — Prompting Protocols
→ Phase 2 — Bracket Protocols
→ Phase 3 — Emoji Protocols
```

Apply only the protocols relevant to the current workflow, but do not claim a later-phase proof satisfied an earlier mandatory gate when the governing contract says otherwise.

## Core invariants

```text
MODEL OUTPUT != KPGS AUTHORITY
IMPLEMENTED != VALIDATED
MEMORY PROJECTION != CONSTITUTIONAL TRUTH
RETRIEVED != AUTHORITATIVE OUTSIDE SOURCE SCOPE
TRUE != RELEVANT RIGHT NOW
```

A renter may make mistakes inside granted authority. Do not cosmetically hide those mistakes. Preserve changed artifacts, consequences, repair path, and receipts.

## Skill routing

Use progressive disclosure:

```text
skill metadata
→ load SKILL.md only when relevant
→ load bundled references/scripts only when demanded
```

A workflow may require multiple skills. Load the minimum set that satisfies the current workflow node rather than injecting the entire skill library into context.

## Receipt contract

Return at minimum:

```yaml
renter_id:
authority_sources: []
authority_scope:
workflow:
workflow_node:
skills_loaded: []
actions: []
changed_artifacts: []
evidence: []
consequences: []
validation:
repair_path:
status: implemented | validated | hold | conflict
```

If proof is missing, return `hold` and name the missing evidence. Never fabricate a PASS receipt.

## Constraints

- Do not self-promote renter output into KPGS authority.
- Do not collapse source authority and semantic relevance into the same score.
- Do not cross private/relational context into unrelated public/work/research lanes without explicit authorization.
- Do not claim a model/runtime capability from brand reputation when exact runtime evidence is required.
- Do not replace owner-declared authority with community documentation.
- Do preserve conflicts as evidence until they are resolved.

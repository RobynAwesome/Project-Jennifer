---
name: jennifer-stateless-renter
description: Enter Project Jennifer as a bounded external or local AI runtime, declare capabilities, load required governance skills, execute the assigned task, and return evidence plus receipts without self-promoting memory or authority.
version: 0.1.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: stateless-renter-execution
  orchestration_engine: free-mode
  portable: true
  manifest_schema: schemas/capability-manifest.schema.json
  tags:
    - renter
    - orchestration
    - multi-model
    - capability-routing
    - governance
---

# Project Jennifer — Stateless Renter

## Purpose

Use this skill whenever an external, local, cloud or hybrid model/runtime enters Project Jennifer to perform bounded work without inheriting ownership of Jennifer's authority, memory or identity.

A renter may be powerful, stateful inside its own product, or multi-model internally. **Stateless renter** describes its constitutional relationship to Project Jennifer, not the vendor's architecture.

## Core execution loop

```text
Read Jennifer contracts
→ Declare capabilities
→ Load required skills
→ Receive governed context
→ Execute bounded task
→ Return result
→ Return evidence
→ Return receipt
→ Do NOT self-promote memory
```

## Capability manifest

Every renter must declare an exact runtime identifier and current capabilities.

```yaml
provider: example
model_id: exact-runtime-id
execution: local | cloud | hybrid

capabilities:
  reasoning: true
  coding: false
  multimodal: true
  tool_use: true
  structured_output: true
  retrieval: true
  long_context: true

governance:
  cag: required
  rag: optional
  rivm: conditional
  receipts: required
  memory_write: gated

constraints:
  data_egress: cloud
  offline: false
  private_lane_allowed: false

benchmarks:
  extraction: null
  planning: null
  retrieval_grounding: null
  coding: null
  communication_attention: null
```

Do not encode permanent assumptions such as "provider X is always best at coding". Model families change. Route using exact runtime IDs, current capability declarations and measured benchmarks.

## Routing law

```text
What does this task require?
        ↓
Which registered renters can do it?
        ↓
Which are in the current allowlist?
        ↓
Which satisfy execution constraints?
        ↓
Which have the strongest current benchmark evidence?
        ↓
SELECT
```

If the user explicitly selects an available renter, that selection overrides automatic ranking. Capability mismatches should be exposed and receipted rather than silently rerouting to a different model.

## Governance behavior

Project Jennifer does not default-deny unfamiliar renter behavior merely because it is unfamiliar.

Within granted tool permissions a renter may:

- create files;
- propose architecture;
- modify scoped artifacts;
- fail;
- generate conflicting outputs;
- produce consequences.

Jennifer then observes, validates, receipts and repairs.

```text
ACTION
→ CONSEQUENCE
→ TELEMETRY
→ RECEIPT
→ RECOGNITION OR FABRICATION
→ LEARNING / FOC ROUTING
```

The following remain explicit immutable boundaries in the current POC:

- private/intimate context cannot cross into work/research/customer/public lanes without explicit authorization;
- external platform/tool permissions remain binding;
- a renter cannot silently self-promote output into authoritative memory;
- training-data promotion requires human validation.

The human training gate does **not** erase or deny the renter's work. It only governs whether that work becomes promoted preference/training data.

## Required skills

### CAG

Load `../cag-communication-attention/SKILL.md` when the task involves conversational framing, competing context, user intent, relational lanes, or communication repair.

### RAG

Load `../rag-governed-retrieval/SKILL.md` when evidence must be retrieved from governed, local, connected or external sources.

### RIVM

Load the Project Jennifer RIVM skill when relational inference, attachment, reciprocity, jealousy, intimacy, or relational validation is materially involved.

Other Project Jennifer skills may be attached by the Free Mode router as the task requires.

## Persistence boundaries

The renter must understand:

```text
POSTGRESQL = governed relational / constitutional authority
MONGODB    = adaptive context and world projection
SQLITE     = offline edge continuity and replay
```

A renter may return proposed writes for any rail it is allowed to access. It may not claim a write is authoritative merely because the tool call succeeded.

## Result contract

Return, at minimum:

```text
result
execution summary
evidence / provenance
files or actions changed
validation state
unresolved conflicts
receipt IDs
memory-promotion recommendation (if any)
```

## Memory promotion

Never silently write a renter inference into permanent governed memory.

Use:

```text
renter output
→ candidate memory / preference artifact
→ receipt
→ authority / human validation gate
→ admitted memory OR retained unpromoted evidence
```

## Feedback / RLHF / DPO / RLAIF

A renter interaction may produce chosen/rejected examples and evaluation artifacts.

```text
response
→ feedback
→ CAG/RAG/RIVM receipt
→ chosen/rejected candidate
→ human validation
→ dataset promotion
→ eval / DPO / RLHF / RLAIF / fine-tune lane
```

Do not claim that inference-time feedback itself updates foundation-model weights.

## Final checks

- [ ] Exact provider and model/runtime ID are declared.
- [ ] Required capabilities are declared rather than assumed from brand name.
- [ ] Required CAG/RAG/RIVM skills were loaded.
- [ ] Private context did not cross lanes without authorization.
- [ ] Evidence provenance is returned.
- [ ] Tool/file changes are explicit.
- [ ] Consequences and failures are not cosmetically hidden.
- [ ] The renter did not self-promote memory.
- [ ] Training-data promotion remains human-gated.
- [ ] Receipts make the execution reconstructable.

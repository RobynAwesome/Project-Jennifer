---
name: kpgs-model-hardware-router
description: Select an exact AI model/runtime for a workflow by hard hardware fit, privacy/offline constraints, demanded skills, capabilities, measured benchmarks, latency, and cost. Prefer a model that fits the actual hardware when sufficient, while allowing stronger benchmark cloud/hybrid renters when the workflow justifies escalation.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; accepts local, cloud, and hybrid runtime manifests plus observed hardware profiles.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  capability: model-hardware-routing
  portable: true
  tags: model-routing, hardware, benchmarks, ollama, mmao
---

# KPGS Model Hardware Router

## Overview

The strongest model is not automatically the correct model.

Default routing should choose a runtime that can satisfy the workflow **on the hardware and network actually available**. Stronger benchmark models may join as cloud/hybrid stateless renters when their added capability is required or produces enough measured value to justify escalation.

## Inputs

### HardwareProfile

```yaml
hardware_id:
platform:
cpu:
cpu_cores:
ram_gb:
gpu:
vram_gb:
free_storage_gb:
network_available:
power_state:
observed_at:
```

Unknown values remain `unknown`; do not guess missing RAM, VRAM, GPU, or accelerator capability.

### ModelRuntimeProfile

```yaml
renter_id:
provider:
exact_runtime_id:
execution: local | cloud | hybrid
qualified: true | false

requirements:
  min_ram_gb:
  min_vram_gb:
  disk_gb:
  network_required:

capabilities: []
skills_supported: []
context_window:
offline:

benchmarks:
  extraction:
  planning:
  retrieval_grounding:
  coding:
  communication_attention:
  multimodal:
  tool_execution:

observed:
  latency_ms:
  cost:
  benchmark_receipts: []
```

### WorkflowDemand

```yaml
workflow_id:
purpose:
required_capabilities: []
required_skills: []
require_offline:
private_lane_policy:
prefer_local: true
allow_external: true
max_latency_ms:
max_cost:
benchmark_weights: {}
```

## Routing sequence

```text
OBSERVE HARDWARE
→ PARSE EXACT RUNTIME PROFILES
→ APPLY HARD ELIGIBILITY
→ VERIFY DEMANDED SKILLS
→ SCORE MEASURED BENCHMARKS
→ APPLY LOCAL-SOVEREIGNTY PREFERENCE
→ COMPARE EXTERNAL QUALITY UPLIFT
→ SELECT RENTER
→ ISSUE PURPOSE-BOUND LEASE
→ RECEIPT ROUTE
```

## Hard eligibility first

A runtime is ineligible for the current node when a hard requirement cannot be satisfied, for example:

- known RAM/VRAM requirement exceeds observed hardware;
- workflow requires offline operation but renter requires network;
- required capability is absent;
- required `SKILL.md` workflow cannot be supplied or adapted;
- private-lane policy is incompatible with data egress;
- exact runtime is not available where exact qualification is mandatory.

Do not compensate for a hard eligibility failure with a high benchmark score.

## Benchmark scoring

Use workflow-specific weights rather than one global leaderboard.

Example:

```yaml
coding-execution:
  coding: 0.50
  planning: 0.25
  retrieval_grounding: 0.10
  communication_attention: 0.10
  extraction: 0.05

local-governed-assistant:
  communication_attention: 0.30
  retrieval_grounding: 0.30
  planning: 0.20
  extraction: 0.15
  coding: 0.05
```

Only observed/qualified benchmark evidence contributes to canonical ranking. Missing benchmark data is `unknown`, not zero-quality proof.

## Local-first selection law

When a qualified local runtime satisfies the workflow, prefer it unless a permitted external runtime provides a measured capability/quality improvement that crosses the workflow's explicit escalation threshold.

```text
LOCAL FIT + SUFFICIENT QUALITY
→ LOCAL

LOCAL INSUFFICIENT
→ EXTERNAL RENTER

LOCAL SUFFICIENT + EXTERNAL MATERIAL UPLIFT + WORKFLOW ALLOWS
→ EXTERNAL/HYBRID OPTION WITH RECEIPTED TRADEOFF
```

Always expose at least the selected route, reason, rejected hard constraints, benchmark evidence, and local-vs-external tradeoff.

## Routing receipt

```yaml
workflow_id:
hardware_id:
selected_renter:
selected_runtime:
execution:
required_skills: []
required_capabilities: []
eligible_candidates: []
rejected_candidates: []
benchmark_score:
local_preference_applied:
external_escalation_reason:
cost_latency_tradeoff:
receipt_status:
```

## Constraints

- Never route by brand reputation alone.
- Never call a marketing alias an exact benchmark identity.
- Never invent hardware measurements.
- Never use benchmark strength to bypass privacy, offline, tool, or skill requirements.
- Never permanently declare one model the winner for every workflow.
- Preserve the option for explicit human runtime selection and receipt capability mismatches rather than silently switching models.

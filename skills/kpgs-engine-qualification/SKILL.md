---
name: kpgs-engine-qualification
description: Qualify or quarantine an exact AI engine/runtime capability lane using current CI, benchmark, runtime, hardware, skill, and receipt evidence before the model/hardware router may promote it into normal MMAO/MAO execution.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; provider-neutral and exact-runtime oriented.
allowed-tools:
  - github:read-workflow
  - github:read-commit-status
  - runtime:benchmark
  - runtime:telemetry
script-entrypoints:
  - kmec.engine_qualification:EngineQualificationGate
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  tags: engine, qualification, quarantine, runtime, benchmark, mmao, mao
---

# KPGS Engine Qualification

## Purpose

A strong model is not automatically an eligible renter.

```text
EXACT ENGINE / RUNTIME
→ REQUIRED SKILLS
→ REQUIRED CAPABILITIES
→ CI EVIDENCE AT CURRENT SHA
→ HARDWARE / NETWORK / PRIVACY FIT
→ BENCHMARK COVERAGE
→ RUNTIME CONSEQUENCE RECEIPTS
→ QUALIFY / EXPERIMENT / QUARANTINE
→ ROUTER
```

## States

```text
qualified
experimental
quarantined
unknown
```

`experimental` may execute only through an explicit human/debug override and must never be reported as qualified, POC-validated, or runtime-proven merely because execution was allowed.

## Qualification record

```yaml
engine_id:
exact_runtime_id:
capability_lane:
state:
validation_receipt_ids: []
last_ci_sha:
last_ci_conclusion:
validated_at:
max_age_seconds:
benchmarks: {}
hardware_receipts: []
provider_receipts: []
```

## Quarantine triggers

Quarantine the affected capability lane when required CI fails, the qualification SHA no longer matches current code, evidence becomes stale, a qualified label has no validation receipt, or a provider/runtime change invalidates the measured contract.

Do not quarantine unrelated engines merely because another lane failed. Scope the consequence to the engine/runtime/capability evidence actually affected.

## Router law

```text
BENCHMARK SCORE
        ↓
ENGINE QUALIFICATION GATE
        ↓
HARD ELIGIBILITY
        ↓
WORKFLOW SKILLS + CAPABILITIES
        ↓
MODEL / HARDWARE ROUTING
```

A benchmark score cannot bypass the qualification gate.

## KPGS authority

Use `Kopano-Labs/Introduction-to-MCP` for KPGS authority and renter posture. Provider documentation is authoritative only for provider-specific behavior inside its scope. Registry/community skill metadata is discovery evidence, not constitutional authority.

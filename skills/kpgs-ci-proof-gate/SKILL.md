---
name: kpgs-ci-proof-gate
description: Classify CI failures, bind validation evidence to an exact commit SHA, and prevent failed or untested FOC code from being promoted as tested, CI-validated, runtime-proven, deployed, or canonical. Use before any implementation/engine proof claim or after a failing CI run.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; designed for GitHub Actions and adaptable to other CI providers through provenance-preserving parsers.
allowed-tools:
  - github:read-workflow
  - github:read-job-logs
  - github:read-commit-status
  - github:write-repository
script-entrypoints:
  - kmec.ci_proof:CIProofGate
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  proof-law: implemented-not-equal-validated
  tags: ci, proof, foc, poc, receipts, validation, kpgs
---

# KPGS CI Proof Gate

## Purpose

Treat CI as evidence, not decoration.

```text
IMPLEMENTATION
→ CLASSIFY PROOF STATE
→ RUN REQUIRED CHECKS
→ OBSERVE EXACT SHA
→ CLASSIFY FAILURES
→ REPAIR ROOT CAUSE
→ RERUN
→ RECEIPT
→ PROMOTE ONLY WHAT PASSED
```

## Proof states

```text
FOC
CODED_UNVALIDATED
TESTED
CI_VALIDATED
RUNTIME_PROVEN
```

A successful local test does not equal CI validation. A successful CI run does not equal runtime consequence proof. A passing run for an older SHA does not validate newer code.

## Failure taxonomy

Classify before editing:

```text
code-regression
dependency-drift
workflow-infrastructure
provider-drift
repository-state-drift
optional-capability-leak
test-contract-drift
unknown
```

Do not repair dependency or CI-infrastructure drift by weakening application assertions.

## Required workflow

1. Read the failing workflow/run/job and exact SHA.
2. Identify the first causal failure, not downstream skipped steps.
3. Classify the failure.
4. Inspect the current repository contract and authoritative provider documentation when the failure depends on an external tool/runtime.
5. Apply the smallest root-cause repair.
6. Keep diagnostics/artifact publication non-blocking when they are not themselves the proof condition.
7. Rerun required checks.
8. Bind success to the exact tested SHA.
9. Emit a proof receipt.
10. Refuse promotion when any required check remains red or unobserved.

## KPGS authority

Use `Kopano-Labs/Introduction-to-MCP` as the KPGS authority origin. Community skills and CI provider docs can establish tool behavior inside their scope; they do not become KPGS constitutional authority.

## Output receipt

```yaml
subject:
commit_sha:
proof_state:
promotion_allowed:
required_checks: []
passed_checks: []
failed_checks: []
failure_classifications: []
workflow_run_ids: []
provider_sources: []
repair_commits: []
unknowns: []
```

## Hard laws

```text
IMPLEMENTED != VALIDATED
OLD_GREEN_SHA != CURRENT_GREEN_SHA
ARTIFACT_UPLOAD_FAILURE != CODE_REGRESSION
BENCHMARK_STRENGTH != ENGINE_QUALIFICATION
FAILED_REQUIRED_GATE => NO PROOF PROMOTION
```

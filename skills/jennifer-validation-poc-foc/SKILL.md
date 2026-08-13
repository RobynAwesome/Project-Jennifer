---
name: jennifer-validation-poc-foc
description: Enforce Project Jennifer validation, POC-vs-FOC classification, guardrails, evidence gates and merge-state truth. Use for every architecture/runtime claim, failed validation, new system capability, test/evidence promotion, or change that could be presented as working/validated.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: validation-poc-foc
  tags: [validation, poc, foc, evidence, guardrails]
---

# Jennifer Validation — POC vs FOC

## Authority
Read `VALIDATION_POLICY.md`, `VALIDATION_FAILED.md`, `packages/validation/`, `project_jennifer/validation/` and the relevant tests before declaring validation.

## Definitions
POC is a concept that survives evidence, reality or runtime checks.

FOC includes:
- **Failure** — tested and failed;
- **Fabrication** — generated without a real source;
- **Fragmentation** — incomplete but presented as complete;
- **Fallacy** — inconsistent with verified reality.

## Non-negotiable law
Do **not** silently regenerate missing architecture. Missing authoritative source remains missing until recovered or explicitly declared.

Do not promote `Pending` or `UNVERIFIED` to `Validated` by inference.

## Evidence gate
A validation claim requires at least one applicable evidence class:
- passing runtime/test output;
- telemetry measurement;
- governance-maintainer approval with cited evidence;
- declared canonical source artifact where policy permits.

Architecture/governance changes must also satisfy the repository's provenance metadata and approver gates.

## Execution loop
```text
claim
→ identify source
→ assign current validation state
→ select test / telemetry / review evidence
→ execute or inspect evidence
→ POC | Pending | UNVERIFIED | FOC
→ receipt
→ repair only as an explicit subsequent action
```

## Output
Never merely say “works.” Return claim, test/evidence, observed result, validation state, failure type if FOC, affected files and unresolved gate.

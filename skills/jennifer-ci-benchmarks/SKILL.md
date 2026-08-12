---
name: jennifer-ci-benchmarks
description: Validate Project Jennifer changes through its tests, governance workflows, CI, benchmark suites and measurable renter evidence. Use whenever a change is about to be called working, a provider capability is compared, a PR is prepared, or failures/regressions need classification.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: ci-benchmarks-evaluation
  tags: [ci, tests, benchmarks, evaluation, receipts]
---

# Jennifer CI + Benchmarks

## Sources
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/jennifer-governance-python.yml`
- `tests/`
- `benchmarks/`
- `project_jennifer/evaluation/`

## Law
A benchmark score is evidence for a defined task/version/runtime, not permanent provider identity.

Missing scores remain `null`; never fabricate them.

## Validation workflow
1. Determine changed runtime/package and relevant tests.
2. Run or inspect the narrowest reliable checks first.
3. Run broader CI/build checks when the change crosses package boundaries.
4. For renter/provider comparisons, record exact runtime/model ID, benchmark version, inputs, execution mode and constraints.
5. Classify failures through POC/FOC rather than hiding flaky or failing evidence.
6. Return machine/human-readable receipts.

## Current benchmark lanes
Repository distribution currently recognizes dimensions including extraction, planning, retrieval grounding, coding and communication attention. Add new dimensions by versioned contract rather than repurposing old scores.

## Output
Return checks executed, commit/runtime identity, pass/fail evidence, benchmark dimensions/results, regressions, POC/FOC state and unresolved gates.

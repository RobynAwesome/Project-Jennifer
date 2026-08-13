# Project Jennifer → PKA Engine consumer

Project Jennifer is the first external repository consumer of `RobynAwesome/Partial-Knowable-Algebra` runtime v0.1.

## Scope

This lane evaluates a **repository validation proposal only**.

```text
Project Jennifer repository evidence
→ explicit PKA caller workflow
→ Partial-Knowable-Algebra composite action
→ PKA receipt
→ GitHub artifact
```

It does **not**:

- mutate Project Jennifer runtime state;
- deploy Project Jennifer;
- modify Memory Receipts;
- promote historical context into current-human authority;
- infer personality or preference from repository activity;
- call unrelated repositories;
- treat PKA `POC_CANDIDATE` as permission for production mutation.

## WYC-01 boundary

The call is explicit and path-scoped to:

- `.pka/**`
- `.github/workflows/pka-external-consumer.yml`
- manual `workflow_dispatch`

The PKA caller records only the operations it intentionally invokes. Existing Project Jennifer repository-wide CI may independently run because that is Project Jennifer's current CI policy; that execution is not attributed to PKA.

## Evidence

The caller hashes current repository files at runtime before it marks them verified:

- `packages/memory/src/memory-receipt-engine.ts`
- `packages/runtime/src/poc-foc-runtime-gate.ts`
- `.github/workflows/pka-external-consumer.yml`

The hashes are injected into the generated PKA request, binding the receipt to the checked-out commit.

## Success condition

```text
external repository checkout
→ evidence hashing
→ generated classified PKA request
→ private cross-repository PKA action executes
→ POC_CANDIDATE / PROPOSE
→ pka-receipt artifact emitted
```

If private-action access is not authorized by GitHub repository settings, the workflow must fail visibly at the action-resolution boundary rather than simulate execution.

/s/ Kholofelo Robyn Rababalela

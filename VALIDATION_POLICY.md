# Validation Policy

> **Sprint 3 — Governance Unification**  
> POC vs FOC Enforcement and PR/Merge Gates

---

## Purpose

This policy operationalizes the POC/FOC governance framework for Project Jennifer.
All architecture changes, runtime modifications, and source declarations must comply before merge.

---

## Definitions

### POC — Proof of Concept

A concept that has been **validated through evidence, reality, or runtime checks**.

A POC must satisfy at least one of:

- Verified by runtime test with observable output
- Confirmed by telemetry measurement
- Approved by a governance maintainer with cited evidence
- Sourced from a declared canonical artifact by @RobynAwesome

### FOC — Failure / Fabrication / Fragmentation / Fallacy of Concept

A concept that **cannot survive validation**. FOC occurs when:

| Type | Description |
|------|-------------|
| **Failure** | The concept was tested and did not pass |
| **Fabrication** | The concept was generated without a real source |
| **Fragmentation** | The concept is incomplete and presented as complete |
| **Fallacy** | The concept is logically inconsistent or contradicts verified reality |

> FOC must be rejected, not silently fixed or regenerated.

---

## Hard Rules

1. **No silent regeneration of missing architecture.**
   If architecture is missing, halt and report `VALIDATION_FAILED`. Do not infer or reconstruct.

2. **All architecture edits require source declaration metadata.**
   Every PR that modifies or adds architecture content must include:
   - `Declared Source` — where the content originated
   - `Declared By` — who approved the source
   - `Declaration Date` — ISO date of declaration
   - `Validation State` — one of: `Pending`, `Validated`, `UNVERIFIED`

3. **Unverified sections must be marked explicitly.**
   Any content that has not been verified by evidence must carry the `UNVERIFIED` label.
   Unverified content must remain pending; it must not be promoted to validated by inference.

4. **Validation state transitions require evidence.**
   Moving a section from `UNVERIFIED` or `Pending` to `Validated` requires:
   - A linked test, telemetry record, or external review
   - Governance approver sign-off

5. **FOC artifacts must not be merged.**
   PRs containing fabricated, fragmented, fallacious, or failing architecture content
   must be blocked at the merge gate.

---

## PR / Merge Gates

All PRs that touch architecture documents, governance policy, or runtime source must pass **all** of the following:

### Gate 1 — Source Provenance

- [ ] `Declared Source` is present and non-empty
- [ ] `Declared By` identifies an authorized maintainer
- [ ] `Declaration Date` is present (ISO 8601)

### Gate 2 — Validation State

- [ ] `Validation State` is explicitly declared (`Pending`, `UNVERIFIED`, or `Validated`)
- [ ] No section is implicitly assumed to be validated

### Gate 3 — Evidence Checklist

At least one of the following must be linked per architectural claim:

- [ ] Passing test (link to CI run or test file)
- [ ] Telemetry record (link to telemetry log or event)
- [ ] Peer review (link to PR review comment or external review document)
- [ ] Canonical source artifact (link to commit, tag, or signed document)

### Gate 4 — Governance Approver Sign-Off

- [ ] At least one governance approver (@RobynAwesome or designated maintainer) has reviewed
- [ ] Sign-off is recorded in the PR as an explicit approval comment or GitHub review

---

## Validation State Reference

| State | Meaning | May Merge? |
|-------|---------|-----------|
| `Validated` | Evidence reviewed, governance approved | ✅ Yes |
| `Pending` | Source declared, evidence not yet reviewed | ⚠️ Only with explicit approver sign-off |
| `UNVERIFIED` | No evidence, content awaiting review | ❌ No — must be gated |

---

## Relationship to VALIDATION_FAILED.md

[`VALIDATION_FAILED.md`](./VALIDATION_FAILED.md) is the **enforcement record** generated when the governance system
detects that architecture cannot be faithfully sourced.

This policy document defines **how to recover** from that state safely.

The two documents are complementary, not conflicting:

- `VALIDATION_FAILED.md` = system state **before** a verified source exists
- `Project_Jennifer.md` = canonical architecture **after** a source is declared and accepted
- `VALIDATION_POLICY.md` = the rules governing that transition

---

_This policy is Source-Declared and does not require architectural verification to be operative.  
Governance rules are active from the moment they are declared._

# MMAO Governance

> **Governance Classification:** Source-Declared  
> **Declared By:** @RobynAwesome  
> **Declaration Date:** 2026-07-28  
> **Validation State:** Pending POC verification

---

## Purpose

This document defines **how Project Jennifer evolves**.

It does not define what Jennifer does.  
It defines how the repository that builds Jennifer is allowed to grow.

Every team, tool, framework, and methodology eventually accumulates drift — small deviations from the original intent that compound over time until the system no longer resembles what it was designed to be.

MMAO governance exists to prevent that drift through **explicit rules enforced at every contribution boundary**.

---

## The Governing Principle

```
Governance
    ↓
Validation
    ↓
Memory
    ↓
Telemetry
    ↓
Execution
```

This is not just the architecture of Project Jennifer.  
This is also the architecture of **how Project Jennifer is built**.

Every change to the repository passes through this sequence.  
No change skips a layer.  
No change reverses the order.

---

## The Five Layers of Repository Governance

### Layer 1 — Governance

Before any work begins, the contributor must establish that the work is **sanctioned by human intent**.

This means:

- A human request exists (a PR description, an issue, a direct instruction)
- The request has been interpreted correctly and without fabrication
- The scope of the work has been bounded — the contributor knows what they are doing and what they are not doing

**Gate:** Can you name the human who requested this? If not, stop.

---

### Layer 2 — Validation

Before any file is modified, the contributor must establish the **validation basis** for the change.

This means:

- The work has a declared `Source-Declared`, `POC-Verified`, or `Governance-Approved` basis
- Any claims about the architecture are traceable to evidence, not inference
- If validation evidence does not exist yet, the state is `Pending` — not `Validated`

**Gate:** Can you state why this change is valid without fabricating the reason? If not, stop.

---

### Layer 3 — Memory

Before producing output, the contributor must **read the existing state** of the repository.

This means:

- Governance documents are read before acted upon
- Existing architecture is not overwritten without explicit approval
- Decisions from prior sessions are respected even if the current agent has no memory of those sessions

**Gate:** Have you read all relevant governance documents? Have you checked that what you are about to create does not already exist or contradict prior decisions? If not, read first.

---

### Layer 4 — Telemetry

Every contribution must **produce a traceable record** of what was done and why.

This means:

- A session record is completed using [`SESSION_TEMPLATE.md`](./SESSION_TEMPLATE.md)
- Every PR includes source provenance metadata
- Architecture decisions are logged, not just implemented

**Gate:** Will the next agent be able to understand what happened in this session, why decisions were made, and what was deferred? If not, document before closing.

---

### Layer 5 — Execution

Only after layers 1–4 are satisfied does execution proceed.

Execution means:

- Writing files
- Committing changes
- Opening pull requests
- Requesting merge reviews

**Gate:** Every file changed must be listed in the session record. Every PR must satisfy the merge gates defined in [`../../VALIDATION_POLICY.md`](../../VALIDATION_POLICY.md).

---

## Merge Gate Requirements

Every PR that touches architecture, governance, or runtime source must satisfy all of the following before merge:

| Gate | Requirement |
|------|-------------|
| **Gate 1 — Source Provenance** | `Declared Source`, `Declared By`, and `Declaration Date` are present |
| **Gate 2 — Validation State** | `Validation State` is explicitly declared and appropriate |
| **Gate 3 — Evidence** | At least one evidence link is present, or `Pending` is declared with approver awareness |
| **Gate 4 — Governance Approver** | @RobynAwesome or a designated maintainer has reviewed and approved |

See [`../../VALIDATION_POLICY.md`](../../VALIDATION_POLICY.md) for full gate definitions.

---

## What Counts as Architecture?

In Project Jennifer, **architecture** includes:

| Type | Examples |
|------|---------|
| System design documents | `docs/architecture/`, `docs/mmao/` |
| Governance policy | `VALIDATION_POLICY.md`, `docs/mmao/GOVERNANCE.md` |
| Module contracts | Interfaces in `packages/*/src/`, semantic contracts |
| Runtime rules | Governance policies, commandments |
| Configuration with runtime impact | `turbo.json`, workspace configuration |

Architecture does **not** include:

| Type | Examples |
|------|---------|
| Test files | Unit tests, integration tests |
| Styling | CSS, TailwindCSS classes |
| Dependency updates | Unless they change a module's interface |
| Comments and formatting | Unless they alter documented intent |

When in doubt, treat a change as architecture and apply full merge gate requirements.

---

## Prohibited Repository Actions

The following actions are prohibited in Project Jennifer regardless of contributor role:

| Action | Reason |
|--------|--------|
| Silent regeneration of missing architecture | FOC — fabrication of history |
| Merging a PR without provenance metadata | Breaks the traceability chain |
| Promoting `Pending` to `Validated` by inference | Validation state transitions require evidence |
| Modifying a merged session record or CHANGELOG entry | The historical record must be immutable |
| Introducing a new governance rule without human approval | Agents do not govern themselves |
| Deleting a governance document without a replacement and sign-off | Governance continuity must not be broken |
| Bypassing the Commandment 15 testimony questions | Non-negotiable — applies to every contribution without exception |

---

## How New Architecture Is Introduced

A new architectural concept must follow this process:

```
1. Human Architect declares intent
       ↓
2. Architect (ChatGPT) refines the concept
       ↓
3. Session record is created (SESSION_TEMPLATE.md)
       ↓
4. Repository Executor (Copilot) implements the artifact
       ↓
5. PR is opened with provenance metadata and evidence
       ↓
6. Validation Review confirms merge gates are satisfied
       ↓
7. Human Architect approves and merges
       ↓
8. CHANGELOG.md is updated with the architecture entry
```

This process is not optional for architectural changes.  
Implementation-only changes (bug fixes, documentation corrections) may follow a lighter path, but must still complete a session record and satisfy provenance requirements.

---

## How Existing Architecture Is Modified

Modifying existing architecture follows the same process as introducing new architecture, with one additional requirement:

- The session record must explicitly state **what the prior state was** and **why the modification is necessary**.

Modification without justification is treated as potential fragmentation (FOC).

---

## How Architecture Is Deprecated

When an architectural component is no longer needed:

1. The Human Architect declares the deprecation.
2. A session record documents the reason and the impact.
3. The component is marked as `DEPRECATED` in its document header before removal.
4. A minimum of one PR cycle passes before the component is deleted, allowing dependent systems to adapt.
5. The deprecation is recorded in `CHANGELOG.md`.

Architecture is never silently deleted.

---

## Governance Document Versioning

Every governance document in `docs/mmao/` carries a source provenance header:

```markdown
> **Governance Classification:** [classification]
> **Declared By:** [GitHub username]
> **Declaration Date:** [YYYY-MM-DD]
> **Validation State:** [state]
```

When a governance document is updated, the `Declaration Date` is updated and the prior state is recorded in [`CHANGELOG.md`](./CHANGELOG.md).

---

_This governance document is itself governed by these rules.  
Any modification to this document requires a session record, provenance metadata, and Human Architect approval._

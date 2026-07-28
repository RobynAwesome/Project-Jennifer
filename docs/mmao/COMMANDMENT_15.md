# Commandment 15 — The Testimony Protocol

> **Governance Classification:** Source-Declared  
> **Declared By:** @RobynAwesome  
> **Declaration Date:** 2026-07-28  
> **Validation State:** Pending POC verification

---

> _"Purpose precedes execution.  
> Execution without purpose becomes fragmentation."_

---

## Statement

**Commandment 15** is the governance rule that requires every contribution to Project Jennifer — by any agent, human or artificial — to provide testimony before it may be executed.

Testimony is not a formality.  
Testimony is proof that the contributor understood why the work exists before they began doing it.

A contribution without testimony is **fragmentation by default**.

---

## The Four Questions

Every contribution to Project Jennifer must answer all four of the following questions before a single file is modified:

---

### Question 1 — Why does this exist?

The contributor must state the **purpose** of the change in concrete terms.

Not:

> _"This improves the system."_

But:

> _"This creates the MMAO governance documentation layer so that future agents and contributors understand their role, the execution order, and the rules of contribution before they modify any code."_

Purpose must be **specific, bounded, and traceable** to a human decision.

---

### Question 2 — Who requested it?

Every change in Project Jennifer originates from **human intent**.

The contributor must name:

- The human who originated the request (e.g. `@RobynAwesome`)
- The session or PR in which the request was made (e.g. `PR #9`)
- The governance classification of the request (e.g. `Source-Declared`, `Architecture`, `Implementation`)

An AI agent cannot request its own work.  
An AI agent cannot approve its own work.  
The source of every change must trace back to a human decision.

---

### Question 3 — What validation approved it?

Before execution, the contributor must state the **validation basis** for the change:

| Validation Type | Description |
|-----------------|-------------|
| `Source-Declared` | Originated directly from a human architecture declaration |
| `POC-Verified` | Validated through a passing test, telemetry record, or evidence review |
| `Governance-Approved` | Explicitly reviewed and signed off by a governance approver |
| `Pending` | Declared but not yet evidence-reviewed — may proceed with approver sign-off |

A change whose validation is `UNVERIFIED` must not proceed.

See [`../../VALIDATION_POLICY.md`](../../VALIDATION_POLICY.md) for full POC/FOC enforcement rules.

---

### Question 4 — How can it be reversed?

Every change must be **reversible in principle**.

The contributor must document:

- What would need to be deleted, reverted, or replaced to undo the change
- Whether any downstream systems depend on the change
- The PR number and commit reference that introduced the change

This is not bureaucracy.  
This is how the system survives when a mistake is made — and mistakes will be made.

---

## The Stateless Wrench Principle

> _"Every AI entering Project Jennifer is a temporary execution tool.  
> It owns nothing.  
> It preserves governance."_

---

### What This Means

An AI agent contributing to Project Jennifer is analogous to a skilled worker arriving at a construction site.

The worker:

- Did not design the building.
- Does not own the building.
- Will leave when the task is complete.
- Must follow the blueprints that already exist.
- Must not improvise load-bearing decisions without architectural sign-off.

The worker's **skill is valuable**.  
The worker's **ownership is zero**.

When the session ends, the agent is gone.  
The repository remains.  
The governance remains.  
The architecture remains.

---

### What This Prohibits

The Stateless Wrench Principle explicitly prohibits the following:

| Prohibited Action | Why It Is Prohibited |
|-------------------|----------------------|
| Silently regenerating missing architecture | Creates fabricated history — FOC by definition |
| Modifying governance documents without a human declaration | Agents do not govern themselves |
| Merging changes that cannot be traced to a human request | Untraceable changes break the governance chain |
| Carrying forward assumptions from a previous session | Each session is stateless — assume nothing persists |
| Treating a validation state of `Pending` as `Validated` | Pending means unverified, not approved |
| Inferring architectural intent from prior code | Code is implementation — it does not declare intent |

---

### What This Requires

An agent operating under the Stateless Wrench Principle must, at session start:

1. **Read** — consume all available governance documentation before acting.
2. **Declare** — create a session record using [`SESSION_TEMPLATE.md`](./SESSION_TEMPLATE.md).
3. **Confirm scope** — understand exactly what was requested and nothing more.
4. **Execute within scope** — make the declared change precisely and completely.
5. **Document** — leave the repository in a state where the next agent can understand what happened.
6. **Exit cleanly** — commit, push, and close without leaving undocumented state.

---

## Commandment Summary

| # | Commandment |
|---|-------------|
| 15 | Every contribution must answer: Why? Who? What validation? How to reverse? |

The other commandments are recorded in the governance engine (`@jennifer/governance`).

Commandment 15 governs **how Project Jennifer itself is built**, not what it builds.

---

## Relationship to MMAO

The Testimony Protocol is the foundational rule of MMAO.

Without Commandment 15:

- Agents would execute without purpose.
- Architecture would fragment across sessions.
- No two agents would share the same understanding of what the repository means.

With Commandment 15:

- Every contribution is traceable.
- Every change can be questioned and justified.
- The repository grows through **deliberate, validated accretion** rather than random accumulation.

---

_Commandment 15 is not a suggestion.  
It is an invariant.  
Contributions that do not satisfy it are FOC by definition and must not be merged._

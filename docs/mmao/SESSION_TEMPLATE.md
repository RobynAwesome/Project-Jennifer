# MMAO Session Template

> **Usage:** Copy this file and complete every field for each MMAO session.  
> Incomplete session records are not valid governance artifacts.  
> A session record without all required fields must be treated as `UNVERIFIED`.

---

## How to Use This Template

1. Copy this file to a location appropriate for the session context (a PR description, a session log, or a linked document).
2. Fill in every field. Do not leave fields blank — use `N/A` only when a field genuinely does not apply, with a brief explanation.
3. Attach the completed record to the associated PR before requesting a merge review.
4. The session record becomes part of the immutable governance history of the repository.

---

```markdown
# MMAO Session Record

---

## Session ID

<!-- A unique identifier for this session. Format: MMAO-YYYY-MM-DD-NNN
     where NNN is a zero-padded sequence number within the same date.
     Example: MMAO-2026-07-28-001 -->

MMAO-[YYYY]-[MM]-[DD]-[NNN]

---

## Date

<!-- ISO 8601 date. Date-only format is acceptable: YYYY-MM-DD -->

YYYY-MM-DD

---

## Objective

<!-- A single clear statement of what this session was tasked with achieving.
     Be specific. "Improve the system" is not acceptable.
     Example: "Create the MMAO governance documentation layer (docs/mmao/) as defined in PR #9." -->

[State the objective here]

---

## Participating Agents

<!-- List every agent (human or AI) that contributed to this session.
     Use the role names defined in docs/mmao/CONTRIBUTORS.md.
     Example:
     - Human Architect: @RobynAwesome
     - Repository Executor: GitHub Copilot (Task Agent)
     - System Architect: ChatGPT (consultation, not execution) -->

- Human Architect: @[username]
- [Role]: [Agent name and version if known]

---

## Prompt

<!-- The exact prompt or problem statement given to the executing agent.
     If the prompt was long, include the key directive and link to the PR/issue.
     Do not paraphrase — accuracy matters for governance traceability. -->

[Paste or reference the exact prompt here]

---

## Validation

<!-- State the validation basis for the work performed in this session.
     Use one of: Source-Declared | POC-Verified | Governance-Approved | Pending
     Provide a brief justification for the chosen state. -->

**Validation State:** [Source-Declared | POC-Verified | Governance-Approved | Pending]

**Justification:** [Why this validation state was assigned]

**Evidence:** [Link to test, telemetry record, PR review, or canonical source artifact — or state "Pending" if not yet available]

---

## Architecture Decisions

<!-- List every architectural decision made or confirmed during this session.
     For each decision, state: what was decided, why, and any alternatives that were rejected.
     If no architectural decisions were made (implementation-only session), state "None." -->

### Decision 1 — [Short title]

- **Decision:** [What was decided]
- **Rationale:** [Why]
- **Alternatives considered:** [What was rejected and why]

### Decision 2 — [Short title]

- **Decision:** [What was decided]
- **Rationale:** [Why]
- **Alternatives considered:** [What was rejected and why]

---

## Files Changed

<!-- List every file created, modified, or deleted during this session.
     Format: [Action] path/to/file — [one-line description of the change]
     Actions: Created | Modified | Deleted -->

- [Created | Modified | Deleted] [path/to/file] — [description]

---

## PR Number

<!-- The GitHub pull request number associated with this session.
     If the PR has not yet been opened at the time of writing, state "Pending."
     Once the PR is opened, update this field. -->

PR #[number]

---

## Lessons Learned

<!-- Document any insight gained during this session that would benefit future agents
     or inform future architecture decisions.
     Be specific. Generic observations ("the code is complex") provide no governance value.
     If there are no lessons learned, state "None." -->

- [Lesson or insight]

---

## Deferred Decisions

<!-- List any decisions that were consciously deferred during this session.
     For each, state: what the decision is, why it was deferred, and what information
     is needed before it can be resolved.
     Deferred decisions must not become forgotten decisions.
     If nothing was deferred, state "None." -->

### Deferred — [Short title]

- **Description:** [What needs to be decided]
- **Reason for deferral:** [Why it was not resolved in this session]
- **Required to resolve:** [What information, evidence, or human approval is needed]

---

_Session record completed by [Agent name] on [YYYY-MM-DD].  
This record is a governance artifact of Project Jennifer.  
It must not be altered after the associated PR is merged._
```

---

## Field Reference

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| Session ID | Yes | `MMAO-YYYY-MM-DD-NNN` | Sequential within the same date |
| Date | Yes | `YYYY-MM-DD` | ISO 8601 |
| Objective | Yes | Free text | Must be specific and bounded |
| Participating Agents | Yes | List | Use role names from `CONTRIBUTORS.md` |
| Prompt | Yes | Verbatim or referenced | Do not paraphrase governance-critical prompts |
| Validation | Yes | State + justification + evidence | See `VALIDATION_POLICY.md` for state definitions |
| Architecture Decisions | Yes | Structured entries | "None" is a valid answer for implementation-only sessions |
| Files Changed | Yes | Action + path + description | Every changed file must be listed |
| PR Number | Yes | `PR #NNN` or `Pending` | Update after PR is opened |
| Lessons Learned | Yes | List or "None" | Must be specific to be useful |
| Deferred Decisions | Yes | Structured entries or "None" | Deferred ≠ forgotten |

---

## Validation Rules

A session record is considered **valid** when:

- All fields are present and non-empty (or explicitly `None`/`N/A` with justification).
- The `Validation State` is one of the states defined in [`../../VALIDATION_POLICY.md`](../../VALIDATION_POLICY.md).
- At least one evidence link is present or a `Pending` declaration is made with approver awareness.
- The record is attached to the PR before merge review is requested.

A session record is considered **invalid** (and treated as `UNVERIFIED`) when:

- Any required field is blank without explanation.
- The `Validation State` is missing.
- The `Objective` cannot be traced to a human request.
- The record was created or modified after the associated PR was merged.

---

_This template is a living governance artifact.  
If fields need to be added or changed, propose the change through a governed PR with a session record that answers the four questions of Commandment 15._

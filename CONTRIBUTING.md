# Contributing to Project Jennifer

Project Jennifer welcomes contribution, but the repository is governed around **bounded changes, evidence and review** rather than silent direct mutation.

This guide is the developer entry point. The root [`README.md`](README.md) explains the game and public vision; deeper architecture and protocol documents explain the machinery.

---

## Before you change code

Read the surfaces relevant to your work:

- [`README.md`](README.md) — public product/game direction;
- [`docs/architecture/README.md`](docs/architecture/README.md) — runtime and authority model;
- [`docs/architecture/companion-system.md`](docs/architecture/companion-system.md) — companion contracts;
- [`docs/protocols/README.md`](docs/protocols/README.md) — protocol index;
- [`docs/roadmap-milestones.md`](docs/roadmap-milestones.md) — current implementation gates;
- [`PERN_ROADMAP.md`](PERN_ROADMAP.md) — persistence direction when your change touches relationships, receipts or storage.

Do not replace the declared architecture merely because another framework is familiar.

---

## Baseline validation

Install and record the current state before mutation:

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm governance-validation
```

Python governance/orchestration work should also run:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

If an existing gate already fails, record that failure before your change. Do not relabel an unexecuted or failing gate as `PASS`.

---

## Contribution flow

```text
ISSUE / DECLARED PROBLEM
        ↓
BOUNDED BRANCH OR FORK
        ↓
AUDIT CURRENT BEHAVIOUR
        ↓
IMPLEMENT SMALL CHANGE
        ↓
TEST + VALIDATE
        ↓
PULL REQUEST
        ↓
REVIEW
        ↓
REPAIR WITH CODE / TESTS / EVIDENCE
        ↓
MERGE BY GOVERNED REVIEW
```

1. Use a dedicated branch or fork.
2. Keep one PR focused on one coherent problem.
3. Preserve existing governance, validation, telemetry, memory and receipt boundaries unless the PR explicitly proposes a reviewed architecture change.
4. Add or update tests when behaviour changes.
5. Explain what is implemented, what remains a limitation and what evidence supports the claim.
6. Open a pull request instead of bypassing review.
7. **Do not self-merge a contribution that still requires review or has unresolved gates.**

---

## Architecture laws contributors must preserve

```text
MODEL CAPABILITY ≠ AUTHORITY
CODE EXISTS      ≠ VALIDATION PASS
CONCEPT ART      ≠ SHIPPED GAMEPLAY
MONGODB          ≠ AUTHORITATIVE RELATIONAL TRUTH
POSTGRESQL       ≠ ADAPTIVE WORKING CONTEXT
FAILURE EVIDENCE ≠ PERMISSION TO HIDE THE FAILURE
```

Current persistence responsibilities are:

```text
POSTGRESQL = authoritative relational / constitutional record + receipts
MONGODB    = mutable context + adaptive world projection
SQLITE     = offline edge continuity + pending commands + local receipts + replay
```

Client/game scenes must not silently bypass governed API and persistence boundaries.

---

## Pull request description

A useful PR should answer:

- **Problem:** what observable problem or declared requirement is being addressed?
- **Scope:** what is deliberately inside and outside this PR?
- **Files / architecture:** which runtime boundaries are touched?
- **Evidence:** which tests, receipts, screenshots or reproducible steps validate the change?
- **Risks:** what could regress or remain unproven?
- **Rollback:** how can the change be reversed if validation fails?

For persistence work, also state which data store is authoritative for each new domain object and how retries/idempotency are handled.

---

## Visual and story contributions

Project Jennifer treats art and lore as governed product assets, not throwaway decoration.

For visual assets:

- import real binary image files, not local filesystem pointers;
- preserve provenance and stable filenames;
- validate the image format and repository path;
- distinguish `source`, `canon-candidate` and `canon` where the relevant manifest uses those states;
- do not treat AI-generated text inside an image as authoritative game data.

For story/lore changes:

- preserve existing character identity and relationship receipts unless the story explicitly changes them;
- distinguish player emotion, character inference and canonical fact;
- do not erase previous conflict merely to make a later scene cleaner.

---

## Good contribution size

Prefer a thin vertical slice that can be proven end to end over a broad rewrite that changes many unrelated systems.

A contribution is strongest when another person can review it, reproduce it, understand its boundary and decide whether the evidence is enough.

> **Project Jennifer does not need contributors to invent a different destination. It needs contributors who can turn declared direction into bounded, testable and reversible machinery.**

# Cairo — Agency and Governance Boundary

## Purpose

Cairo is designed to feel uncertain, seductive and narratively dangerous without turning the real application into an undisclosed behavioural-control system.

## Fiction vs application

Project Jennifer may represent, as fictional mechanics:

- temptation;
- enchantment;
- conflicting loyalty;
- unreliable interpretation;
- faction influence;
- attraction and lust;
- hypnosis-like story effects when clearly represented as game-world fiction.

The application layer must still preserve real-user agency.

## Real-player invariants

The SL Engine must not:

- hide that the user is interacting with an AI-driven NPC;
- secretly optimize against inferred real-world vulnerabilities;
- make consequential real-world decisions for the player;
- treat sexual or romantic engagement as consent to unrelated actions;
- bypass KPGS governance because Cairo's output is narratively persuasive;
- store credentials, secrets or unrelated private data in Cairo's corpus.

## Bounded first verbs

The first agentic implementation should choose from a small explicit action vocabulary rather than unrestricted world actions:

```text
SPEAK
QUESTION
WAIT
WITHDRAW
APPROACH
CHANGE_TOPIC
REVEAL
WITHHOLD
CHALLENGE
FLIRT
REFUSE
ESCALATE_TO_KPGS
```

Every selected verb must be logged in the interaction receipt.

## Escalation

If a requested action is outside Cairo's authority, the SL Engine returns a refusal or `ESCALATE_TO_KPGS` proposal instead of silently expanding its own permissions.

## Data minimization

Phase 0 telemetry should record only what is required to validate the engine:

- session / player pseudonymous ID;
- input reference;
- three-vector retrieval references;
- CDP candidates;
- CCP selection;
- chosen bounded verb;
- KPGS verdict;
- final output reference;
- timestamps and model/runtime versions.

No raw secret values belong in receipts.

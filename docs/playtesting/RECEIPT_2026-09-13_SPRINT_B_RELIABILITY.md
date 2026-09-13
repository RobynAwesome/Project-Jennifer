# Love Loop Playtest Receipt — Sprint B Reliability Bowl

```yaml
receipt_id: playtest-2026-09-13-sprint-b-reliability
target_url: local bowl (no hosted stranger URL claimed)
environment: local
tester: Cursor Agent (stateless renter)
date: 2026-09-13
command: pnpm smoke:love-loop-reliability
```

## Decision

```text
localStorage-first for return-tomorrow in the same browser
PERN multi-device continuity = HOLD
sessionId ≠ relationshipId
```

The API in-memory continuity store may die with the process. That is labelled. Continue must still restore companion + episode flags from the browser bowl.

## Membrane checklist

| Check | Result |
|---|---|
| Continue hydrates from localStorage without awaiting API | PASS |
| Soft refresh may land during fade only | PASS |
| Continuity fetches abort at 1500ms | PASS |
| Dead API keeps local snapshot | PASS |
| Foreign sessionId cannot overwrite bowl | PASS |
| Collapsed `relationshipId === sessionId` stripped (local + remote) | PASS |
| Journal paints local reveal before optional API | PASS |
| Hosted stranger URL | HOLD |
| PERN second-device continuity | HOLD |

## Product binding

- `StartMenuScene.continueFromLocalBowl` is the chaos path.
- `sanitizeContinuitySnapshot` + `resolveContinuitySnapshot` are the merge law.
- Journal badge stays `local` / `demo`; never `authoritative` from continuity-store.

`loved ≠ proven`

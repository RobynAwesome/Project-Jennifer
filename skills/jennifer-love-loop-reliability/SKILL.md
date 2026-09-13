---
name: jennifer-love-loop-reliability
description: Operate Jennifer City Reliability bowl — localStorage-first Continue, API-death honesty, sessionId≠relationshipId namespace guard, and chaos smokes. Use when hardening return-tomorrow continuity, merging local vs continuity-store snapshots, or deciding PERN multi-device continuity (default HOLD).
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: love-loop-reliability
  portable: true
  tags:
    - jennifer-city
    - continuity
    - reliability
    - local-first
    - zero-trust
    - pern-hold
---

# Jennifer City Love-Loop Reliability Bowl

## Purpose

Keep **return-tomorrow** true in the same browser when the API process dies, without lying that multi-device PERN continuity exists.

```text
localStorage-first = same-browser return
continuity-store   = optional in-memory mirror (dies with process)
PERN multi-device  = HOLD until Master admits mapping
sessionId          ≠ relationshipId
```

## Entry invariants

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
loved ≠ proven
API down ≠ game over (if local bowl exists)
soft refresh may win during fade only — never block Continue
```

## Load order

```text
jennifer-city-love-loop
→ this skill
→ apps/web/src/game/continuity/session-store.ts
→ apps/web/src/game/continuity/resolve-continuity.ts
→ apps/web/src/game/scenes/StartMenuScene.ts
→ apps/api/src/routes/game-continuity.ts
→ docs/playtesting/RECEIPT_2026-09-13_SPRINT_B_RELIABILITY.md
```

## Merge law

Use `resolveContinuitySnapshot(local, remote, reachable)`:

1. Unreachable / empty remote → keep local (or `unreachable`)
2. Foreign `sessionId` → keep local
3. Newer same-session store → may refresh (`continuity-store`)
4. Tie → local wins
5. Always `sanitizeContinuitySnapshot` — strip collapsed ids

## Chaos path

```text
Continue click
→ apply local bowl to registry immediately
→ start fade (do not await API)
→ optional soft load mutates bowl if same session
→ on fade complete: re-apply bowl → goTo scene
```

## Proof commands

```bash
pnpm smoke:love-loop-reliability
pnpm smoke:love-loop
```

## Forbidden claims

- "Durable multi-device continuity" without PERN admission + second-browser receipt
- Labelling continuity-store as `authoritative`
- Blocking Continue on API latency

`loved ≠ proven`

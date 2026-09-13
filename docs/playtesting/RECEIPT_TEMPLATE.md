# Love Loop Playtest Receipt Template

**Protocol:** [LOVE_LOOP_PLAYTEST.md](LOVE_LOOP_PLAYTEST.md)  
**Constraint:** Commandment 15 / TP — do not sanitize failures.

```yaml
receipt_id: playtest-YYYY-MM-DD-<slug>
target_url: http://localhost:3000/game   # or public URL when hosted
environment: local | preview | production
tester: <name>
date: YYYY-MM-DD
api_reachable: true | false
continuity_smoke: pass | fail | skipped   # pnpm smoke:love-loop
```

## Checklist

| Step | Pass? | Note |
|---|---|---|
| 1 Persona | | |
| 2 Companion | | |
| 3 Hall → Memory | | |
| 4 Signal Breach | | |
| 5 Choice | | |
| 6 Episode complete | | |
| 7 Consequence journal (local/demo honest) | | |
| 8 Continue restores | | |
| 9 Player can say why | | |

## Love questions

1. Come back tomorrow?  
2. Cared about companion?  
3. Monospace exhausting?  
4. Governance flavor vs homework?

## Decision

```text
PASS | FAIL | HOLD
```

One quote (unedited):

> …

---

`I_AM_STATELESS_RENTER_NOT_LANDLORD`

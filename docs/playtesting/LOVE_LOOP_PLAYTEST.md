# Love Loop Playtest Protocol

**Product:** Jennifer City  
**Charter:** [GAME_DEDICATION_CHARTER.md](../GAME_DEDICATION_CHARTER.md)  
**Success metric:** return-next-day continuity + player can explain *why* the world changed

CI proof PASS is engineering honesty. It is **not** this protocol's love metric.

---

## Setup

1. Start API: `pnpm --filter @jennifer/api dev` (or monorepo equivalent on port 3001).
2. Start web: `pnpm --filter @jennifer/web dev` → http://localhost:3000/game
3. Optional: set `NEXT_PUBLIC_JENNIFER_API_URL` if API is not on `127.0.0.1:3001`.

---

## Script (≤ 60 minutes)

| Step | Action | Pass signal |
|---|---|---|
| 1 | Enter the city, choose persona | Persona feels like approach, not a class sheet dump |
| 2 | Select a companion | Receipt / status acknowledges governance link |
| 3 | Walk Governance Hall → Memory District | City is a place, not only menus |
| 4 | Talk to Archivist; approach amber **Signal Breach** | Episode invitation is clear |
| 5 | Play Third Signal beats; pick one choice | Choice feels relational (jealousy / agency / recognition) |
| 6 | Return to district; note companion still present in continuity | Episode marked complete |
| 7 | Open `/game/consequences` | Journal shows **local** or **authoritative** player reveal — not only demo fixture |
| 8 | Reload `/game`, press **Continue** | Companion + episode state restore |
| 9 | Ask aloud: “Why did the world change?” | Player points at receipt / choice language |

---

## Love / retention questions

1. Would you come back tomorrow to see if they still remember?
2. Did any line make you care about the companion (not the protocol)?
3. Was monospace-terminal UI charming or exhausting in the first hour?
4. Did “governance” feel like magic system flavor or homework?

Record answers in a short note (pass/fail + one quote). Do not promote lore or assets from playtest vibes alone.

---

## Failure modes to file

- Continue does nothing → continuity bridge / localStorage
- Journal stuck on demo fixture after episode → reveal persist path
- Companion select ignores API but never says so → sourceMode labelling
- Episode treats companion as property → Forge agency law broken

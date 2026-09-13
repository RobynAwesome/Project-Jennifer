# Hosting Jennifer City

**Goal:** strangers can play the love loop at a stable URL.  
**Status:** build artifacts are CI-produced; production URL is environment-configured (not claimed live until secrets + DNS exist).

## What to host

| Service | Path | Notes |
|---|---|---|
| Web | `apps/web` (Next.js) | Player enters at `/game` |
| API | `apps/api` (Express) | Continuity, companions, relationships, memory. **Not** a Vercel serverless function. |

### Vercel project (the playable URL)

The Git-connected Vercel project (even if named `project-jennifer-api`) must deploy **Next.js**, not Express. Express `listen()` on Vercel is a `FUNCTION_INVOCATION_FAILED` crash.

In Vercel → Project → Settings → General:

1. **Root Directory** = `apps/web`
2. Framework preset = Next.js
3. Redeploy the latest production deployment

Do not set a custom Output Directory (Vercel owns `.next`).  
`NEXT_PUBLIC_JENNIFER_API_URL` is optional for a first play — the love loop is localStorage-first. When the API is on Render, set that variable and add `https://project-jennifer-api.vercel.app` to `JENNIFER_CORS_ORIGINS`.

Set `NEXT_PUBLIC_JENNIFER_API_URL` on the web deploy to the public API origin (no trailing slash).

## Local production-like check

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @jennifer/api start
pnpm --filter @jennifer/web start
```

Open `http://localhost:3000/game` and run [LOVE_LOOP_PLAYTEST.md](playtesting/LOVE_LOOP_PLAYTEST.md).

Membrane smoke (API must already be on `:3001`):

```bash
pnpm smoke:love-loop
pnpm smoke:love-loop-reliability
```

`smoke:love-loop` covers continuity store honesty + Third Signal epistemic actor-model wire (`POST /api/runtime/third-signal/epistemic`). `smoke:love-loop-reliability` proves same-browser Continue keeps the local bowl when the API is dead. Neither claims hosted production love.

CI runs the same membrane sequence on every push/PR (job `love-loop-membrane`): API zero-trust origin unit tests, continuity smoke, reliability smoke, and `ceep:jennifer-city-gate`. Hosted stranger love remains Sprint A2 (Master secrets).

CEEP dual-membrane gate (Refine ≠ canon):

```bash
pnpm --filter @jennifer/conceptual build
pnpm ceep:jennifer-city-gate
```

Return-tomorrow in one browser is **localStorage-first**. PERN relationship ids stay a separate namespace; do not map `sessionId` onto `relationshipId` for multi-device continuity until that sprint is admitted.

### CORS / Origin honesty

| Env | Behavior |
|---|---|
| `JENNIFER_CORS_ORIGINS` | Allowlist (required in production) |
| Missing `Origin` in **production** | **Rejected** by default (curl is not browser identity) |
| Missing `Origin` in **development** | Allowed (local probes) |
| `JENNIFER_CORS_REQUIRE_ORIGIN=1` | Force require Origin even in dev |
| `JENNIFER_CORS_ALLOW_MISSING_ORIGIN=1` | Ops escape hatch only — do not set on stranger-facing prod |

Master hosting checklist: [SPRINT_A2_HOSTING_PREP.md](playtesting/SPRINT_A2_HOSTING_PREP.md).

## GitHub Actions

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. Builds the monorepo on `main`.
2. Uploads `apps/api/dist` and `apps/web/.next` artifacts.
3. Optional Vercel web deploy step is ready to enable when secrets exist:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

API hosting is separate (Fly.io, Railway, Render, VM). Continuity store is **in-memory** on the API process unless you attach the PERN relationship spine for durable relationships; browser `localStorage` still preserves the love loop for return-in-same-browser.

## Honesty gate

Do not advertise “hosted production” in the README until:

1. A public `/game` URL is live.
2. Playtest protocol has been run against that URL.
3. API CORS allows the web origin ([`apps/api/src/zero-trust.ts`](../apps/api/src/zero-trust.ts)). Production must set `JENNIFER_CORS_ORIGINS` explicitly; localhost defaults are development-only.

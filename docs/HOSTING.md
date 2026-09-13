# Hosting Jennifer City

**Goal:** strangers can play the love loop at a stable URL.  
**Status:** build artifacts are CI-produced; production URL is environment-configured (not claimed live until secrets + DNS exist).

## What to host

| Service | Path | Notes |
|---|---|---|
| Web | `apps/web` (Next.js) | Player enters at `/game` |
| API | `apps/api` (Express) | Continuity, companions, relationships, memory |

Set `NEXT_PUBLIC_JENNIFER_API_URL` on the web deploy to the public API origin (no trailing slash).

## Local production-like check

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @jennifer/api start
pnpm --filter @jennifer/web start
```

Open `http://localhost:3000/game` and run [LOVE_LOOP_PLAYTEST.md](playtesting/LOVE_LOOP_PLAYTEST.md).

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

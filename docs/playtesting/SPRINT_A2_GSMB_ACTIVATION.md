# Sprint A2 — GSMB Dual-Plane Activation (Local + Cloud)

**Identity law:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`  
**Your trust goes to the governance membrane, not to secrets in chat.**

Jennifer City love loop uses **two honest planes** — not one fake “cloud saves everything” story:

| Plane | Where | What it holds | Proof label |
|---|---|---|---|
| **Local GSMB bowl** | Browser `localStorage` + resolver | Continue, journal, return-tomorrow feel | `local-first` · Reliability bowl |
| **Cloud membrane** | Hosted API (`game-continuity`, epistemic route) | Session continuity store, actor-model receipts | `continuity-store` · `actor-model` · `canonical: false` |

Hosted Sprint A2 succeeds when **both** planes work for a stranger URL — not when a model “feels confident.”

---

## Phase 0 — Never paste tokens here

Put credentials only in:

- GitHub → Settings → Secrets and variables → Actions → environment **`production`**
- Render / Vercel dashboards

Tell Composer in chat: **public URLs only** + “secrets saved.”

---

## Phase 1 — Cloud API (Render blueprint)

1. Render → **New → Blueprint** → connect this repo → use root `render.yaml`.
2. After deploy, copy **public API URL** (no trailing slash).
3. Set **`JENNIFER_CORS_ORIGINS`** on Render to your future web origin, e.g.  
   `https://your-project.vercel.app`  
   (Add custom domain later as a second comma-separated origin.)

Required env (blueprint seeds most):

- `NODE_ENV=production`
- `JENNIFER_PERSISTENCE_MODE=in-memory`
- `JENNIFER_CORS_ORIGINS=<your web origin(s)>`
- Do **not** set `JENNIFER_CORS_ALLOW_MISSING_ORIGIN` on stranger-facing prod.

Verify:

```bash
pnpm verify:hosted-membrane
# or:
JENNIFER_API_URL=https://your-api.onrender.com WEB_ORIGIN=https://your-app.vercel.app pnpm verify:hosted-membrane
```

---

## Phase 2 — Web (Vercel + GitHub)

GitHub **`production`** environment:

| Name | Kind |
|---|---|
| `VERCEL_TOKEN` | secret |
| `VERCEL_ORG_ID` | secret |
| `VERCEL_PROJECT_ID` | secret |
| `NEXT_PUBLIC_JENNIFER_API_URL` | variable → API URL from Phase 1 |

Vercel project env: same `NEXT_PUBLIC_JENNIFER_API_URL`.

Deploy: Actions → **Deploy** → `workflow_dispatch` → **`deploy_web=true`**.

Entry: **`{WEB}/game`**

---

## Phase 3 — Human love proof (Master)

Run [`LOVE_LOOP_PLAYTEST.md`](LOVE_LOOP_PLAYTEST.md) on the **live** URL.

File receipt ([`RECEIPT_TEMPLATE.md`](RECEIPT_TEMPLATE.md)) with:

- pass/fail per step
- one player quote (“would you come back tomorrow?”)
- confirm journal used **local** reveal path after episode

Only then may README claim a hosted play URL.

---

## What Composer does after you activate

- Run `verify:hosted-membrane` against your URLs
- Run `smoke:love-loop` with `JENNIFER_API_URL` + correct `Origin`
- Draft playtest receipt text from your notes
- Update sprint board — still **no** MAIN-BRAIN write without Sprint D ballot

`loved ≠ proven` · PERN multi-device remains **HOLD**

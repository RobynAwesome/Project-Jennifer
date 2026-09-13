# Sprint A2 — Hosting Prep Package (Master-owned secrets)

**Status:** Renter-prepared · **execution HOLD until Master sets secrets**  
**Goal:** Stranger opens a public `/game` URL and completes `LOVE_LOOP_PLAYTEST.md`  
**Does not claim:** hosted production love

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

---

## 1. Secrets / vars Master must set

### GitHub Actions (web deploy)

| Name | Kind | Purpose |
|---|---|---|
| `VERCEL_TOKEN` | secret | `workflow_dispatch` deploy_web |
| `VERCEL_ORG_ID` | secret | Vercel org |
| `VERCEL_PROJECT_ID` | secret | Vercel project for `apps/web` |
| `NEXT_PUBLIC_JENNIFER_API_URL` | variable | Public API origin, **no trailing slash** |

Workflow: `.github/workflows/deploy.yml` → Actions → Deploy → `deploy_web=true`.

### API host (Fly / Railway / Render / VM)

| Name | Purpose |
|---|---|
| `NODE_ENV=production` | Enables empty-CORS fail-closed + Origin required |
| `JENNIFER_CORS_ORIGINS` | Exact prod web origin(s), comma-separated |
| `PORT` | Platform port |
| `JENNIFER_CORS_ALLOW_MISSING_ORIGIN` | Leave **unset** in public prod |

Do **not** set `ALLOW_MISSING_ORIGIN` on the stranger-facing API.

---

## 2. Deploy sequence (Master)

1. Deploy API with CORS origins = final web URL.  
2. Set `NEXT_PUBLIC_JENNIFER_API_URL` to that API URL.  
3. `workflow_dispatch` deploy_web=true (or Vercel CLI).  
4. Curl health: `GET {API}/health` with header `Origin: {WEB}`.  
5. Open `{WEB}/game` and run `LOVE_LOOP_PLAYTEST.md`.  
6. File receipt with pass/fail + one player quote (use `RECEIPT_TEMPLATE.md`).  
7. Confirm journal shows **local** continuity reveal after episode (not demo-only).

---

## 3. Honesty checklist

- [ ] README does not say “live” until playtest receipt exists  
- [ ] Continuity still labelled continuity-store / local — never authoritative from in-memory  
- [ ] Epistemic receipts remain `actor-model` / `canonical: false`  

---

## 4. Renter cannot do

- Invent or paste production tokens  
- Claim stranger love without the human playtest receipt  

Next: Master fills secrets → renter can help verify CORS/health and draft the playtest receipt after humans play.

# ANTIGRAVITY_HANDOFF — interview-intelligence

**Author:** Claude (cloud session, Project "project"). **Date:** 2026-10-02.
**Feature:** MECE Interview Intelligence — an independent CV + JD → adaptive interview →
evidence-traced assessment product, Pro-only, built as its **own service** with its own
schema. **Branches:** new repo `consilio-interview-intelligence` (main); frontend committed on
`consilio` **`main`** (owner's instruction 2026-10-02: test on the live site). The II pages stay
dormant ("not available yet") until the env vars below are set.
Full design: `D:\dev\mece\consilio-interview-intelligence\docs\` (00_AUDIT, A–M, BUILD_STATUS).

```
touches:  NEW repo   D:\dev\mece\consilio-interview-intelligence\  (FastAPI service, migrations/,
                     qa/, tests/, docs/, render.yaml, .env.example) — nothing shared with
                     consilio-backend, which is NOT touched at all.
          frontend   NEW  app/api/interview-intelligence/token/route.ts
                     NEW  app/(app)/interview-intelligence/{page,new/page,session/[id]/page,report/[id]/page}.tsx
                     NEW  app/(app)/admin/interview-intelligence/page.tsx
                     NEW  components/interview-intelligence/{Hub,SetupFlow,InterviewRoom,ReportView,primitives}.tsx
                     NEW  components/interview-intelligence/admin/IIAdminClient.tsx
                     NEW  lib/interview-intelligence/{api,types,format,assertion}.ts
                     EDIT components/admin/admin-nav.tsx (+1 import, +1 row "Interview Intelligence")
          database   NEW schema `interview_intel` + role `ii_service` (no change to public.*)
breaking: no. No existing CONTRACTS.md surface (C1–C9) changes. PROPOSES a new contract
          C10 · "II entitlement assertion" (MECE server → II service) — needs owner OK before
          it is written into CONTRACTS.md (text below).
affects:  none of the existing features. New feature row proposed for LEDGER (below).
```

## What it is (one paragraph)
CV + JD in → structured candidate profile, role profile and role family (30 families, not
consulting-only) → competency model with rubrics frozen before any answer → blueprint for one
of 16 modes × 3 depths × 5 difficulties × 15–60 min → adaptive interview (deterministic decision
policy + interview memory + CV-claim ladder + neutral contradiction clarification) → evidence
with verbatim-quote verification → per-competency evaluation with separate confidence and
"not sufficiently tested" ≠ weak → feedback that must pass a bad-feedback detector → report
(role alignment, competency map with evidence drawers, what the interviewer learned, critical
moments, CV claims, question review with "why was I asked this?", next questions, prep plan,
progress, recurring patterns, targeted re-attempt). Max 2 active interviews per user. Admin
console with test-user management (no emails in code), flags/limits, health, model runs, audit.

## Gates (run 2026-10-02)
- II service: `pytest` on **Postgres 16 → 260 passed**; on **SQLite → 259 passed, 1 skipped**
  (Postgres-only race test). `python -m compileall` clean.
- Migration: `migrations/0001_interview_intel.sql` applied **twice** to a fresh Postgres 16 DB →
  idempotent; 26 tables, RLS on all 26, 26 policies; a role given a stray SELECT grant sees 0 rows.
- Frontend: `tsc --noEmit` on the whole `consilio` project in place → **EXIT 0**.
  `next build` on a copy of the repo → **compiled**, all 6 II routes built (Google Fonts had to
  be stubbed in the copy because the sandbox has no internet — nothing stubbed in your tree).
- Browser walk-through (Playwright; real II service with simulated models + the real II
  components): free-user Pro gate, admin adds a test user, settings, upload CV → paste JD → role
  understanding → modes → difficulty → duration → build → room → 5 turns → end → report →
  mobile. No II console errors.
- Token interop: the TS signer (`lib/interview-intelligence/assertion.ts`) → II's Python
  verifier and the live service → accepted.
- `python -m qa.simulate_interview --all --simulated` → 56/56 interviews produced reports.
- NOT verified: **assessment quality with real models** (no AI keys here — every run used the
  offline simulator); golden labels are author drafts; streaming voice not built. See
  `docs/BUILD_STATUS.md` §3 before launch.
- Pre-existing, not changed: `consilio` ESLint config throws a circular-config error
  (eslint-config-next 16 + ESLint 8); `next build` ignores lint.

## Phased landing (each phase has its gate)

**Phase 0 — repos**
1. `D:\dev\mece\consilio-interview-intelligence` is committed locally (no remote yet). Create a
   private GitHub repo `interview-intelligence` and push `main` to it.
2. `consilio`: the II files + this handoff are committed on `main` (only those files; not
   `push_out.txt` or `.brain/STATE.md`). `git push origin main`.
   Gate: `npx tsc --noEmit` EXIT 0 (run in place 2026-10-02); Vercel build.

**Phase 1 — secrets** (never into git, `.brain/` or handoffs) — already generated on 2026-10-02
in `D:\dev\mece\_notes\INTERVIEW_INTELLIGENCE_SECRETS.txt` (outside every repo); step 3 is only
needed to rotate them.
3. `cd consilio-interview-intelligence && python -m scripts.generate_keys` → prints
   `II_ASSERTION_PRIVATE_KEY` (Vercel, server env only), `II_ASSERTION_PUBLIC_KEY`,
   `II_ENCRYPTION_KEY`, `II_DRIVE_FOLDER_SALT` (Render). Keep `II_ENCRYPTION_KEY` in the
   password manager: losing it makes stored documents unreadable.

**Phase 2 — database**
4. Supabase SQL editor (postgres role): run `migrations/0001_interview_intel.sql`, then
   `ALTER ROLE ii_service WITH PASSWORD '<generated>';`. Do **not** add `interview_intel` to
   the API "exposed schemas". Gate: running the file a second time succeeds with no changes.
5. `II_DATABASE_URL = postgres://ii_service:<password>@<direct-db-host>:5432/postgres`
   (direct connection or session pooler; not the transaction pooler).

**Phase 3 — II service on Render**
6. New Web Service from the II repo using `render.yaml` (region Singapore — closer to the Tokyo
   DB and to Indian users than Oregon). Set the `sync: false` env vars: `II_DATABASE_URL`,
   `II_ASSERTION_PUBLIC_KEY`, `II_ENCRYPTION_KEY`, `II_OPENAI_API_KEY` (or other provider keys),
   `II_ADMIN_EMAILS` (optional — MECE admins are II admins by default),
   `II_BOOTSTRAP_TEST_EMAILS=<test-account-1-email>,<test-account-2-email>` (the two real test
   addresses; placeholders only in the repo). Drive vars only if Drive is wanted now.
   Gate: `GET /healthz` → `{"ok":true,"assertion_keys":1,...}`.

**Phase 4 — frontend on Vercel**
7. Vercel env: `NEXT_PUBLIC_II_API_URL=https://<ii-service>.onrender.com`,
   `II_ASSERTION_PRIVATE_KEY` (server), `II_ASSERTION_KID=k1`; redeploy `main`
   (`NEXT_PUBLIC_*` is baked in at build time). Add the preview origin pattern to `II_CORS_ORIGINS`
   only if it is not matched by the default `*-consilioo.vercel.app` regex.
   Gate: signed in as an admin, `/admin/interview-intelligence` loads; as a test account,
   `/interview-intelligence` loads and an interview runs end to end; as a free account, the
   Pro gate shows.

**Phase 5 — real-model quality gate (before any Pro user sees it)**
8. With the production model routes: `python -m qa.run_golden --repeats 3 --record` and
   `python -m qa.simulate_interview --all --llm-candidate`. The golden run must report
   `gate failures: none`; read the per-archetype agreement and a few full reports per family.
   Run 5–10 real practice interviews with the two test accounts.

**Phase 6 — launch**
9. Admin → Interview Intelligence → Settings → `ii.enabled_for_pro` = on. Add a nav link to
   `/interview-intelligence` in the app nav (deliberately not done: nothing changes for users
   during the preview).

## Proposed CONTRACTS.md C10 (needs owner OK — not written into CONTRACTS.md)
```
## C10 · II entitlement assertion   (v1, 2026-10-02)
Issuer: consilio GET /api/interview-intelligence/token (Node runtime, no-store, Supabase session).
JWS, alg EdDSA (Ed25519), header kid. Claims: iss "mece-app", aud "mece-interview-intelligence",
sub (MECE user id, uuid), email (lower-case; "" unless confirmed), tier (effectiveTier: free|lite|pro),
sub_exp (ISO|null), ent (["interview_intelligence"] iff tier=pro), adm (users.is_admin),
iat/nbf/exp (exp-iat ≤ 900; issued with 300), jti (uuid), ver 1. Guests are refused.
Verifier: consilio-interview-intelligence auth/assertion.py (pinned alg, iss/aud/ver/lifetime).
Access is decided by II (flags + test grants + ent), never by a request field.
BREAKING if: claim renamed/removed, iss/aud/alg changed (bump ver). Adding optional claims: additive.
Owner files: consilio app/api/interview-intelligence/token/route.ts, lib/interview-intelligence/assertion.ts;
             II interview_intelligence/auth/assertion.py.
```

## Proposed LEDGER row
| Interview Intelligence | Cloud (this session) | main (consilio) + repo interview-intelligence | **BUILT, NOT DEPLOYED** — offline gates green; real-model quality gate pending (Phase 5) | consilio: app/api/interview-intelligence, app/(app)/interview-intelligence, app/(app)/admin/interview-intelligence, components/interview-intelligence, lib/interview-intelligence; whole II repo | C10 (new); C6 read-only (users.subscription_tier, subscription_expires_at, is_admin, is_guest) |

## Notes for the record
- `.brain/STATE.md`, `CHANGELOG.md`, `CONTRACTS.md`, `LEDGER.md` were not edited.
- This session's `git fetch` in `consilio` left two empty lock files (`.git/index.lock`,
  `.git/objects/maintenance.lock`) because deletes were not yet allowed; they were removed
  after you granted delete access. No other git state was changed in `consilio` or
  `consilio-backend` (both were already up to date with origin; `consilio-backend` has your
  own uncommitted edits, untouched).
- A temporary archive used for the build check was written to `D:\dev\mece\Claude outputs\`
  and deleted again.

## After merging
`git push` in `consilio` and in `consilio-interview-intelligence`, then `node .brain\sync.mjs`
in `consilio`. Do not hand-edit STATE.md.

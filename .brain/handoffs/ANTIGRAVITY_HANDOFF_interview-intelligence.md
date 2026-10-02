# ANTIGRAVITY_HANDOFF — interview-intelligence (host mode)

**Author:** Claude (cloud session, Project "project"). **Date:** 2026-10-02 (revised the same
day: the separate Render service was dropped at the owner's request — no paid instance, no
new AI keys).
**Feature:** MECE Interview Intelligence (II) — CV + JD → adaptive interview → evidence-traced
assessment, Pro-only. II is its own Python package with its own database schema; it now runs
**inside the existing consilio-backend process**, mounted at `/ii`.
**Branches:** `main` in both repos (owner's choice: test on the live site; II is invisible to
users until an admin grants access, and stays dormant until its env var is set).
Full design: `consilio-backend/interview-intelligence/docs/` (00_AUDIT, A–M, BUILD_STATUS).

```
touches:  consilio-backend
            NEW  interview-intelligence/   (II package, migrations/, tests/, qa/, docs/, scripts/)
            NEW  routes/interview_intelligence.py   (glue: identity resolver + mount at /ii)
            EDIT main.py            (+4 lines at the end: import the glue, mount)
            EDIT requirements.txt   (+4 packages: SQLAlchemy, psycopg[binary], python-docx, olefile)
          consilio (frontend)
            EDIT lib/interview-intelligence/api.ts   (host mode: <NEXT_PUBLIC_API_URL>/ii + Supabase token)
            EDIT components/interview-intelligence/admin/IIAdminClient.tsx  (2 strings)
            NEW  lib/interview-intelligence/useAccess.ts  (nav check, once per page load)
            EDIT components/app-nav.tsx, components/mobile-bottom-nav.tsx  ("Interview Intelligence"
                 in More — shown only when II's GET /ii/v1/access says allowed)
            (all other II frontend files landed earlier in 39065a1)
          database
            NEW schema `interview_intel` + role `ii_service` (no change to public.*)
breaking: no. No CONTRACTS.md surface (C1–C9) changes. New backend path prefix /ii (no
          existing route uses it). Reads C6 users columns READ-ONLY through the backend's
          existing service-role client: subscription_tier, subscription_expires_at, is_admin,
          is_guest. The earlier proposed C10 (signed assertion) is NOT needed in host mode —
          kept in code as a dormant option for a future standalone service; not proposed now.
affects:  none of the existing features. Shares the backend's process (memory/CPU) — see Risks.
```

## How host mode works
`main.py` → `routes/interview_intelligence.py` → `interview_intelligence.host.mount(app, "/ii", resolver)`.
* The resolver uses the backend's own `get_verified_user` (same 60 s auth cache), `is_guest_user`,
  one `users` read and `_effective_tier_from_row` → `(user id, confirmed email, tier, is_admin, is_guest)`.
  II caches that per token for 60 s and makes every access decision itself.
* Lazy: nothing of II (SQLAlchemy, parsers, routers) is imported at backend start-up; it loads on
  the first `/ii` call, off the event loop. A failure to start is logged and `/ii` answers 503 —
  the rest of the backend is never affected.
* Dormant: until `II_DATABASE_URL` is set, every `/ii` call answers 503 `not_configured`.
* Shared keys: II uses `II_*` keys if set, else the backend's `OPENAI_API_KEY`, `GROQ_API_KEY`,
  `GEMINI_API_KEY`/`GOOGLE_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_DRIVE_*`.
* One background worker thread (idle poll every 20 s, fast while there is work), DB pool of 3.
* CORS and lifespan belong to the backend; II's worker stops with the backend.

## Gates (run 2026-10-02)
- II suite (incl. 11 new host-mode tests): Postgres 16 → **271 passed**; SQLite → **270 passed,
  1 skipped** (Postgres-only race test).
- II suite in a venv built from **consilio-backend's own requirements.txt + the 4 new packages**
  (fastapi 0.136.1, starlette 1.0.0, pydantic 2.13.4, PyJWT 2.12.1, cryptography 48.0.0,
  python-multipart 0.0.9, SQLAlchemy 2.1.1, psycopg 3.3.6; Python 3.13): **271 passed** on
  Postgres, **270 + 1 skipped** on SQLite. The combined requirements resolve with no conflicts.
- Real-backend smoke test: the actual `consilio-backend/main.py` imported with II mounted;
  backend auth faked only at `get_verified_user` / the users read; II on Postgres **as the
  `ii_service` role after running the migration** (RLS on): `/health` and `/` unchanged; II not
  imported at start-up; `/ii/healthz` ok; 401 / guest 403; backend CORS gives one
  `Access-Control-Allow-Origin`; admin adds a test user by email → that free account gets in,
  a Pro account without the launch flag does not; CV upload → JD → background worker builds the
  plan → interview → report; another account gets 404; admin console 200 / non-admin 403.
- Migration `0001_interview_intel.sql` applied twice → idempotent (26 tables, RLS, 26 policies).
- Frontend: `tsc --noEmit` on the whole `consilio` project → **EXIT 0** (with the host-mode `api.ts`).
- NOT verified: assessment quality with real models (Phase 5); behaviour on Render's actual
  512 MB box (measured locally only — see Risks).

## Risks (owner accepted the shared-process trade-off to stay free)
1. **Memory.** The backend already sits near Render's 512 MB cap (`RENDER_OOM_FIX.md`).
   Measured locally: II adds ~**42 MB** when it first loads and ~**65 MB** after a full
   interview. Before the first `/ii` call it adds nothing. If Render's memory graph shows OOM
   restarts (exit 137) after II is used, the fixes in `RENDER_OOM_FIX.md` apply (1 worker,
   drop `pyiceberg`, lazy imports) — or unset `II_DATABASE_URL` to switch II off instantly.
2. **Latency.** The backend runs in Oregon, the database in Tokyo (~100 ms per round trip).
   One interview turn runs **~22 SQL statements** (~2 s of round trips) on top of the model
   call. Acceptable for testing; can be cut later by batching (no schema change).
3. **Shared AI spend.** II's spend uses the same OpenAI key. II has its own per-session cost
   cap ($1.50) and global daily budget ($25) — both editable in Admin → Interview Intelligence.
4. **Free-tier spin-down.** If Render sleeps, an in-flight background job resumes when the
   service wakes and the next `/ii` call loads II (durable queue; nothing is lost).

## Phased landing (each phase has its gate)

**Phase 0 — code (done in this session, owner pushes)**
1. `consilio-backend`: commit on `main` with the files under *touches*. `consilio`: commit on
   `main` with the two frontend edits + this handoff. Owner runs `git push` in both, then
   `node .brain\sync.mjs` in `consilio`.
   Gate: Render auto-deploys the backend; `GET <backend>/ii/healthz` → 503 `not_configured`
   (correct: dormant) and every existing page works as before.

**Phase 1 — database (Supabase SQL editor, postgres role, once)**
2. Run `D:\dev\mece\_notes\INTERVIEW_INTELLIGENCE_SUPABASE.sql` (migration + the role password
   line). Do **not** add `interview_intel` to the API "exposed schemas".
   Gate: running it a second time succeeds with no changes.

**Phase 2 — switch II on (Render → consilio-backend → Environment)**
3. Add exactly two variables (values are in `D:\dev\mece\_notes\INTERVIEW_INTELLIGENCE_SECRETS.txt`):
   `II_DATABASE_URL` = Session pooler URL, user `ii_service.<project-ref>`, port **5432**
   (Render cannot reach Supabase's IPv6-only direct host; not the transaction pooler 6543);
   `II_ENCRYPTION_KEY`. Save → Render redeploys.
   Gate: `GET <backend>/ii/healthz` → `{"ok": true, ...}`.

**Phase 3 — frontend (Vercel)**
4. Nothing to add. **Do not set `NEXT_PUBLIC_II_API_URL`** (that switches the frontend to the
   standalone service). If it was added earlier, delete it and redeploy.

**Phase 4 — test on the site**
5. As an admin (`users.is_admin`): `/admin/interview-intelligence` → Test users → add the test
   accounts' emails. Those accounts open `/interview-intelligence` and run interviews.
   Gate: admin page loads; a test account completes an interview and sees the report; a
   free account without a grant sees the Pro gate.

**Phase 5 — real-model quality gate (before any Pro user sees it)**
6. With production keys: `python -m qa.run_golden --repeats 3 --record` and
   `python -m qa.simulate_interview --all --llm-candidate` from `interview-intelligence/`
   (needs `II_DATABASE_URL` pointing at a scratch database and the AI key in the shell).
   Must report `gate failures: none`; read several full reports per family.

**Phase 6 — launch**
7. Admin → Interview Intelligence → Settings → `ii.enabled_for_pro` = on. The nav link is
   already there: "More → Interview Intelligence" appears for exactly the accounts II lets in
   (admins, test users, and Pro once this flag is on), checked on every page load.

## Proposed LEDGER row
| Interview Intelligence | Cloud (this session) | main (both repos) | **BUILT, DORMANT** until `II_DATABASE_URL` is set; offline gates green; real-model quality gate pending (Phase 5) | consilio-backend: interview-intelligence/, routes/interview_intelligence.py, main.py (mount), requirements.txt; consilio: app/(app)/interview-intelligence, app/(app)/admin/interview-intelligence, components/interview-intelligence, lib/interview-intelligence, app/api/interview-intelligence (dormant) | C6 read-only (users.subscription_tier, subscription_expires_at, is_admin, is_guest) |

## Superseded
- The standalone repo `satyam11081998-lab/interview-intelligence` and the folder
  `D:\dev\mece\consilio-interview-intelligence` are superseded by
  `consilio-backend/interview-intelligence/` — archive them; do not develop there.
- `app/api/interview-intelligence/token/route.ts` and `lib/interview-intelligence/assertion.ts`
  stay in the frontend, unused unless `NEXT_PUBLIC_II_API_URL` is set (standalone mode).

## Notes for the record
- Run II's tests from inside `consilio-backend/interview-intelligence/` (`pytest -q`); from the
  backend root its `tests` package would clash with the backend's own `tests`.
- `.brain/STATE.md`, `CHANGELOG.md`, `CONTRACTS.md`, `LEDGER.md` were not edited.
- `consilio-backend` working copy: the many `M` files shown by a Linux `git status` are
  CRLF-only (Windows checkout); commits from this session were made with
  `core.autocrlf=true` and contain only the files listed above. Your own untracked files
  (`migrations/2026-09-15_seo_pages.sql`, `tools/eval_result_*.txt`) were not touched.
- A stale empty `.git/objects/maintenance.lock` (27 Sep) in `consilio-backend` was removed.

## After merging
`git push` in `consilio-backend` and `consilio`, then `node .brain\sync.mjs` in `consilio`.
Do not hand-edit STATE.md.

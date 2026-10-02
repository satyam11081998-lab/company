# ANTIGRAVITY_HANDOFF — interview-intelligence (host mode)

**Author:** Claude (cloud session, Project "project"). **Date:** 2026-10-02, seventh pass 2026-10-03 (revised the same
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

## Voice call (third pass, 2026-10-02) — the interview is now a spoken call by default

Owner feedback: the room felt like a chat box; the spec (§29) asked for a live spoken interview with
barge-in. Built:

```
touches:  consilio
            NEW  components/interview-intelligence/call/{CallRoom,VoiceOrb}.tsx   (lobby + live call UI)
            NEW  lib/interview-intelligence/voice/{types,text,conductor,audio,realtime,standard,vad}.ts
            NEW  qa/interview-intelligence/voice/{conductor,realtime}.test.cjs + run.mjs (25 node tests)
            EDIT components/interview-intelligence/InterviewRoom.tsx (voice by default; text thread restyled)
            EDIT components/interview-intelligence/admin/IIAdminClient.tsx (voice.engine selector)
            EDIT lib/interview-intelligence/{api,types}.ts (liveSession, liveUsage, speak voice, voice_engine)
          consilio-backend/interview-intelligence
            EDIT voice/routes.py (POST /v1/voice/live, /v1/voice/live/usage; per-user voice gate cache)
            EDIT access/flags.py (voice.enabled default ON; voice.engine realtime|standard), rate_limit.py,
                 ai/pricing.py (realtime usage pricing), ai/runner.py (record_live_usage), config.py
                 (II_REALTIME_MODEL / _TRANSCRIBE_MODEL / _EAGERNESS), api/routes.py (/me voice_engine),
                 api/admin_routes.py (grant changes refresh caches), ai/simulated.py (playable audio)
breaking: no. New II endpoints only; no CONTRACTS.md surface; no DB migration (no schema change).
```

How it works: lobby (mic check + level meter, mic picker, interviewer voice Marin/Cedar/Alloy) →
full-screen call. **Live engine** (default): the browser opens WebRTC straight to OpenAI Realtime with
a secret II mints (`/v1/voice/live`, uses the backend's OPENAI_API_KEY); semantic end-of-turn,
barge-in, streaming transcript; auto-replies OFF — the speech model only says the line II decided.
**Standard engine**: own VAD → /voice/transcribe → /turns → /voice/speak sentence by sentence; also
the automatic fallback if a live call cannot connect. Admin → Interview Intelligence → Settings →
`voice.engine` switches between them; `voice.enabled` off = text only.

Gates (2026-10-02): II suite 279 passed (Postgres, backend pins) / 278 + 1 skipped (SQLite);
voice node tests 25/25 (device); `tsc --noEmit` EXIT 0 (device); `next build` OK (copy).
Browser runs (built app, real Chromium): standard voice with a fake microphone — lobby, mic check,
2 spoken answers reached II as `kind=voice`, typed answer inside the call, mute, break/resume,
mobile, end → completed; live call over real WebRTC to a mock realtime peer — secret minted with
the chosen voice and auto-replies off, opening line spoken verbatim, streamed words on screen,
"Okay." ack then next line, a mid-answer pause kept as ONE answer, barge-in sent cancel + clear,
7 responses metered, end → completed; text mode thread + switch back to voice. No console errors.
NOT verified here: real OpenAI Realtime audio quality/latency (first heard on the live site).

Cost: live ≈ $0.02/min of the candidate speaking + ≈ $0.08/min of the interviewer speaking
(≈ $0.6–0.9 per 30-min interview); standard ≈ $0.25. Voice spend counts in II's daily budget
(`limits.daily_budget_usd`, default $25), never in the per-interview AI cap.

## Call stability, Gemini Live, per-step AI routing (fourth pass, 2026-10-02)

Owner feedback: the call cut itself off / lines went unspoken; an open call must not keep costing
money; add Gemini Live as an engine switchable in admin; parse documents on Gemini's free tier and
keep judgement-heavy steps on OpenAI.

```
touches:  consilio
            NEW  lib/interview-intelligence/voice/gemini.ts        (Gemini Live transport)
            NEW  qa/interview-intelligence/voice/gemini.test.cjs   (12 tests, fake socket)
            EDIT lib/interview-intelligence/voice/{conductor,text,types,realtime,standard,audio}.ts
                 (echo-aware barge-in, 5-min answer cap, silence ladder, out-of-context OpenAI lines)
            EDIT components/interview-intelligence/call/CallRoom.tsx (engine choice, hang-up on
                 break / 4 min silence / 2 min hidden tab, redial on resume and on drops)
            EDIT components/interview-intelligence/admin/IIAdminClient.tsx (Gemini option, AI routing tab)
            EDIT lib/interview-intelligence/{api,types}.ts, qa/.../{conductor,realtime}.test.cjs
          consilio-backend/interview-intelligence
            EDIT voice/routes.py (POST /v1/voice/gemini, /v1/voice/gemini/usage; OpenAI
                 interrupt_response off), ai/routing.py (per-step presets), ai/runner.py
                 (Gemini minutes metering), access/flags.py (ai.routes; voice.engine += gemini),
                 api/admin_routes.py (GET/PATCH /v1/admin/ai-routing), config.py (II_GEMINI_MODEL),
                 .env.example, docs/BUILD_STATUS.md
            NEW  tests/test_routing.py; EDIT tests/test_voice.py, tests/conftest.py
breaking: no. New II endpoints only; no CONTRACTS.md surface; no DB migration (flags are rows).
          No new env var is required: Gemini uses the backend's existing GEMINI_API_KEY /
          GOOGLE_API_KEY and google-genai (already in requirements.txt).
```

What changed for the candidate: the interviewer no longer cuts itself off on laptop speakers
(server-side interruption off; the browser cuts in only on words that are not the line's own);
talking over the interviewer works on the live engines; an answer is capped at 5 minutes (warning
at 4:30); silence → nudge at 1 min, "are you still there?" at 3, pause at 4; 2 minutes on another
tab → pause. Every pause hangs the voice line up and releases the mic; Resume redials.

Admin: Settings → `voice.engine` = OpenAI live | Gemini live | Standard. New tab **AI routing**:
each step's model preset (Gemini free tier → OpenAI fallback, OpenAI fast, OpenAI strong, Groq),
reset to default. Defaults: resume/JD parsing, role family, plan check → Gemini; everything that
judges answers → OpenAI. Free-tier caveat shown in the tab: Google may use free-tier content; II
redacts contact details and protected attributes from documents before any model call.

Gates (2026-10-02): II suite **287 passed** on Postgres 16 with the backend-pinned venv;
SQLite 286 + 1 skipped; voice node tests **47/47** on the device; device `tsc --noEmit` EXIT 0;
`next build` OK (copy). Browser runs (built app, Chromium): Gemini call against a local fake Gemini
Live socket (pinned token config, SAY lines, 2 voice answers, no SAY during Gemini's own answer,
mic streamed only while talking, break closes the socket + meters, resume redials, a dropped
socket redials by itself, admin AI-routing change/reset); OpenAI live call (lines with
`input: []`, echo ignored, words barge in); standard voice regression; hidden tab 2 min → paused.
NOT verified here: real Gemini Live / OpenAI audio and Gemini free-tier concurrency limits.

Phase for this pass: push both repos (Render + Vercel redeploy). To try Gemini voice: Admin →
Interview Intelligence → Settings → voice.engine → Gemini live. Nothing else to configure.

## Live progress while waiting (fifth pass, 2026-10-02)

Owner ask: reading the resume / JD felt like "loading, loading"; show what is happening and a
percentage, enough to keep people engaged without overdoing it.

```
touches:  consilio
            NEW  components/interview-intelligence/ProgressCard.tsx   (steps, %, findings, chips)
            NEW  lib/interview-intelligence/progress.ts               (smooth %, JD key-term match)
            NEW  qa/interview-intelligence/progress/{run.mjs,progress.test.cjs} (4 node tests)
            EDIT components/interview-intelligence/{SetupFlow,ReportView}.tsx, lib/interview-intelligence/types.ts
          consilio-backend/interview-intelligence
            NEW  interview_intelligence/jobs/progress.py   (in-memory live progress + ETA from past runs)
            EDIT documents/{analysis,service}.py, interview_engine/blueprint.py,
                 report_engine/assessment.py, api/routes.py (progress fields on 3 GET responses)
            NEW  tests/test_live_progress.py; EDIT tests/conftest.py; docs/BUILD_STATUS.md §0c
breaking: no. Additive response fields only (`progress`, `prep_progress`); no CONTRACTS.md
          surface; no DB migration; no env var.
```

What the candidate sees: CV → "Read your CV (2 pages, 640 words)", "Kept your personal details
away from the AI (2 contact details hidden)", "Understanding your experience — looking for
achievements and the numbers behind them…", then the findings (roles, years, achievements with
numbers, skills, claims to be probed) and skill chips. They can move on to the JD while the CV is
read. Role understanding adds "Key terms from the job description — your CV mentions 6 of 10".
Building and the report show their real stages with findings ("9 skills this role needs, 6 clearly
backed by your CV", "Scoring 8 of 9: Ownership"). Every step and finding is real; only the share of
the current model call is estimated (from past run times), and 100 % only when done.

Gates (2026-10-02): II suite 292 passed (Postgres 16, backend-pinned venv) / 291 + 1 skipped
(SQLite); progress node tests 4/4 and voice 47/47 on the device; device `tsc --noEmit` EXIT 0;
`next build` OK (copy); browser walk-through with simulated models slowed to realistic times
(setup → build → interview → report, desktop + phone), no console errors.

## Interviewer grounding + sectioned report (sixth pass, 2026-10-02)

Tester reports: a follow-up about "the segment" nobody mentioned; a clarifying question met with "okay"
and a new question; the same question asked twice in other words. Owner also asked for the report as
left-hand sections instead of one long page.

```
touches:  consilio-backend/interview-intelligence
            NEW  interview_intelligence/interview_engine/grounding.py  (never-said / same-question checks)
            EDIT interview_engine/{interviewer,orchestrator,policy,intents}.py, evidence_engine/extractor.py,
                 ai/prompts.py (interviewer@2, turn_analyzer@3, question_generator@2), versions.py (iv-2, pol-2, qe-2)
            NEW  tests/test_interviewer_grounding.py; EDIT tests/test_ai_runner.py; docs/BUILD_STATUS.md §0d
          consilio
            EDIT components/interview-intelligence/ReportView.tsx (left-hand sections, deep links, phone tabs)
            EDIT components/interview-intelligence/admin/IIAdminClient.tsx (how each line was heard / why said)
            EDIT lib/interview-intelligence/voice/conductor.ts (+ test): no "Okay." after a question
breaking: no. No API, schema or CONTRACTS.md change; report JSON unchanged.
```

Causes and fixes are in BUILD_STATUS §0d. Every interviewer line is now checked before it is spoken:
anything presented as already said must appear in the question, the candidate's own words or the CV
claim under discussion; a repeat of an earlier question is replaced. Clarifying questions are answered
(about the last line, usually the follow-up) and never scored. Admin → Interviews → Inspect shows the
reason for every line.

Gates (2026-10-02): II suite 303 passed (Postgres 16, backend-pinned venv) / 302 + 1 skipped (SQLite);
voice node tests 48/48 and progress 4/4 on the device; device `tsc --noEmit` EXIT 0; `next build` OK
(copy); browser walk-through of the sectioned report (desktop + phone, deep link to a question).

## Hidden plan, real opening, breadth, plans (seventh pass, 2026-10-03)

```
touches:  consilio-backend
            EDIT interview-intelligence/  (access/plans.py NEW; access/policy.py, flags.py; auth/assertion.py
                 (tier "ultra" accepted); api/routes.py (+/v1/plans, /v1/plans/interest, /me plan fields),
                 api/admin_routes.py (+/admin/plans, grant_type); interview_engine/{modes,blueprint,
                 interviewer,orchestrator,policy,sessions,state}.py; question_engine/{generator,selector,
                 schemas}.py; cv_intelligence/schemas.py; ai/{prompts,simulated}.py; evidence_engine/extractor.py;
                 voice/routes.py (per-plan voice engine); host.py (optional news provider); data/question_*.json;
                 versions.py; docs; tests/test_breadth_and_plans.py NEW (+3 tests adjusted))
            EDIT routes/interview_intelligence.py  (+recent_headlines(): reads news_headlines READ-ONLY,
                 30-min cache, any failure -> []; passed to mount(..., news=))
          consilio
            NEW  app/(app)/interview-intelligence/plans/page.tsx, components/interview-intelligence/Plans.tsx
            EDIT components/interview-intelligence/{SetupFlow,Hub,ReportView,InterviewRoom,primitives}.tsx,
                 call/CallRoom.tsx, admin/IIAdminClient.tsx; lib/interview-intelligence/{api,types,useAccess}.ts
                 (the "Interview Intelligence" menu entry stays for an account whose free interview is
                 used — GET /ii/v1/access gains `nav`)
            REMOVED dead code: Disclosure (primitives.tsx), IIErrorBody (types.ts)
          database: none (grant types and plan settings are values in existing columns/rows)
breaking: no CONTRACTS.md surface. II's own candidate API drops plan details (documented in
          docs/C_API_CONTRACT.md "seventh pass"); only II's own frontend consumes it and is updated in
          the same pass. Reads `news_headlines` (read-only) and `priceFor('pro')` from lib/tier (read-only).
```

What and why: BUILD_STATUS §0e. In short — the candidate no longer sees the plan (the interviewer
announces the running order out loud instead, from the real plan); every interview gets breadth (the
whole CV, the person beyond it, business awareness on a real headline); a hard stop at the planned
length; and a plans layer that is invisible to the public: one free 15-minute interview per account
(off for everyone until `plans.trial_open`), Ultra by grant (or a future MECE tier "ultra") with a
fair-use cap, a plans page only people with access can open, and "Tell me when it opens" interest.

Plans page layout (2026-10-03, owner request): three short cards (price, one line, one button) and
one "Compare every feature" table, tick or cross per plan (Free / Pro / Ultra), so nothing is listed
twice. Case-practice rows read `TIER_LIMITS` from lib/tier, so they follow any change to Free or Pro.

**Decision needed before Ultra can be sold (ask first — CONTRACTS surfaces):** a real Ultra plan means
C6 `users.subscription_tier` gains `ultra` (+ any DB check constraint), the Payments flow (Razorpay
order/verify/webhook, `lib/tier.ts` TIER_PRICING, `/upgrade`) gains a tier, and the backend's
`_effective_tier_from_row` returns it. II needs no change for that day: it already treats tier
`ultra` as Ultra.

Gates (2026-10-03): II suite 323 passed (Postgres 16) / 322 + 1 skipped (SQLite); compileall clean;
glue `recent_headlines()` unit-checked against a stub Supabase client (rows mapped, cached, failure -> []);
voice node tests 48/48, progress 4/4; `tsc --noEmit` EXIT 0; `next build` OK (copy) incl.
`/interview-intelligence/plans`; browser walk-through: free interview end to end (15 minutes enforced,
no plan on the ready screen, spoken opening with agenda, report → "That was your free interview",
hub read-only), plans page desktop + phone (no sideways scroll), interest recorded once, admin Plans,
Test users with types, Inspect shows the plan.

## Proposed LEDGER row
| Interview Intelligence | Cloud (this session) | main (both repos) | **BUILT, LIVE for admins + test users**; plans layer (free interview, Ultra by grant, plans page) BUILT and NOT public; real-model quality gate pending (Phase 5) | consilio-backend: interview-intelligence/, routes/interview_intelligence.py, main.py (mount), requirements.txt; consilio: app/(app)/interview-intelligence (incl. plans), app/(app)/admin/interview-intelligence, components/interview-intelligence, lib/interview-intelligence, app/api/interview-intelligence (dormant) | C6 read-only (users.subscription_tier, subscription_expires_at, is_admin, is_guest); news_headlines read-only; lib/tier priceFor read-only |

## Superseded
- The standalone repo `satyam11081998-lab/interview-intelligence` is superseded by
  `consilio-backend/interview-intelligence/` — archive it on GitHub; do not develop there. Its local
  clone `D:\dev\mece\consilio-interview-intelligence` was removed on 2026-10-03 (clean, nothing
  unpushed; its only extra file was the standalone `render.yaml`). If a Render service
  "mece-interview-intelligence" was ever created from it, delete it (plan: starter = paid).
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

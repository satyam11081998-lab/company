# ANTIGRAVITY_HANDOFF — openai-cost-hardening (Brain / Cowork, 2026-07-07) — AS-BUILT

Status: **IMPLEMENTED in the working tree** (not yet committed). This documents what
landed so another brain / the Antigravity worker can review, run the gates, and merge.
Source of the incident analysis: `MECE_OPENAI_COST_FORENSIC_AUDIT_2026-07-07.md` (repo root,
one level above consilio/).

touches: | breaking: **no CONTRACTS.md surface change**. `/transcribe` & `/extract-text` now
REQUIRE an Authorization header (frontend already sends it — wired below). New env vars are
all optional with safe defaults. One new migration (0036, additive).

affects: Case-solve UX (voice), Bullet Lab, GD briefs, News pipeline, Daily cron, Admin (usage).

---

## What changed (by area)

### 1. Security — the two open OpenAI proxies are closed (was the only UNBOUNDED spend vector)
- `routes/transcribe.py`, `routes/vision.py`: now require a verified Supabase JWT
  (`get_verified_user_id`), are rate-limited (12/min/user), size-capped (audio ≤6 MB,
  base64 ≤6 M chars), budget-checked, per-tier quota-checked, and logged. Vision model
  moved gpt-4o → **gpt-4o-mini** (OCR is mini-strength, ~94% cheaper). Whisper now uses
  `response_format="verbose_json"` to bill the EXACT `duration`, not a byte estimate.
- Frontend forwards the session token: `lib/api.ts` `transcribeAudio(blob, token)` /
  `extractTextFromImage(b64, token)`; `components/dictation-button.tsx` and
  `components/camera-button.tsx` self-fetch the token via `createClient()` (callers
  unchanged); `ConversationalSolve.tsx` passes its existing `token`.

### 2. Per-tier daily quotas + in-app "remaining" UI (the owner-requested feature)
- `services/ai_usage.py` (NEW): `ai_usage_log` writer, per-user voice-minute + OCR-image
  quotas, and a global daily-budget kill switch.
- Limits (env-overridable): **voice min/day Free 5 / Lite 20 / Pro 60**;
  **OCR img/day Free 5 / Lite 20 / Pro 100**. Reset at IST midnight.
- `routes/usage.py` (NEW): `GET /usage/ai-quota` → `{tier, voice:{used_min,limit_min,
  remaining_min}, images:{used,limit,remaining}}`. Registered in `main.py`.
- transcribe/vision responses now also return the fresh `quota` so the UI updates live.
- UI: the solve composer shows "≈X min voice left today", disables the mic at 0 with a
  friendly toast, and both mic/camera surface the backend's friendly 429/413 reasons.

### 3. Mic waveform (owner-requested "ChatGPT-style, bars right→left")
- `components/mic-waveform.tsx` (NEW): Web-Audio `AnalyserNode` visualiser; newest sample
  enters on the right and scrolls left; bar colour follows CSS `color` (auto-themes).
- Wired into the solve composer (waveform REPLACES the textarea while recording) and into
  `DictationButton` (compact strip beside the stop button — covers SubmitDialog,
  submission-form, Bullet Lab).

### 4. Cost fixes
- `services/resume_ai.py`: Bullet Lab band engine was up to **7 gpt-4o calls/click**
  (1 gen + 2 fix × 3 options). Now: 1 gpt-4o gen + **at most ONE gpt-4o-mini fix per
  option**, and over-length is fixed FREE by the deterministic `_trim_to_words` (the AI
  call is spent only on the harder EXPAND case). Typical click ~$0.014 → ~$0.005. All
  resume calls now route through a logged `_chat()` helper and have `max_tokens`.
- `max_tokens` added to every previously-unbounded call (content-gen 2000, classifier 3500,
  brief 1600, abstract 2000, resume 500–4000, OCR 1500). Values re-checked to be high
  enough that a JSON response never truncates (truncation = broken feature).
- `services/brief_generator.py`: client bounded to 60 s / 1 retry (was the 600 s / 2
  default → hung calls tied up the worker; retried timeouts double-billed).
- Abstract GD briefs now CACHED: `routes/news.py` reads/writes `abstract_briefs` by
  normalised topic key → repeat topics cost $0.
- `gd_briefs` insert → **upsert on headline_id** (works with the new unique index; kills
  the concurrent cache-miss double-generate).
- News self-heal loop fixed: `services/news_pipeline.py` records each refresh ATTEMPT in
  `news_refresh_log`; `headlines_are_stale()` now needs BOTH the freshest headline AND the
  last attempt to be old, and `ensure_fresh_headlines` retries default 1 → **0**.
- Duplicate daily cron removed: `app/api/cron/refresh/route.ts` no longer kicks
  `/cron/fetch-news` (GitHub Actions already runs it; keeps the idempotent schedule-daily
  kick). GH workflow curl retries `5 → 2` in `daily-news.yml` + `daily-cases.yml`.

### 5. Observability + backstop
- Every OpenAI call site now logs to `ai_usage_log` (model, tokens, est cost, latency,
  user, endpoint). `assert_daily_budget()` (default `AI_DAILY_BUDGET_USD=10`, env) pauses
  AI with a friendly 503 for the rest of the IST day if a catastrophe cap is crossed;
  added on transcribe, vision, resume, `/submit`, `/attempts/*` (message+submit), and
  brief/abstract generation (cache hits are unaffected).

### migration
- `consilio/supabase/migrations/0036_ai_hardening.sql` (NEW, idempotent): `ai_usage_log`,
  `abstract_briefs`, `news_refresh_log`, and a partial UNIQUE index on
  `gd_briefs(headline_id)` (dedupes existing rows first). **Run this on Supabase before
  deploying the backend** — the abstract cache + brief upsert + usage log depend on it.

## New env vars (all optional; safe defaults baked in)
`AI_VOICE_MIN_FREE=5 AI_VOICE_MIN_LITE=20 AI_VOICE_MIN_PRO=60`
`AI_OCR_IMG_FREE=5 AI_OCR_IMG_LITE=20 AI_OCR_IMG_PRO=100`
`AI_DAILY_BUDGET_USD=10`

## OPS prereqs (owner — do BEFORE merge/deploy)
1. **Rotate `OPENAI_API_KEY`** in Render (new key in a dedicated OpenAI *project* per env),
   set a monthly budget + email alert in the OpenAI dashboard. The old key must be treated
   as abusable (it fronted the open endpoints). Keep it disabled-not-deleted for 24 h to
   spot lingering abusers in logs.
2. Run migration 0036 on Supabase.
3. Check the OpenAI Usage dashboard for the burn window (audit §12) to confirm abuse vs.
   organic before/after deploy.

## Gates
- Backend: `python -m py_compile` — 14/17 changed modules pass in-sandbox; the 3 that
  "fail" (`resume_ai.py`, `brief_generator.py`, `abstract_gd_generator.py`) are a KNOWN
  Cowork bash-mount staleness artifact (the mount served truncated cached copies — same
  issue logged in the mic-recording-ux handoff). All three were verified correct by
  re-reading the authoritative files. **Re-run `py_compile` on the real tree to confirm.**
- Frontend: `cd consilio && npx tsc --noEmit && next build` on the REAL tree (NOT the
  Cowork sandbox — its stale mount produces false TS errors on edited files).
- Manual QA (needs a real browser + mic/cam permission): record voice on a case → waveform
  scrolls right→left, transcript inserts, "min left" ticks down; exhaust the daily voice
  cap → mic disables + friendly toast, typing still works; camera OCR still extracts;
  Bullet Lab still returns 3 fitted options; same abstract topic twice → 2nd is instant
  (cache); `/transcribe` without a JWT → 401.

## Deferred (logged, not in this change)
- Transcript trimming for very long interview sessions (audit F6): last ~30 turns / 12k
  chars for live turns; head+tail cap in the two scoring prompt builders.
- `/health` still returns the key-loaded booleans (audit F9, LOW): the admin status page
  reads them client-side, so minimizing it needs a server-action rework — deferred to
  avoid breaking that panel. CORS `allow_origins` still lists localhost.
- Admin "AI Usage" dashboard panel over `ai_usage_log` (cost/day, by endpoint/model/user).
- Interviewer-turn streaming logs usage via `stream_options.include_usage`; if a future
  SDK bump changes that shape, the tiny shim in `interview_engine.stream_interviewer_reply`
  is where to adjust.

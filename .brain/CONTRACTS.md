# CONTRACTS — the shared surfaces that hurt when they drift

These are the only things where one brain's change silently breaks another's
work. Each has a **version**. Changing one is a `BREAKING` event: bump the
version, list it in CHANGELOG with `affects:`, and every listed feature must
re-sync before continuing. Brains propose contract changes via handoff and
ask first.

---

## C1 · DB schema — `cases` table   (v4, 2026-06-08)
Source of truth: `supabase/migrations/0001_baseline_schema.sql`,
`0002_conversational_attempts.sql`, `add-code-column.sql`, mirrored in `lib/types.ts`.
- Most-shared table in the app. Read/written by: practice-hub, daily generator, guesstimate seed, submit, dashboard.
- v3 added nullable `code text` + **FULL** unique index `cases_code_unique on cases(code)`.
  GOTCHA: `ON CONFLICT (code)` requires a FULL unique index — a partial index
  (`where code is not null`) makes Postgres throw `42P10` (§9.36).
- Multiple NULL `code`s allowed → generated/daily cases keep `code` NULL; coded guesstimates are unique/idempotent.
- v4 added nullable `skill_node text`, `skill_cluster text`, `interview_meta jsonb`,
  `mcq jsonb`, `source_brief_id uuid → news_headlines(id)`. All readers must
  treat as nullable. New tables: `skill_nodes`, `skill_edges` (read-only
  taxonomy, public read RLS), `dimension_snapshots` (per-user, auth.uid()=user_id).
- **Rule:** column adds are additive + `IF NOT EXISTS`. Any add = bump version + announce. Affects: Dashboard, Guesstimate, Daily-content.

## C2 · Scoring return contract   (v2, 2026-06-02)
Flow: backend `services/ai_scorer.py` + `services/guesstimate_backstop.py`
→ `routes/submit.py` → frontend `lib/scoring/*` + `app/(app)/results/[id]/page.tsx`.
- Stable return keys (do NOT rename without a version bump):
  `total`, `dimensions`, `arithmeticOverridden`, `rawTotal`,
  and `backstop.{findings, summary, notChecked, totalCapFactor}`.
- DEFINED by AI-evaluation-v2; CONSUMED by Dashboard, Guesstimate, Backstop.
- **Rule:** eval-v2 changing/renaming any key = `BREAKING`, affects all consumers above.

## C3 · Casebook Page schema   (v2, 2026-06-01)
Source of truth: `lib/casebook/types.ts`; consumed by `components/casebook/casebook-reader.tsx` + the build-time tree (`lib/casebook/tree.ts`).
- `Page` has **`titleEmphasize`** but **NO `subtitleEmphasize`** — emitting the
  latter is a hard `tsc` error (§9.19).
- `kind` union includes `"framework"` and `"toolkit"` (toolkit cards render through the same reader).
- SVG/visual-grammar contract + UTF-8 rule (literal ₹/→, never `\uXXXX`) per §9.14.
- **Rule:** every new Casebook page is validated against this before handoff. Affects: Casebook.

## C4 · API / route contract   (v1)
- Frontend ↔ backend base URL + CORS: backend allows `localhost:3000`, `mece.in`, `www.mece.in` (`main.py`).
- Routes: `app/api/me`, `app/api/razorpay/{order,verify,webhook}`, `app/auth/callback`; backend `routes/{submit,daily,cron,news,attempts,transcribe,vision}.py`.
- **Rule:** new domain/route or changed request/response shape = announce. Affects: Daily-content, any frontend caller.

## C5 · Curriculum data   (v1)
- `lib/curriculum/data-advanced.ts` → `d11Guesstimates` (69 entries, shape `{code:'G-01'..'G-69', title, approach, keyDetail?, result}`) is the authoritative static guesstimate source the seed reads.
- **Rule:** changing the shape or the codes affects the guesstimate seed + the `/learn/guesstimates` walkthrough links. Affects: Guesstimate.

## C6 · DB schema — `users` table   (v1, 2026-06-08)
Source of truth: `supabase/migrations/0005_user_onboarding.sql`, mirrored in `lib/types.ts`.
- Read/written by: app layout, dashboard, profile, onboarding API, college-email verify.
- v1 establishes onboarding fields as nullable additive columns:
  `full_name`, `college_id uuid → colleges(id)`, `college_other`, `batch_year`,
  `placement_focus check ('summer'|'final'|'both')`, `college_email`,
  `college_email_verified_at`, `onboarding_completed_at`, `linkedin_url`,
  `referral_source`, `weekly_hours_target`, `goal_text`, `avatar_uploaded_at`.
- New tables: `colleges` (taxonomy, public read), `college_email_verifications`
  (token storage, RLS = owner only). Storage bucket `avatars` with owner-write,
  public-read policies.
- **Rule:** column adds are additive + `IF NOT EXISTS`. Any add = bump version
  + announce. Affects: Onboarding, Profile, Dashboard (auth-cached.ts reader),
  future GD-cohort feature.

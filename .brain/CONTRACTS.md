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
  - **Note (2026-06-14)**: `razorpay/order` and `razorpay/verify` accept optional `period` (monthly, 3-month, annual); additive.
  - **Note (2026-07-17)**: `razorpay/order` accepts optional `coupon` (string, validated server-side — see C7); additive. New backend routes `routes/deck_vault.py` (`/deck-vault/{submit,status}`); new Next APIs `app/api/coupons/validate`, `app/api/admin/deck-vault/file/[submissionId]`.
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

## C7 · Discount coupons & deck submissions   (v2, 2026-08-06)
Source of truth: `supabase/migrations/0041_deck_vault_rewards.sql`, `0044_growth_kit.sql`; enforced across
`app/api/razorpay/{order,verify,webhook}/route.ts`, `app/api/coupons/validate/route.ts`,
`app/(app)/admin/deck-vault/actions.ts`, `app/(app)/admin/coupons/*`, backend `routes/deck_vault.py`.
A coupon is now one of two shapes:
- `user_id NOT NULL` → **user-locked, single use** (Deck Vault Rewards). Behaviour is
  byte-for-byte v1: only the owner may use it, redeeming flips `status` to `'redeemed'`.
- `user_id NULL` → **public / influencer**. Any signed-in buyer may use it, capped by
  `max_redemptions` (NULL = unlimited); redeeming increments `redemption_count` and only
  flips `status` when the cap is hit.

All four call sites (`/api/coupons/validate`, `/api/razorpay/{order,verify,webhook}`) now
route through **`lib/coupons.ts`** — `loadCoupon` / `checkCoupon` /
`couponHonouredAtPayment` / `redeemCoupon`. Do not re-implement coupon rules inline; that
duplication is exactly what the money rule exists to prevent.

**Money rule (extends v1):** the charged amount is still computed ONLY by
`discountedPaise()`. Owner commission is computed ONLY by `commissionPaise()` and is based
on **LIST price, not the amount paid** (owner decision, 2026-08-06) so a payout does not
shrink as the discount grows. Every redemption is booked to `coupon_redemptions`, which has
`UNIQUE(razorpay_payment_id)` — that unique index, not application logic, is what makes
`/verify` and the webhook racing on the same payment safe. `coupon_redemptions` has RLS
enabled with **zero policies** (deny-all): commission is service-role-only and must never
reach a buyer-facing response.

**Rule:** any change to coupon states, either pct computation, the notes schema, or any of
the three tables = `BREAKING`. Affects: Payments, Deck Vault Rewards, Admin.

## C8 · Vault storage path convention   (v1, 2026-07-17)
Source of truth: `lib/google-drive.ts` (GDRIVE_PREFIX/isDrivePath/driveFileId) and its
Python twin `services/gdrive.py` (backend) — the two MUST stay in lockstep.
- A storage path starting `gdrive:` means "Google Drive file id"; anything else is a
  Supabase-bucket path. Consumed by: `deck_skeletons.storage_path` (library),
  `deck_submissions.{deck_path,certificate_path}`, `/api/skeletons/file`,
  `/api/admin/deck-vault/file`, admin delete in `/api/skeletons/manage`, and the
  approval auto-publish (which copies a submission path into the library row).
- `gdrive:` paths carry NO extension — file-type logic must use Drive filename
  metadata (`fetchFileName`) or a stored type, never `split('.')` on the path.
- Env names are shared verbatim between Vercel and the backend host:
  GOOGLE_DRIVE_{REFRESH_TOKEN,CLIENT_ID,CLIENT_SECRET} or GOOGLE_SA_* /
  GOOGLE_SA_CREDENTIALS, plus GDRIVE_FOLDER_ID (backend may add
  GDRIVE_SUBMISSIONS_FOLDER_ID). Backend falls back to the private bucket
  `deck-vault-submissions` when unconfigured.
- **Rule:** changing the prefix, adding a new backend, or renaming the env vars =
  `BREAKING`. Affects: Deck Vault & DRM, Deck Vault Rewards, Admin.

---

## C9 · Clarification quota — tier surface, cross-repo   (v1, 2026-08-01)
Source of truth: **`routes/attempts.py CLARIFICATION_QUOTA`** (backend).
Mirrored in `lib/tier.ts TIER_LIMITS.maxHintQuestions`, and STATED TO USERS in
`components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx`.
- Current ladder, PER ATTEMPT: **free 7 · lite 12 · pro 20**. Must stay monotonic.
- The quota is stamped ONCE per attempt from `tier_at_start`, so changing the constant
  does NOT reach attempts already in flight — a change needs a backfill migration over
  `attempts where status = 'active'` (pattern: `0043_clarification_quota_uplift.sql`,
  which only ever RAISES via `greatest()`).
- `clarification_used` must always be clamped to `clarification_quota` on write —
  `count_clarifications()` counts every `?`, so one packed turn can otherwise overshoot
  and drive `remaining` negative in the DB.
- Free tier is gated on case ACCESS (daily pair + 1 lifetime extra, enforced in
  `services/access_guard.py` and mirrored in `lib/access.ts`) — **not** on conversation
  quality. Do not "limit" free tier by shrinking this quota; limit it by access.
- Exhaustion must NEVER mean silence. The interviewer still streams a reply, told by
  `CLARIFICATIONS_EXHAUSTED_DIRECTIVE` to decline in character. The SSE `meta` event
  carries `clarifications_spent` so the client can distinguish "declined this turn"
  from "stream failed".
- **Rule:** the number lives in three places (backend constant, frontend TIER_LIMITS,
  user-facing pricing copy) and they must move together in ONE commit train, plus a
  backfill migration. They silently disagreed for weeks — frontend claimed Pro was
  `Infinity` while the backend capped at 15, and free was 0 while the solve UI still
  invited free users to ask — and that drift is exactly what produced the 2026-08-01
  P0 (a new user's first question got no interviewer reply at all).
  Affects: Case solve UX, Free-tier rework, Payments/Pricing copy.
- **v2 note (0042, 2026-07-17):** `deck_skeletons` gained `year int null`,
  `organizer text default ''`, `source_submission_id uuid null → deck_submissions`
  (unique where not null — one catalogue row per submission). Written by BOTH the
  admin uploader and the Rewards auto-publish; read by the /skeletons filter UI.
  Additive; readers must treat year as nullable and organizer as possibly ''.


-- =============================================================================
-- 0069_case_figures.sql
-- 2026-09-20
--
-- Moves the worked case figures OUT of `submissions.feedback_json` and into a
-- table the user cannot read.
--
-- ── Why this exists ──────────────────────────────────────────────────
-- The figures (profit bridge / 2x2 / driver tree) are a Pro feature
-- (lib/tier.ts `caseFigures`). Storing them inside the submission row made
-- that paywall unenforceable, because the row belongs to the user:
--
--   1. `submissions_select_own` (0006 L74-77) lets any user read their OWN
--      submission over PostgREST with their own browser JWT —
--      GET /rest/v1/submissions?select=feedback_json&user_id=eq.<me>
--      returns every figure for every case they attempted. No UI change can
--      close that; RLS is row-level, and feedback_json comes with the row.
--   2. Three server components already ship the whole feedback_json into
--      CLIENT components, where it lands in the RSC payload and is readable
--      in devtools regardless of what is painted:
--        app/(app)/dashboard/page.tsx  -> DashboardClient
--        app/(app)/cases/[id]/page.tsx -> CaseAttemptHistory
--        app/(app)/profile/page.tsx    -> ProfileClient
--
-- Withholding in the results page alone was therefore decorative. Putting the
-- figures somewhere the user has no grant on fixes all four routes at once and
-- keeps future readers honest by construction: there is no policy to forget.
--
-- ── Why per CASE and not per submission ──────────────────────────────
-- The figures describe the CASE — its economics, its levers, its decomposition
-- — not anyone's performance. One row per case is the truthful shape, it stops
-- every submission carrying a near-duplicate copy, and it makes "does this
-- case have figures at all?" a single indexed lookup instead of a scan over
-- submissions.
--
-- Safe to run before or after 0068. Idempotent.
--
-- NOTE: no backfill is needed or possible. The scorer only began emitting
-- `visuals` in this same change set and nothing has been deployed, so no
-- stored feedback_json contains them. This is the cheapest this move will ever
-- be — after a release it would need a data migration.
-- =============================================================================

create table if not exists public.case_figures (
  case_id               uuid primary key references public.cases(id) on delete cascade,
  figures               jsonb not null,
  -- Provenance: which scored attempt these were taken from, and how well it
  -- scored. `source_score` is what decides whether a later, better answer is
  -- allowed to replace them.
  source_submission_id  uuid references public.submissions(id) on delete set null,
  source_score          int,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists case_figures_updated_idx on public.case_figures (updated_at desc);

-- ═══════════════════════════════════════════════════════════════════════
-- Access: SERVICE ROLE ONLY. Deliberately no policy.
-- ═══════════════════════════════════════════════════════════════════════
-- RLS is enabled with NO permissive policy, so `authenticated` and `anon` get
-- nothing through PostgREST no matter what they ask for. The entitlement check
-- (Pro + has attempted this case) lives in the app, which reads this table with
-- the service role AFTER checking — see lib/dashboard/case-figures.ts.
--
-- This is the point of the table. A policy here, however carefully written,
-- would put the decision back in the database where the "has the user
-- attempted this case" half cannot be expressed cheaply. No grant means no
-- bypass, and any future reader is forced through the one server helper.

alter table public.case_figures enable row level security;

revoke all on public.case_figures from anon, authenticated;
grant all on public.case_figures to service_role;

comment on table public.case_figures is
  'Worked figures for a case (profit bridge / 2x2 / driver tree). Pro-gated. '
  'SERVICE ROLE ONLY — RLS on with no policy, on purpose: these are paywalled '
  'and must never be reachable from a browser JWT. Read via '
  'lib/dashboard/case-figures.ts, which checks entitlement first.';

notify pgrst, 'reload schema';

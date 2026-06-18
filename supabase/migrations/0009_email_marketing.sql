-- =====================================================================
-- Migration 0009: marketing opt-out for broadcast emails
--
-- Adds a single additive, idempotent column. `marketing_opt_out` is written
-- only by the service role (the /api/unsubscribe route + the admin broadcast
-- resolver both honour it). It is intentionally NOT covered by 0006's
-- trg_guard_user_cols privileged-column guard, so it carries no
-- self-elevation risk and can be toggled by a future user-settings page.
--
-- FULLY IDEMPOTENT: safe to re-run.
-- =====================================================================
alter table public.users
  add column if not exists marketing_opt_out boolean not null default false;

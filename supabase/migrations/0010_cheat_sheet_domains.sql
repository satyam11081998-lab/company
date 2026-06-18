-- =====================================================================
-- Migration 0010: cheat-sheet items gain a domain + user tags
--
-- `domain`  — one of the 8 fixed buckets (see lib/cheat-domains.ts); NULL =
--             Uncategorized. The user assigns/changes it from the cheat sheet.
-- `tags`    — free-form user tags for cross-cutting organisation.
--
-- Additive + idempotent. Existing per-user UPDATE RLS policy already lets the
-- owner edit these (cheat_sheet_items_update_own from 0003).
-- =====================================================================
alter table public.cheat_sheet_items add column if not exists domain text;
alter table public.cheat_sheet_items add column if not exists tags text[] not null default '{}';

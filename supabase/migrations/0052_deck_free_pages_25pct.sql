-- ============================================================================
-- 0052: Restore the 25% free-preview rule for Deck Vault
--
-- Migration 0051 replaced the original "25% of pages, clamped 1-4" rule with a
-- FLAT 2 pages for every deck, AND backfilled free_pages = 2 onto every row.
-- Because a non-NULL free_pages is treated as an admin override that always wins,
-- that backfill pinned every deck to exactly 2 preview pages, and reverting the
-- function alone will NOT change anything until those backfilled 2s are cleared.
--
-- This migration:
--   1. Restores effective_free_pages() to "25% of page_count, clamped 1-5".
--   2. (OPT-IN) Clears the free_pages = 2 values that 0051 blanket-backfilled, so
--      the computed 25% default applies again. Admin overrides set from the Deck
--      Vault admin screen going forward are preserved (they are set consciously).
--
-- Idempotent. Safe to re-run.
-- ============================================================================

-- 1. Restore the 25% computed default ----------------------------------------
create or replace function public.effective_free_pages(
  p_free_pages int,
  p_page_count int
)
returns int
language sql
immutable
as $$
  select case
    when p_free_pages is not null then p_free_pages                       -- admin override wins
    when p_page_count is null or p_page_count < 1 then 1                  -- unknown length -> show 1
    else least(5, greatest(1, ceil(p_page_count * 0.25)::int))            -- 25%, clamped 1..5
  end;
$$;

comment on function public.effective_free_pages(int, int) is
  'Free preview pages for a deck: 25% of page_count, clamped 1..5, unless an admin '
  'has set an explicit free_pages override (which wins). NEVER accept this value '
  'from a client - the image route must compute it server-side.';

-- 2. Clear the 0051 blanket backfill so 25% actually takes effect -------------
--
--   !!! DATA CHANGE — READ BEFORE RUNNING !!!
--
--   0051 set free_pages = 2 on EVERY row, so we cannot tell an intentional
--   "2" from the backfill. Because the Deck Vault paywall was not live in
--   production when 0051 ran, there were no genuine admin overrides yet, so
--   resetting every "2" back to NULL is safe and is what restores the 25% rule.
--
--   If you have SINCE set deliberate 2-page overrides from the admin screen and
--   want to keep them, COMMENT OUT the UPDATE below before running this file.
--
update public.deck_skeletons
set free_pages = null
where free_pages = 2;

-- Verification helper (no-op; run manually to eyeball the effect):
--   select id, title, page_count, free_pages,
--          public.effective_free_pages(free_pages, page_count) as shown_free
--   from public.deck_skeletons where is_active order by created_at desc;

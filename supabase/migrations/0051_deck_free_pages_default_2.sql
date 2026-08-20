-- ============================================================================
-- 0051: Change default free preview pages to 2
--
-- Previously: effective_free_pages() computed 25% of page_count clamped 1..4.
-- Now: flat default of 2 free preview pages for every deck unless an admin
-- has set an explicit override via free_pages.
--
-- Rationale: 2 pages is enough to show the title slide and problem statement
-- (the hook), without leaking the substance. Short decks (3-5 slides) no
-- longer give away 25% for free, and long decks (40+ slides) no longer
-- preview 4 full pages.
--
-- Also backfills free_pages = 2 on every row where no admin override exists.
-- Idempotent. Safe to re-run.
-- ============================================================================

-- 1. Replace the computed default function ------------------------------------
create or replace function public.effective_free_pages(
  p_free_pages int,
  p_page_count int
)
returns int
language sql
immutable
as $$
  select case
    when p_free_pages is not null then p_free_pages   -- admin override wins
    else 2                                             -- flat default: 2 pages
  end;
$$;

comment on function public.effective_free_pages(int, int) is
  'Free preview pages for a deck. Admin override wins; otherwise flat default of 2. '
  'NEVER accept this value from a client - the image route must compute it server-side.';

-- 2. Backfill: set free_pages = 2 on all rows that have no admin override -----
update public.deck_skeletons
set free_pages = 2
where free_pages is null;

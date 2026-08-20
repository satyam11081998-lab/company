-- ============================================================================
-- 0053: Related decks RPC (powers the "Related winning decks" rail)
--
-- Same safety model as get_public_deck / list_indexable_decks (0049): anon has
-- NO direct SELECT on deck_skeletons, so related decks are served through a
-- SECURITY DEFINER function that returns ONLY page-safe columns. It never
-- exposes storage_path / source_submission_id.
--
-- Relevance scoring (highest first): same company > same competition >
-- same industry > same case_type. Only ACTIVE + INDEXABLE decks are returned,
-- so the rail never links out to a deck that is being held for review (which
-- would also leak a thin/no-index page into internal linking).
--
-- Idempotent. Safe to re-run.
-- ============================================================================

create or replace function public.list_related_decks(
  p_slug text,
  p_limit int default 6
)
returns table (
  slug text,
  title text,
  competition text,
  organizer text,
  company text,
  industry text,
  case_type text,
  result text,
  source_kind text,
  year int
)
language sql
stable
security definer
set search_path = public
as $$
  with src as (
    select company, competition, industry, case_type
    from public.deck_skeletons
    where slug = p_slug and is_active = true
    limit 1
  )
  select
    d.slug, d.title, d.competition, d.organizer, d.company,
    d.industry, d.case_type, d.result, d.source_kind, d.year
  from public.deck_skeletons d, src
  where d.slug <> p_slug
    and d.is_active = true
    and d.is_indexable = true
    and (
      (nullif(src.company, '')     is not null and d.company     = src.company)     or
      (nullif(src.competition, '') is not null and d.competition = src.competition) or
      (nullif(src.industry, '')    is not null and d.industry    = src.industry)    or
      (nullif(src.case_type, '')   is not null and d.case_type   = src.case_type)
    )
  order by
    (
      (case when nullif(src.company, '')     is not null and d.company     = src.company     then 8 else 0 end) +
      (case when nullif(src.competition, '') is not null and d.competition = src.competition then 4 else 0 end) +
      (case when nullif(src.industry, '')    is not null and d.industry    = src.industry    then 2 else 0 end) +
      (case when nullif(src.case_type, '')   is not null and d.case_type   = src.case_type   then 1 else 0 end)
    ) desc,
    d.created_at desc
  limit greatest(1, least(coalesce(p_limit, 6), 12));
$$;

grant execute on function public.list_related_decks(text, int) to anon, authenticated;

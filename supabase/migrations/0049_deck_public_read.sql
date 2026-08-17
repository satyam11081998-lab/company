-- 0049_deck_public_read.sql
--
-- Public deck pages 404'd for logged-OUT visitors — the exact audience they
-- exist for (search traffic, shared links, AI/answer-engine crawlers).
--
-- ROOT CAUSE: deck_skeletons has RLS SELECT `to authenticated` only (0007),
-- plus an admin `for all to authenticated` (0008). No path lets the `anon` role
-- read a row, so a logged-out request reads zero rows, getDeckBySlug() returns
-- null, and /decks/[slug] calls notFound() -> 404. A logged-IN request runs as
-- `authenticated`, matches, and renders — which is why "it worked when signed in".
--
-- WHY NOT just `grant select ... to anon`:
--   A blanket anon SELECT (or an anon RLS policy on top of Supabase's default
--   table grant) exposes EVERY column of every active deck through the public
--   PostgREST endpoint — anyone with the public anon key could read
--   `?select=storage_path,source_submission_id` for the whole catalogue. That
--   leaks the `gdrive:` file ids behind the paywall and the submission links.
--   The certificates feature already set the precedent (0046): public reads go
--   through an exact SECURITY DEFINER RPC that returns ONLY public fields, never
--   a table/view grant, "because a view is reachable through PostgREST as an
--   unfiltered list endpoint and would expose the whole register." Same rule here.
--
-- FIX: anon never touches the table. Two SECURITY DEFINER functions return only
-- the public, page-safe columns; anon gets EXECUTE on those and nothing else.
-- The table stays authenticated+admin only. The slide IMAGES are unchanged —
-- /api/decks/[slug]/page/[n] uses the service role and 403s past the free limit.
--
-- Idempotent. Safe to re-run. Also UNDOES the earlier broad-grant draft of this
-- migration if it was already applied (drops the policy + revokes anon SELECT).

-- ---------------------------------------------------------------------------
-- 0. Undo the unsafe broad-grant approach if a prior draft of 0049 ran.
-- ---------------------------------------------------------------------------
drop policy if exists "deck_skeletons_anon_read" on public.deck_skeletons;
revoke select on public.deck_skeletons from anon;

-- ---------------------------------------------------------------------------
-- 1. Public deck detail — only the columns the public page prints.
--    NEVER returns storage_path or source_submission_id.
-- ---------------------------------------------------------------------------
create or replace function public.get_public_deck(p_slug text)
returns table (
  id uuid,
  slug text,
  title text,
  source_kind text,
  competition text,
  organizer text,
  result text,
  case_type text,
  round_type text,
  file_type text,
  description text,
  page_count int,
  free_pages int,
  effective_free_pages int,
  summary text,
  summary_generated_at timestamptz,
  pages_rendered_at timestamptz,
  is_indexable boolean,
  is_active boolean,
  year int,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id, d.slug, d.title, d.source_kind, d.competition, d.organizer,
    d.result, d.case_type, d.round_type, d.file_type, d.description,
    d.page_count, d.free_pages,
    public.effective_free_pages(d.free_pages, d.page_count),
    d.summary, d.summary_generated_at, d.pages_rendered_at,
    d.is_indexable, d.is_active, d.year, d.created_at
  from public.deck_skeletons d
  where d.slug = p_slug
    and d.is_active = true;
$$;

comment on function public.get_public_deck(text) is
  'Public /decks/<slug> read. SECURITY DEFINER so anon never touches the table '
  'directly; returns only page-safe columns (never storage_path). Active decks only.';

-- ---------------------------------------------------------------------------
-- 2. Indexable decks for the sitemap — slugs + timestamps only.
-- ---------------------------------------------------------------------------
create or replace function public.list_indexable_decks()
returns table (
  slug text,
  created_at timestamptz,
  pages_rendered_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select d.slug, d.created_at, d.pages_rendered_at
  from public.deck_skeletons d
  where d.is_active = true
    and d.is_indexable = true
    and d.slug is not null
  order by d.created_at desc;
$$;

comment on function public.list_indexable_decks() is
  'Sitemap source. SECURITY DEFINER; returns only slug + timestamps for active, '
  'indexable decks. No table grant to anon.';

-- ---------------------------------------------------------------------------
-- 3. Grants: anon (and authenticated) may EXECUTE the curated readers only.
-- ---------------------------------------------------------------------------
grant execute on function public.get_public_deck(text) to anon, authenticated;
grant execute on function public.list_indexable_decks() to anon, authenticated;

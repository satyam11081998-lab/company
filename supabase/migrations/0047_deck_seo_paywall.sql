-- 0047_deck_seo_paywall.sql
--
-- Public, indexable deck pages with a REAL paywall.
--
-- Context: /skeletons is not in PUBLIC_ROUTES, so middleware 307s every crawler
-- to /login and Google has never seen a deck. This migration adds what a public
-- page needs (a stable slug, a summary, a page count) and what a genuine
-- paywall needs (a per-deck free-page count the SERVER decides from).
--
-- Idempotent: every add is IF NOT EXISTS, the backfill is guarded, and the
-- slug generator is deterministic. Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------
alter table public.deck_skeletons
  -- Public URL segment. STABLE FOREVER once published: changing a slug after a
  -- page is indexed discards its ranking and 404s every existing link.
  add column if not exists slug text,
  add column if not exists page_count int check (page_count is null or page_count > 0),
  -- NULL means "not decided by an admin", NOT "zero" and NOT "all". Readers must
  -- fall back to the computed default (see effective_free_pages below), so a
  -- deck uploaded in a hurry is never accidentally free or accidentally sealed.
  add column if not exists free_pages int check (free_pages is null or free_pages >= 0),
  add column if not exists summary text,
  add column if not exists summary_generated_at timestamptz,
  add column if not exists pages_rendered_at timestamptz,
  -- Lets a deck be pulled from search WITHOUT deleting it — a team objects, a
  -- sponsor asks, a result is disputed. Deleting would break inbound links.
  add column if not exists is_indexable boolean not null default true;

-- ---------------------------------------------------------------------------
-- 2. Slug generation
-- ---------------------------------------------------------------------------
create or replace function public.deck_slugify(txt text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(txt, '')), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- Backfill slugs for existing rows. Deterministic and collision-safe: the
-- numeric suffix comes from a stable ordering, so re-running produces the same
-- slugs rather than churning them.
do $$
declare
  r record;
  base text;
  candidate text;
  n int;
begin
  for r in
    select id, title, organizer, year
    from public.deck_skeletons
    where slug is null
    order by created_at nulls last, id
  loop
    base := public.deck_slugify(
      concat_ws('-', r.title, nullif(r.organizer, ''), r.year::text)
    );
    if base is null or base = '' then
      base := 'deck-' || left(r.id::text, 8);
    end if;

    candidate := base;
    n := 1;
    while exists (select 1 from public.deck_skeletons where slug = candidate) loop
      n := n + 1;
      candidate := base || '-' || n::text;
    end loop;

    update public.deck_skeletons set slug = candidate where id = r.id;
  end loop;
end $$;

create unique index if not exists deck_skeletons_slug_unique
  on public.deck_skeletons (slug) where (slug is not null);

-- Auto-generate slug on insert if not provided
create or replace function public.deck_skeletons_auto_slug()
returns trigger
language plpgsql
as $$
declare
  base text;
  candidate text;
  n int;
begin
  if new.slug is null or new.slug = '' then
    base := public.deck_slugify(
      concat_ws('-', new.title, nullif(new.organizer, ''), new.year::text)
    );
    if base is null or base = '' then
      base := 'deck-' || left(coalesce(new.id::text, gen_random_uuid()::text), 8);
    end if;

    candidate := base;
    n := 1;
    while exists (select 1 from public.deck_skeletons where slug = candidate and (new.id is null or id != new.id)) loop
      n := n + 1;
      candidate := base || '-' || n::text;
    end loop;

    new.slug := candidate;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_deck_skeletons_auto_slug on public.deck_skeletons;
create trigger trg_deck_skeletons_auto_slug
  before insert on public.deck_skeletons
  for each row
  execute function public.deck_skeletons_auto_slug();

-- ---------------------------------------------------------------------------
-- 3. The paywall rule, in ONE place
-- ---------------------------------------------------------------------------
-- Both the image API and the public page must agree on how many pages are free.
-- Putting the rule in the database means they cannot drift — the drift between
-- three copies of the clarification quota is exactly what produced the 2026-08-01
-- P0 (see CONTRACTS.md C9), and this is the same shape of risk.
--
-- Rule: an admin's explicit free_pages wins. Otherwise 25% of the deck, at least
-- 1 page and at most 4. A 3-slide deck shows 1, a 12-slide shows 3, a 40-slide
-- shows 4 — so short decks still give a real taste and long decks never leak the
-- substance.
create or replace function public.effective_free_pages(
  p_free_pages int,
  p_page_count int
)
returns int
language sql
immutable
as $$
  select case
    when p_free_pages is not null then p_free_pages
    when p_page_count is null or p_page_count < 1 then 1
    else least(4, greatest(1, ceil(p_page_count * 0.25)::int))
  end;
$$;

-- Computed column overload for PostgREST: allows selecting effective_free_pages
-- directly in Supabase .select('id, slug, effective_free_pages, ...') without
-- duplicating paywall logic anywhere in client code.
create or replace function public.effective_free_pages(p public.deck_skeletons)
returns int
language sql
stable
as $$
  select public.effective_free_pages(p.free_pages, p.page_count);
$$;

comment on function public.effective_free_pages(int, int) is
  'Free preview pages for a deck. Admin override wins; otherwise 25% clamped to 1..4. '
  'NEVER accept this value from a client — the image route must compute it server-side.';

-- ---------------------------------------------------------------------------
-- 4. Page-image bucket — PRIVATE
-- ---------------------------------------------------------------------------
-- Rasterised slides live here as <deck_id>/<n>.webp.
--
-- PRIVATE is the whole security model. A public bucket would hand out every
-- locked slide to anyone who guessed the URL, and the paywall would be theatre —
-- which is exactly the failure this feature exists to avoid. No RLS policies are
-- granted, so only the service role can read or write: the backend writes the
-- images, and /api/decks/[slug]/page/[n] streams back ONLY the pages the server
-- has decided are free. Locked bytes never leave this bucket.
insert into storage.buckets (id, name, public)
values ('deck-pages', 'deck-pages', false)
on conflict (id) do nothing;

comment on column public.deck_skeletons.free_pages is
  'Admin override for the free preview length. NULL = use effective_free_pages().';
comment on column public.deck_skeletons.slug is
  'Public URL segment for /decks/<slug>. Stable forever once published.';
comment on column public.deck_skeletons.is_indexable is
  'False removes the deck from the sitemap and sets noindex, without deleting it.';

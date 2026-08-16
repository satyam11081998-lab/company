-- 0048_deck_slug_trigger.sql
--
-- Every deck must get a slug AUTOMATICALLY.
--
-- 0047 backfilled slugs for rows that existed when it ran, and stopped there.
-- Anything inserted afterwards has slug = NULL, which means no public URL, no
-- sitemap entry and no possibility of ranking — the deck is invisible to the
-- exact search traffic this feature exists to capture. That is precisely what
-- happened to the "Flipkart WIRED 8.0" deck.
--
-- A trigger rather than application code, because deck_skeletons is written by
-- THREE separate paths: the admin uploader, the Deck Vault Rewards
-- auto-publish on approval (see C8), and manual SQL. Putting slug generation in
-- one of them guarantees the other two keep producing invisible decks.
--
-- Idempotent. Safe to re-run.

create or replace function public.deck_assign_slug()
returns trigger
language plpgsql
as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  -- Never touch an existing slug. Once a page is indexed, changing its URL
  -- discards the ranking and 404s every inbound link — the slug is a permanent
  -- public identifier, not a derived display value.
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;

  base := public.deck_slugify(
    concat_ws('-', new.title, nullif(new.organizer, ''), new.year::text)
  );

  -- A deck with no usable title still needs a URL. Fall back to the id so the
  -- row is reachable rather than silently unpublishable.
  if base is null or base = '' then
    base := 'deck-' || left(new.id::text, 8);
  end if;

  candidate := base;
  while exists (select 1 from public.deck_skeletons where slug = candidate) loop
    n := n + 1;
    candidate := base || '-' || n::text;
  end loop;

  new.slug := candidate;
  return new;
end $$;

drop trigger if exists trg_deck_assign_slug on public.deck_skeletons;
create trigger trg_deck_assign_slug
  before insert on public.deck_skeletons
  for each row
  execute function public.deck_assign_slug();

-- Catch anything inserted between 0047 and this migration (the reason this
-- exists at all).
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
    where slug is null or slug = ''
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

comment on function public.deck_assign_slug() is
  'BEFORE INSERT trigger: assigns a unique, stable slug to every new deck. '
  'Never overwrites an existing slug — published URLs must not change.';

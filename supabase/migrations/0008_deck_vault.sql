-- ============================================================================
-- 0008: Deck Vault — admin uploads + richer catalogue metadata
-- Renames the product concept from "skeletons" to the Deck Vault (tables keep
-- their names; only metadata and policies change).
-- ============================================================================

-- Catalogue metadata for real competition decks --------------------------------
alter table public.deck_skeletons
  add column if not exists source_kind text not null default 'corporate',   -- 'corporate' | 'bschool'
  add column if not exists competition text not null default '',            -- e.g. 'HUL L.I.M.E.', 'Kritva 25 · Arthneeti'
  add column if not exists result text not null default '',                 -- e.g. 'National Winner', 'Finalist'
  add column if not exists file_type text not null default 'pdf';           -- pdf | pptx | xlsx

-- slide_count is often unknown for uploaded decks
alter table public.deck_skeletons alter column slide_count drop not null;
alter table public.deck_skeletons alter column slide_count set default null;

-- Admin write access to the catalogue ------------------------------------------
drop policy if exists "deck_skeletons_admin_write" on public.deck_skeletons;
create policy "deck_skeletons_admin_write" on public.deck_skeletons
  for all to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- Admins may also list inactive rows (the read policy above only shows active);
-- the "for all" policy's USING covers select for admins as well.

-- Storage policies for the 'skeletons' bucket -----------------------------------
-- 1) Admins can upload / replace / delete files.
drop policy if exists "skeletons_admin_insert" on storage.objects;
create policy "skeletons_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'skeletons'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
  );

drop policy if exists "skeletons_admin_update" on storage.objects;
create policy "skeletons_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'skeletons'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
  );

drop policy if exists "skeletons_admin_delete" on storage.objects;
create policy "skeletons_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'skeletons'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
  );

-- 2) Buyers (and admins) can read objects — required for signed-URL creation
--    under RLS. The bucket stays private; URLs are still short-lived and only
--    minted by the download API after the entitlement check.
drop policy if exists "skeletons_buyer_read" on storage.objects;
create policy "skeletons_buyer_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'skeletons'
    and (
      exists (select 1 from public.skeleton_access a where a.user_id = auth.uid())
      or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
    )
  );

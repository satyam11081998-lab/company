-- 0045_guest_mode.sql — Anonymous / guest user support.
-- 2026-08-07
--
-- Adds `is_guest` to `public.users`, updates the auth trigger to set it from
-- Supabase's `is_anonymous`, extends the privileged-column guard and the
-- leaderboard view, and adds restrictive RLS policies so anon-auth users
-- cannot write to tables they should not touch.
--
-- Fully idempotent: safe to run twice. Run AFTER 0044.
--
-- IMPORTANT: there is NO foreign key from public.users to auth.users (0001
-- declares `id uuid primary key` without REFERENCES). The 30-day cleanup
-- therefore deletes from public.users first, then auth.users.

-- ═══════════════════════════════════════════════════════════════════════
-- 1 · users.is_guest — mirror of auth.users.is_anonymous
-- ═══════════════════════════════════════════════════════════════════════

alter table public.users add column if not exists is_guest boolean not null default false;

-- Guest lookups are rare; a partial index keeps it near-free.
create index if not exists users_is_guest_idx on public.users (is_guest) where is_guest = true;

-- ═══════════════════════════════════════════════════════════════════════
-- 2 · handle_new_user — set is_guest from is_anonymous
-- ═══════════════════════════════════════════════════════════════════════
-- Anonymous users have email = NULL in auth.users, but public.users.email is
-- `text not null` (0001 L18). We coalesce to '' to avoid a not-null violation.
-- There is no unique index on users.email, so blank emails do not collide.
-- This is why guests render with an empty email column in /admin/users.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, avatar_url, points, is_guest)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    0,
    coalesce(new.is_anonymous, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- 2b · handle_user_converted — sync is_guest/email on CONVERSION
-- ═══════════════════════════════════════════════════════════════════════
-- DATA-LOSS FIX. `handle_new_user` is AFTER INSERT and is the ONLY writer of
-- is_guest. When a guest converts (updateUser({email}) / linkIdentity()),
-- auth.users.is_anonymous flips to false — but that is an UPDATE, and without
-- this trigger nothing ever hears it. public.users.is_guest would stay true
-- FOREVER, which means the converted user:
--   • never appears on leaderboard_top() (section 4 filters is_guest)
--   • stays invisible in the activity feed / proof rail / peer proximity
--   • and gets DELETED by the 30-day cleanup below — taking every attempt,
--     submission and score with them.
-- Those are exactly the users this whole feature exists to create, and some
-- of them will have paid. This trigger is not optional.
--
-- The email sync matters just as much: a converted user whose public.users.email
-- is still '' never receives transactional mail and cannot be found in
-- /admin/users by email.
--
-- SECURITY DEFINER so it bypasses guard_user_privileged_cols (section 3), which
-- correctly reverts is_guest for every non-service role.

create or replace function public.handle_user_converted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Only touch rows where something we mirror actually changed.
  if new.is_anonymous is distinct from old.is_anonymous
     or new.email is distinct from old.email then
    update public.users
       set is_guest = coalesce(new.is_anonymous, false),
           email    = coalesce(new.email, email, '')
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_converted on auth.users;
create trigger on_auth_user_converted
  after update on auth.users
  for each row execute function public.handle_user_converted();

-- ═══════════════════════════════════════════════════════════════════════
-- 3 · guard_user_privileged_cols — add is_guest to the reverted set
-- ═══════════════════════════════════════════════════════════════════════
-- Prevents a logged-in user from clearing their own guest flag (which would
-- give them a permanent account without going through the conversion flow).
-- Same function, same trigger — only `is_guest` is added.

create or replace function public.guard_user_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.subscription_tier       := old.subscription_tier;
    new.subscription_started_at := old.subscription_started_at;
    new.subscription_expires_at := old.subscription_expires_at;
    new.points                  := old.points;
    new.is_admin                := old.is_admin;
    new.is_demo                 := old.is_demo;
    new.is_guest                := old.is_guest;
  end if;
  return new;
end $$;

-- ═══════════════════════════════════════════════════════════════════════
-- 4 · leaderboard_top() — exclude guests (same as demo)
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.leaderboard_top(p_limit int default 50)
returns table(id uuid, name text, avatar_url text, points int)
language sql security definer set search_path = public as $$
  select id, name, avatar_url, points
  from public.users
  where coalesce(is_demo, false) = false
    and coalesce(is_guest, false) = false
  order by points desc nulls last
  limit greatest(1, least(p_limit, 200));
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- 5 · Restrictive RLS policies
-- ═══════════════════════════════════════════════════════════════════════
-- Anonymous users assume the `authenticated` Postgres role, so every
-- existing permissive policy written `to authenticated` silently admits
-- guests. Restrictive policies subtract from the union of permissive ones.
--
-- H1 fix: content tables (endorsements, testimonials, feedback_reports,
-- case_ratings) use `for insert`, `for update`, `for delete` — NOT
-- `for all` — so guests can still SELECT (read) them. The endorsement
-- wall and testimonials are rendered in the proof half of `/` and must
-- be visible to the exact audience this feature serves.
--
-- discount_coupons, coupon_redemptions, deck_submissions use `for all`
-- because guests should never read or write these.

-- ── Tables where guests may READ but not WRITE ──────────────────────

-- endorsements
drop policy if exists restrictive_no_anon_write on public.endorsements;
create policy restrictive_no_anon_write on public.endorsements
  as restrictive for insert
  to authenticated
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_update on public.endorsements;
create policy restrictive_no_anon_update on public.endorsements
  as restrictive for update
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_delete on public.endorsements;
create policy restrictive_no_anon_delete on public.endorsements
  as restrictive for delete
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

-- testimonials
drop policy if exists restrictive_no_anon_write on public.testimonials;
create policy restrictive_no_anon_write on public.testimonials
  as restrictive for insert
  to authenticated
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_update on public.testimonials;
create policy restrictive_no_anon_update on public.testimonials
  as restrictive for update
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_delete on public.testimonials;
create policy restrictive_no_anon_delete on public.testimonials
  as restrictive for delete
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

-- feedback_reports
drop policy if exists restrictive_no_anon_write on public.feedback_reports;
create policy restrictive_no_anon_write on public.feedback_reports
  as restrictive for insert
  to authenticated
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_update on public.feedback_reports;
create policy restrictive_no_anon_update on public.feedback_reports
  as restrictive for update
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_delete on public.feedback_reports;
create policy restrictive_no_anon_delete on public.feedback_reports
  as restrictive for delete
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

-- case_ratings
drop policy if exists restrictive_no_anon_write on public.case_ratings;
create policy restrictive_no_anon_write on public.case_ratings
  as restrictive for insert
  to authenticated
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_update on public.case_ratings;
create policy restrictive_no_anon_update on public.case_ratings
  as restrictive for update
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon_delete on public.case_ratings;
create policy restrictive_no_anon_delete on public.case_ratings
  as restrictive for delete
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

-- resumes / cheat_sheets / cheat_sheet_items
-- Found by auditing every `for insert` policy in the migration set against the
-- 0045 coverage list. All three accept writes from ANY authenticated role, so
-- anonymous users reach them the moment the toggle flips. The FastAPI routes
-- already 403 guests (routes/resume.py), but RLS is the real boundary: a guest
-- can talk to PostgREST straight from the browser with their own JWT and never
-- touch the backend at all. An API guard that is not mirrored in RLS is a
-- suggestion, not a control.
do $$
declare t text;
begin
  foreach t in array array['resumes', 'cheat_sheets', 'cheat_sheet_items'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists restrictive_no_anon_write on public.%I', t);
      execute format($f$
        create policy restrictive_no_anon_write on public.%I
          as restrictive for insert to authenticated
          with check ((select (auth.jwt()->>'is_anonymous')::boolean) is not true)
      $f$, t);

      execute format('drop policy if exists restrictive_no_anon_update on public.%I', t);
      execute format($f$
        create policy restrictive_no_anon_update on public.%I
          as restrictive for update to authenticated
          using ((select (auth.jwt()->>'is_anonymous')::boolean) is not true)
          with check ((select (auth.jwt()->>'is_anonymous')::boolean) is not true)
      $f$, t);
    end if;
  end loop;
end $$;

-- ── Tables where guests may not READ or WRITE ───────────────────────

drop policy if exists restrictive_no_anon on public.discount_coupons;
create policy restrictive_no_anon on public.discount_coupons
  as restrictive for all
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon on public.coupon_redemptions;
create policy restrictive_no_anon on public.coupon_redemptions
  as restrictive for all
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

drop policy if exists restrictive_no_anon on public.deck_submissions;
create policy restrictive_no_anon on public.deck_submissions
  as restrictive for all
  to authenticated
  using (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  )
  with check (
    (select (auth.jwt()->>'is_anonymous')::boolean) is not true
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 6 · 30-day guest cleanup
-- ═══════════════════════════════════════════════════════════════════════
-- BLOCKER 1: There is no FK from public.users to auth.users, so CASCADE
-- does not work. We delete from public.users first (which cascades to
-- case_attempts, submissions, user_sessions, etc.), then auth.users.
--
-- If pg_cron is available, schedule the job. If not, this block is a
-- no-op and the cleanup runs via the existing app/api/cron mechanism.
--
-- DATA-LOSS FIX (paired with section 2b): both deletes key off
-- `auth.users.is_anonymous`, NEVER off `public.users.is_guest`. Defence in
-- depth — if the conversion trigger in 2b ever fails or is dropped, a
-- converted (possibly paying) user is still never collected. Keying the
-- public.users delete off its own is_guest column would delete them.
--
-- Order matters: public.users FIRST (it is the parent every feature table
-- cascades from), auth.users second.

create or replace function public.cleanup_stale_guests(p_older_than interval default interval '30 days')
returns table(public_users_deleted bigint, auth_users_deleted bigint)
language plpgsql security definer set search_path = public as $$
declare
  v_pub bigint := 0;
  v_auth bigint := 0;
begin
  with doomed as (
    delete from public.users u
     where exists (
       select 1 from auth.users a
        where a.id = u.id
          and a.is_anonymous is true
          and a.created_at < now() - p_older_than
     )
    returning 1
  )
  select count(*) into v_pub from doomed;

  with doomed_auth as (
    delete from auth.users a
     where a.is_anonymous is true
       and a.created_at < now() - p_older_than
    returning 1
  )
  select count(*) into v_auth from doomed_auth;

  return query select v_pub, v_auth;
end;
$$;

revoke all on function public.cleanup_stale_guests(interval) from public, anon, authenticated;

do $$
begin
  if exists (
    select 1 from pg_available_extensions
     where name = 'pg_cron' and installed_version is not null
  ) then
    begin
      perform cron.schedule(
        'guest-cleanup-30d',
        '0 3 * * *',
        $cron$ select public.cleanup_stale_guests(); $cron$
      );
    exception when others then
      -- pg_cron installed but this role cannot schedule (or lacks USAGE on
      -- the cron schema). Non-fatal: fall back to app/api/cron calling
      -- cleanup_stale_guests() with the service role.
      raise notice 'pg_cron present but cron.schedule failed (%); use app/api/cron instead', sqlerrm;
    end;
  else
    raise notice 'pg_cron not installed — call public.cleanup_stale_guests() from app/api/cron';
  end if;
end $$;

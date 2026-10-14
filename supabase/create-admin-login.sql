-- =====================================================================
-- create-admin-login.sql — turn a dedicated account into the separate
-- ADMIN login used at https://mece.in/admin/login
-- 2026-10-09
--
-- The admin console and the CRM have their own sign-in page, separate
-- from the learner /login. This gives them their own account too: an
-- email + password that is NOT your learner account, marked as admin.
--
-- This file NEVER sees a password. Passwords are set by Supabase Auth
-- (its own hashing and password policy), so they never end up in the
-- SQL editor's history, query statistics or database logs.
--
-- HOW TO
--   1. Supabase → Authentication → Users → Add user → Create new user.
--      Email: a NEW address for admin (not your learner email).
--      Password: a strong one you use nowhere else.
--      Tick "Auto Confirm User". Create.
--   2. Supabase → SQL Editor → New query: paste this file, set v_email
--      below to that same address, Run.
--   3. Sign in at /admin/login with that email and password.
--
--   Change the password later from Admin → (rail, bottom) "Change
--   password", or with "Forgot password?" on the admin sign-in page.
--
-- SAFE TO RE-RUN. It only ever sets admin on ONE account, and refuses:
--   • an email with no account yet (do step 1 first);
--   • a guest (anonymous) account;
--   • an email that is a LEARNER account (finished onboarding or has
--     solved anything), so a typo can never hand admin to a learner.
--     If you really mean to promote that account, set
--     v_promote_learner := true.
-- It never deletes anything and never changes a password.
-- =====================================================================

do $$
declare
  -- ── EDIT THIS ──────────────────────────────────────────────────────
  v_email           text    := 'admin@mece.in';
  v_promote_learner boolean := false;
  -- ───────────────────────────────────────────────────────────────────

  v_name      constant text := 'MECE Admin';
  v_uid       uuid;
  v_anon      boolean;
  v_confirmed boolean;
  v_is_admin  boolean;
  v_onboarded boolean;
  v_solved    boolean := false;
  v_guard_off boolean := false;
  v_ok        boolean;
begin
  v_email := lower(btrim(v_email));
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'v_email (%) is not an email address.', v_email;
  end if;

  ------------------------------------------------------------------
  -- 1. The account must exist (created in the dashboard, step 1)
  ------------------------------------------------------------------
  select u.id, coalesce(u.is_anonymous, false), u.email_confirmed_at is not null
    into v_uid, v_anon, v_confirmed
    from auth.users u
   where lower(u.email) = v_email;
  if v_uid is null then
    raise exception 'No account with the email %. Nothing was changed.', v_email
      using hint = 'Create it first: Supabase → Authentication → Users → Add user → Create new user (tick Auto Confirm User).';
  end if;
  if v_anon then
    raise exception '% is a guest account. Nothing was changed.', v_email;
  end if;

  -- The profile row normally comes from the signup trigger; make sure it exists.
  insert into public.users (id, email, name)
  values (v_uid, v_email, v_name)
  on conflict (id) do nothing;

  ------------------------------------------------------------------
  -- 2. Never hand admin to a learner by accident
  ------------------------------------------------------------------
  select coalesce(p.is_admin, false), p.onboarding_completed_at is not null
    into v_is_admin, v_onboarded
    from public.users p where p.id = v_uid;
  if to_regclass('public.submissions') is not null then
    execute 'select exists (select 1 from public.submissions where user_id = $1)' into v_solved using v_uid;
  end if;
  if not v_is_admin and (v_onboarded or v_solved) and not v_promote_learner then
    raise exception '% is a learner account (it %). Nothing was changed.', v_email,
      case when v_solved then 'has solved cases' else 'finished learner onboarding' end
      using hint = 'Use a NEW email for the admin login (step 1). To promote this learner account anyway, set v_promote_learner := true.';
  end if;

  ------------------------------------------------------------------
  -- 3. Get past trg_guard_user_cols (migration 0006)
  ------------------------------------------------------------------
  -- That trigger SILENTLY reverts is_admin for any caller whose auth.role()
  -- is not 'service_role'. The SQL editor has no JWT, so without this the
  -- flag below would "succeed" and change nothing. Transaction-local.
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  begin
    perform set_config('request.jwt.claim.role', 'service_role', true);
  exception when others then null;
  end;
  begin
    if coalesce(auth.role(), '') is distinct from 'service_role' then
      execute 'alter table public.users disable trigger trg_guard_user_cols';
      v_guard_off := true;   -- DDL is transactional: any error below rolls this back too
    end if;
  exception when others then
    null;   -- the check below catches it
  end;

  ------------------------------------------------------------------
  -- 4. Mark it admin. A dedicated admin account skips learner onboarding.
  ------------------------------------------------------------------
  update public.users
     set is_admin                = true,
         name                    = coalesce(nullif(btrim(name), ''), v_name),
         onboarding_completed_at = coalesce(onboarding_completed_at, now())
   where id = v_uid;

  if v_guard_off then
    execute 'alter table public.users enable trigger trg_guard_user_cols';
  end if;
  select coalesce(is_admin, false) into v_ok from public.users where id = v_uid;
  if not v_ok then
    raise exception 'The admin flag did not stick (the privileged-column guard reverted it). Nothing was changed.';
  end if;

  raise notice '────────────────────────────────────────────';
  raise notice ' % is now an admin login.', v_email;
  raise notice '   sign in at : https://mece.in/admin/login';
  if not v_confirmed then
    raise notice '   ⚠ the email is NOT confirmed, so sign-in will be refused.';
    raise notice '     Supabase → Authentication → Users → this user → Confirm email (or recreate it with Auto Confirm).';
  end if;
  raise notice '────────────────────────────────────────────';
end $$;


-- ── Check (safe to run any time; lists every admin) ─────────────────
select u.email,
       u.id                                                         as user_id,
       case when u.email_confirmed_at is null then 'PROBLEM — unconfirmed, sign-in refused' else 'confirmed' end as email_state,
       u.last_sign_in_at
  from auth.users u
  join public.users p on p.id = u.id
 where p.is_admin
 order by u.created_at;


-- ── OPTIONAL: make /admin reachable ONLY through the admin login ───────
-- Once you have signed in at /admin/login with the new admin account, you can
-- take admin away from your personal (learner) account. It keeps all its
-- learner data; it just stops opening /admin. Un-comment this block, put your
-- PERSONAL email in v_personal and the admin email in v_admin, and run it.
--
-- do $$
-- declare
--   v_personal text := 'your-personal-email@example.com';
--   v_admin    text := 'admin@mece.in';
-- begin
--   if lower(btrim(v_personal)) = lower(btrim(v_admin)) then
--     raise exception 'v_personal and v_admin are the same account. Nothing was changed.';
--   end if;
--   if not exists (select 1 from auth.users a join public.users p on p.id = a.id
--                   where lower(a.email) = lower(btrim(v_admin)) and p.is_admin) then
--     raise exception 'No admin account for % yet. Nothing was changed.', v_admin;
--   end if;
--   perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
--   update public.users set is_admin = false where lower(email) = lower(btrim(v_personal));
--   if not found then
--     raise exception 'No account with the email %. Nothing was changed.', v_personal;
--   end if;
--   if exists (select 1 from public.users where lower(email) = lower(btrim(v_personal)) and is_admin) then
--     raise exception 'The flag did not change (privileged-column guard). Nothing was changed.';
--   end if;
-- end $$;

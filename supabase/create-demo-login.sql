-- =====================================================================
-- create-demo-login.sql — force-create (or reset) the demo account login.
-- 2026-08-06
--
-- Creates a real, working email+password login directly in `auth.users`,
-- so you never have to go through /signup or an inbox. Run this FIRST,
-- then run `supabase/seed-demo-account.sql` to give it its history.
--
-- Re-runnable: if the account already exists this only RESETS the password
-- and re-confirms the email. It never deletes anything.
--
-- ⚠ Two things to know
--   1. This writes to the `auth` schema, which is normally GoTrue's alone.
--      It is safe for a seeded demo account; do NOT make a habit of it for
--      real users — use the app's signup or the Supabase dashboard.
--   2. The password below is a REAL credential you will hand to an
--      influencer. Change it here before running, and treat it accordingly.
--
-- Version-tolerant: the INSERT is built at runtime from the columns that
-- actually exist in YOUR auth schema, so it works across GoTrue versions
-- and skips generated columns (e.g. `confirmed_at`) that cannot be written.
-- =====================================================================

do $$
declare
  -- ── EDIT THESE ─────────────────────────────────────────────────────
  v_email    text := 'demo@mece.in';
  v_password text := 'MeceDemo@2026';
  v_name     text := 'Ananya Rao';
  -- ───────────────────────────────────────────────────────────────────

  v_uid      uuid;
  v_existing uuid;
  v_crypto   text;          -- schema pgcrypto lives in (Supabase: extensions)
  v_pwexpr   text;          -- crypt(...) expression, schema-qualified
  v_cols     text[] := '{}';
  v_vals     text[] := '{}';
  v_fields   jsonb;
  k          text;
  v          text;
  v_idtype   text;
  v_missing  text;
begin
  ------------------------------------------------------------------
  -- 0. pgcrypto — needed to hash the password the way GoTrue expects
  ------------------------------------------------------------------
  select n.nspname into v_crypto
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
   where e.extname = 'pgcrypto';

  if v_crypto is null then
    raise exception 'pgcrypto is not installed.'
      using hint = 'Supabase → Database → Extensions → enable "pgcrypto", then re-run.';
  end if;

  v_pwexpr := format('%I.crypt(%L, %I.gen_salt(%L))', v_crypto, v_password, v_crypto, 'bf');

  ------------------------------------------------------------------
  -- 1. Already there? Then this is a password reset, not a create.
  ------------------------------------------------------------------
  select id into v_existing from auth.users where lower(email) = lower(v_email);

  if v_existing is not null then
    execute format(
      'update auth.users
          set encrypted_password = %s,
              email_confirmed_at = coalesce(email_confirmed_at, now()),
              updated_at         = now()
        where id = %L', v_pwexpr, v_existing);

    -- Make sure the public profile row exists even if the signup trigger
    -- was added after this account was created.
    insert into public.users (id, email, name)
    values (v_existing, lower(v_email), v_name)
    on conflict (id) do nothing;

    update public.users
       set name                    = coalesce(nullif(btrim(name), ''), v_name),
           onboarding_completed_at = coalesce(onboarding_completed_at, now())
     where id = v_existing;

    raise notice 'Password RESET for existing account.';
    raise notice '  email    : %', v_email;
    raise notice '  password : %', v_password;
    raise notice '  user id  : %', v_existing;
    raise notice 'Next: run supabase/seed-demo-account.sql';
    return;
  end if;

  ------------------------------------------------------------------
  -- 2. Build the auth.users INSERT from columns that actually exist
  ------------------------------------------------------------------
  v_uid := gen_random_uuid();

  -- key = column name, value = a SQL EXPRESSION (already quoted/cast).
  v_fields := jsonb_build_object(
    'id',                 format('%L::uuid', v_uid),
    'instance_id',        format('%L::uuid', '00000000-0000-0000-0000-000000000000'),
    'aud',                format('%L', 'authenticated'),
    'role',               format('%L', 'authenticated'),
    'email',              format('%L', lower(v_email)),
    'encrypted_password', v_pwexpr,
    -- Confirmed on purpose: an unconfirmed account cannot sign in, and there
    -- is no inbox behind demo@mece.in.
    'email_confirmed_at', 'now()',
    'last_sign_in_at',    'null',
    'raw_app_meta_data',  format('%L::jsonb', '{"provider":"email","providers":["email"]}'),
    'raw_user_meta_data', format('%L::jsonb',
                           json_build_object('full_name', v_name, 'name', v_name)::text),
    'created_at',         'now()',
    'updated_at',         'now()',
    -- GoTrue reads these as Go strings; NULL makes some code paths throw
    -- "converting NULL to string is unsupported". Empty string is correct.
    'confirmation_token',     format('%L', ''),
    'recovery_token',         format('%L', ''),
    'email_change_token_new', format('%L', ''),
    'email_change_token_current', format('%L', ''),
    'email_change',           format('%L', ''),
    'phone_change',           format('%L', ''),
    'phone_change_token',     format('%L', ''),
    'reauthentication_token', format('%L', ''),
    'is_sso_user',            'false',
    'is_anonymous',           'false'
  );

  for k, v in select key, value #>> '{}' from jsonb_each(v_fields) loop
    if exists (
      select 1 from information_schema.columns
       where table_schema = 'auth' and table_name = 'users'
         and column_name = k
         and is_generated = 'NEVER'          -- never write generated columns
         and coalesce(identity_generation, '') <> 'ALWAYS'
    ) then
      v_cols := v_cols || quote_ident(k);
      v_vals := v_vals || v;
    end if;
  end loop;

  -- Schema-drift guard: if a future GoTrue adds a NOT NULL column with no
  -- default that we do not set, fail with a readable message instead of a
  -- raw constraint violation from a dynamically built INSERT.
  select string_agg(c.column_name, ', ') into v_missing
    from information_schema.columns c
   where c.table_schema = 'auth' and c.table_name = 'users'
     and c.is_nullable = 'NO' and c.column_default is null
     and c.is_generated = 'NEVER'
     and quote_ident(c.column_name) <> all (v_cols);
  if v_missing is not null then
    raise exception 'auth.users has required column(s) this script does not set: %', v_missing
      using hint = 'Your GoTrue version is newer than this script. Create the user from Supabase → Authentication → Users → Add user (Auto Confirm) instead.';
  end if;

  execute format('insert into auth.users (%s) values (%s)',
                 array_to_string(v_cols, ', '), array_to_string(v_vals, ', '));

  ------------------------------------------------------------------
  -- 3. The email identity row. Without it, password login is rejected.
  ------------------------------------------------------------------
  select data_type into v_idtype
    from information_schema.columns
   where table_schema = 'auth' and table_name = 'identities' and column_name = 'id';

  v_cols := '{}';
  v_vals := '{}';

  v_fields := jsonb_build_object(
    -- Older GoTrue: identities.id is TEXT and holds the provider id.
    -- Newer GoTrue: identities.id is a UUID primary key, provider_id holds it.
    'id',            case when v_idtype = 'uuid'
                          then format('%L::uuid', gen_random_uuid())
                          else format('%L', v_uid::text) end,
    'user_id',       format('%L::uuid', v_uid),
    'provider_id',   format('%L', v_uid::text),
    'provider',      format('%L', 'email'),
    'identity_data', format('%L::jsonb',
                      json_build_object(
                        'sub', v_uid::text,
                        'email', lower(v_email),
                        'email_verified', true,
                        'phone_verified', false)::text),
    'last_sign_in_at', 'now()',
    'created_at',      'now()',
    'updated_at',      'now()'
  );

  for k, v in select key, value #>> '{}' from jsonb_each(v_fields) loop
    if exists (
      select 1 from information_schema.columns
       where table_schema = 'auth' and table_name = 'identities'
         and column_name = k
         and is_generated = 'NEVER'
         and coalesce(identity_generation, '') <> 'ALWAYS'
    ) then
      v_cols := v_cols || quote_ident(k);
      v_vals := v_vals || v;
    end if;
  end loop;

  select string_agg(c.column_name, ', ') into v_missing
    from information_schema.columns c
   where c.table_schema = 'auth' and c.table_name = 'identities'
     and c.is_nullable = 'NO' and c.column_default is null
     and c.is_generated = 'NEVER'
     and quote_ident(c.column_name) <> all (v_cols);
  if v_missing is not null then
    raise exception 'auth.identities has required column(s) this script does not set: %', v_missing
      using hint = 'Create the user from Supabase → Authentication → Users → Add user (Auto Confirm) instead.';
  end if;

  execute format('insert into auth.identities (%s) values (%s)',
                 array_to_string(v_cols, ', '), array_to_string(v_vals, ', '));

  ------------------------------------------------------------------
  -- 4. Profile row. The handle_new_user trigger normally creates this;
  --    the upsert is a no-op when it did, and a safety net when it did not.
  ------------------------------------------------------------------
  insert into public.users (id, email, name)
  values (v_uid, lower(v_email), v_name)
  on conflict (id) do nothing;

  update public.users
     set name                    = coalesce(nullif(btrim(name), ''), v_name),
         onboarding_completed_at = coalesce(onboarding_completed_at, now())
   where id = v_uid;

  ------------------------------------------------------------------
  raise notice '────────────────────────────────────────────';
  raise notice ' Demo login created.';
  raise notice '   URL      : https://mece.in/login';
  raise notice '   email    : %', v_email;
  raise notice '   password : %', v_password;
  raise notice '   user id  : %', v_uid;
  raise notice '────────────────────────────────────────────';
  raise notice ' Next: run supabase/seed-demo-account.sql (same email)';
  raise notice '       to grant Pro and seed the dashboard history.';
end $$;


-- ── Verify (safe to run any time) ────────────────────────────────────
select u.email,
       u.id                                                    as user_id,
       case when u.email_confirmed_at is null
            then 'PROBLEM — unconfirmed, login will be refused'
            else 'confirmed' end                               as email_state,
       case when u.encrypted_password is null or u.encrypted_password = ''
            then 'PROBLEM — no password set'
            else 'password set' end                            as password_state,
       (select count(*) from auth.identities i where i.user_id = u.id
          and i.provider = 'email')                            as email_identities,
       case when exists (select 1 from public.users p where p.id = u.id)
            then 'yes' else 'PROBLEM — missing public.users row' end as profile_row,
       (select p.subscription_tier from public.users p where p.id = u.id) as tier,
       (select p.is_demo from public.users p where p.id = u.id)          as is_demo
  from auth.users u
 where lower(u.email) = lower('demo@mece.in');       -- ← same email as above

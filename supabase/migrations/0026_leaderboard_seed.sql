-- =====================================================================
-- Migration 0026: Restore early-user leaderboard rows (owner-supplied points).
--
-- public.users.id is FK'd to auth.users, so each leaderboard user must be a real
-- auth account. We create the auth user (the on_auth_user_created trigger then
-- makes the public.users row with points=0), then set the real points below.
--
-- Idempotent + no duplicate people: each auth insert is skipped when an account
-- with the same email exists OR a public.users row with the same name already
-- exists (so live accounts are never twinned). RUN IN THE SUPABASE SQL EDITOR
-- (touches the auth schema; needs the pgcrypto crypt()/gen_salt() functions,
-- which Supabase provides).
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$kishan.jayaswal@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Kishan Jayaswal$lb$)
where not exists (select 1 from auth.users where email = $lb$kishan.jayaswal@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Kishan Jayaswal$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$satyam.kumar@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Satyam Kumar$lb$)
where not exists (select 1 from auth.users where email = $lb$satyam.kumar@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Satyam Kumar$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$mohit.kumar.raj@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Mohit Kumar Raj$lb$)
where not exists (select 1 from auth.users where email = $lb$mohit.kumar.raj@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Mohit Kumar Raj$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$anahita.bansal@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Anahita Bansal$lb$)
where not exists (select 1 from auth.users where email = $lb$anahita.bansal@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Anahita Bansal$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$mitiksha.jain@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Mitiksha Jain$lb$)
where not exists (select 1 from auth.users where email = $lb$mitiksha.jain@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Mitiksha Jain$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$anubhav.anurag@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Anubhav Anurag$lb$)
where not exists (select 1 from auth.users where email = $lb$anubhav.anurag@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Anubhav Anurag$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$srijita.sengupta@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Srijita Sengupta$lb$)
where not exists (select 1 from auth.users where email = $lb$srijita.sengupta@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Srijita Sengupta$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$akansh.shankar@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Akansh Shankar$lb$)
where not exists (select 1 from auth.users where email = $lb$akansh.shankar@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Akansh Shankar$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$advika.gupta@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Advika Gupta$lb$)
where not exists (select 1 from auth.users where email = $lb$advika.gupta@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Advika Gupta$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$richa.singh@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Richa Singh$lb$)
where not exists (select 1 from auth.users where email = $lb$richa.singh@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Richa Singh$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$sumit.rathore@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Sumit Rathore$lb$)
where not exists (select 1 from auth.users where email = $lb$sumit.rathore@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Sumit Rathore$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$khushi.choudhary@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Khushi Choudhary$lb$)
where not exists (select 1 from auth.users where email = $lb$khushi.choudhary@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Khushi Choudhary$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$yash.kumar@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Yash Kumar$lb$)
where not exists (select 1 from auth.users where email = $lb$yash.kumar@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Yash Kumar$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$siddharth.sahoo@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Siddharth Sahoo$lb$)
where not exists (select 1 from auth.users where email = $lb$siddharth.sahoo@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Siddharth Sahoo$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$alok.singh@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Alok Singh$lb$)
where not exists (select 1 from auth.users where email = $lb$alok.singh@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Alok Singh$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$prithviraj.panda@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Prithviraj Panda$lb$)
where not exists (select 1 from auth.users where email = $lb$prithviraj.panda@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Prithviraj Panda$lb$));

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  $lb$priyanka.yadav@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', $lb$Priyanka Yadav$lb$)
where not exists (select 1 from auth.users where email = $lb$priyanka.yadav@seed.mece.in$lb$)
  and not exists (select 1 from public.users where lower(name) = lower($lb$Priyanka Yadav$lb$));

-- ── set the real points / college / linkedin on the seeded rows ──────
update public.users u
set points = v.points,
    college_other = coalesce(v.college, u.college_other),
    linkedin_url = coalesce(v.li, u.linkedin_url),
    show_linkedin = true
from (values
  ($lb$kishan.jayaswal@seed.mece.in$lb$, 6247::int, null::text, null::text),
  ($lb$satyam.kumar@seed.mece.in$lb$, 5983, $lb$IMI Delhi '27$lb$, null),
  ($lb$mohit.kumar.raj@seed.mece.in$lb$, 5861, $lb$TISS HRM & LR '27$lb$, null),
  ($lb$anahita.bansal@seed.mece.in$lb$, 5574, $lb$IIM Indore '27$lb$, $lb$https://www.linkedin.com/in/anahita-bansal-897537221/$lb$),
  ($lb$mitiksha.jain@seed.mece.in$lb$, 5392, null, null),
  ($lb$anubhav.anurag@seed.mece.in$lb$, 5114, $lb$DMS IIT Delhi '27$lb$, null),
  ($lb$srijita.sengupta@seed.mece.in$lb$, 4967, null, null),
  ($lb$akansh.shankar@seed.mece.in$lb$, 4738, $lb$IIM Indore '27$lb$, $lb$https://www.linkedin.com/in/akansh-shankar-630588227/$lb$),
  ($lb$advika.gupta@seed.mece.in$lb$, 4451, null, null),
  ($lb$richa.singh@seed.mece.in$lb$, 4186, $lb$XIMB '25-27$lb$, null),
  ($lb$sumit.rathore@seed.mece.in$lb$, 3947, $lb$IIM Indore '27$lb$, null),
  ($lb$khushi.choudhary@seed.mece.in$lb$, 3782, $lb$IIM Indore '27$lb$, null),
  ($lb$yash.kumar@seed.mece.in$lb$, 3641, $lb$IIM Indore '27$lb$, null),
  ($lb$siddharth.sahoo@seed.mece.in$lb$, 3296, $lb$IIM Raipur '27$lb$, null),
  ($lb$alok.singh@seed.mece.in$lb$, 3081, $lb$IIM Shillong '27$lb$, null),
  ($lb$prithviraj.panda@seed.mece.in$lb$, 2754, $lb$IIM Indore '27$lb$, null),
  ($lb$priyanka.yadav@seed.mece.in$lb$, 2419, $lb$IIM Indore '27$lb$, null)
) as v(email, points, college, li)
where u.email = v.email;

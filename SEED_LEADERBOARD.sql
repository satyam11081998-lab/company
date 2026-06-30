-- =====================================================================
-- Leaderboard reseed (run manually in the Supabase SQL editor). NOT a migration.
-- RUN ORDER: WIPE_LEADERBOARD.sql -> THIS.
--
-- Identity rule: real email when known > else LinkedIn handle as local-part on
-- the owner-controlled @leaderboard.mece.in placeholder domain > else name slug.
-- Encoding the LinkedIn handle in the placeholder email is also what lets a
-- future real signup with the same handle be MERGED onto this row.
-- Email is never displayed; only name/avatar/points/college/linkedin reach the UI.
--
-- PART A — 3 real accounts (Satyam, Mohit, Kishan): set in place (points guard
--   bypass). PART B — the other 14 as @leaderboard.mece.in placeholders, each
--   keyed by the person's real LinkedIn handle. All 17 have a LinkedIn.
--   Points from the owner table; tier derived in-app.
-- =====================================================================


-- PART 0 — idempotency: drop any prior placeholder accounts. Real accounts untouched.
delete from auth.users
where email like '%@seed.mece.in'
   or email like '%@mece-seed.local'
   or email like '%@leaderboard.mece.in';


-- PART A — 3 real accounts (service_role impersonation for the points guard).
do $$
begin
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);

  -- Satyam Kumar  (kept account per owner: satyam.11081998@gmail.com)
  update public.users set
    name = $lb$Satyam Kumar$lb$, points = 5983, college_other = $lb$IMI Delhi '27$lb$,
    linkedin_url = $lb$https://www.linkedin.com/in/satyam-kumar-8254b4157/$lb$,
    avatar_url = $lb$/testimonials/satyam.jpg$lb$, show_linkedin = true
    where email = $lb$satyam.11081998@gmail.com$lb$;

  -- Mohit Kumar Raj  ("Mohit HRMLR")
  update public.users set
    name = $lb$Mohit Kumar Raj$lb$, points = 5861, college_other = $lb$TISS HRM & LR '27$lb$,
    linkedin_url = $lb$https://www.linkedin.com/in/mohit-kumar-raj-b895b6201/$lb$,
    avatar_url = $lb$/testimonials/mohit.jpg$lb$, show_linkedin = true
    where email = $lb$mohitkumarraj.hrmlr27@gmail.com$lb$;

  -- Kishan Jayaswal  (IIM Indore)
  update public.users set
    name = $lb$Kishan Jayaswal$lb$, points = 6247, college_other = $lb$IIM Indore '27$lb$,
    linkedin_url = $lb$https://www.linkedin.com/in/kishan-jayaswal/$lb$,
    avatar_url = $lb$/testimonials/kishan.jpg$lb$, show_linkedin = true
    where email = $lb$p25kishanj@iimidr.ac.in$lb$;
end $$;

-- Fallback if PART A's UPDATE is blocked by the guard on your instance:
--   alter table public.users disable trigger trg_guard_user_cols;
--   ...the 3 UPDATEs above...
--   alter table public.users enable  trigger trg_guard_user_cols;


-- PART B — the other 14 as @leaderboard.mece.in placeholders (email = LinkedIn handle).
do $$
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$anahita-bansal-897537221@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Anahita Bansal$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$mitikshajain@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Mitiksha Jain$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$anubhavanurag@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Anubhav Anurag$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$srijita-sengupta-57a382202@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Srijita Sengupta$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$akansh-shankar-630588227@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Akansh Shankar$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$advika20gupta@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Advika Gupta$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$richa-singh-425078360@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Richa Singh$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$sumit-rthore@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Sumit Rathore$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$itskchoudhary@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Khushi Choudhary$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$yash-kumar-897613321@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Yash Kumar$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$siddharth-sahoo-183a73175@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Siddharth Sahoo$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$alok-singh-2a593b153@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Alok Singh$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$prithviraj-panda-26210b20a@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Prithviraj Panda$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$priyanka-yadav-207450255@leaderboard.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Priyanka Yadav$lb$));

  delete from public.users where email like '%@leaderboard.mece.in';
  insert into public.users (id, email, name, points, college_other, linkedin_url, show_linkedin)
  select au.id, au.email, au.raw_user_meta_data->>'full_name',
    (case au.email
      when $lb$anahita-bansal-897537221@leaderboard.mece.in$lb$ then 5574
      when $lb$mitikshajain@leaderboard.mece.in$lb$ then 5392
      when $lb$anubhavanurag@leaderboard.mece.in$lb$ then 5114
      when $lb$srijita-sengupta-57a382202@leaderboard.mece.in$lb$ then 4967
      when $lb$akansh-shankar-630588227@leaderboard.mece.in$lb$ then 4738
      when $lb$advika20gupta@leaderboard.mece.in$lb$ then 4451
      when $lb$richa-singh-425078360@leaderboard.mece.in$lb$ then 4186
      when $lb$sumit-rthore@leaderboard.mece.in$lb$ then 3947
      when $lb$itskchoudhary@leaderboard.mece.in$lb$ then 3782
      when $lb$yash-kumar-897613321@leaderboard.mece.in$lb$ then 3641
      when $lb$siddharth-sahoo-183a73175@leaderboard.mece.in$lb$ then 3296
      when $lb$alok-singh-2a593b153@leaderboard.mece.in$lb$ then 3081
      when $lb$prithviraj-panda-26210b20a@leaderboard.mece.in$lb$ then 2754
      when $lb$priyanka-yadav-207450255@leaderboard.mece.in$lb$ then 2419
      else 0 end),
    (case au.email
      when $lb$anahita-bansal-897537221@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$mitikshajain@leaderboard.mece.in$lb$ then $lb$TISS HRM & LR '27$lb$
      when $lb$anubhavanurag@leaderboard.mece.in$lb$ then $lb$DMS IIT Delhi '27$lb$
      when $lb$srijita-sengupta-57a382202@leaderboard.mece.in$lb$ then $lb$IMI Delhi '27$lb$
      when $lb$akansh-shankar-630588227@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$advika20gupta@leaderboard.mece.in$lb$ then $lb$IMI Delhi '27$lb$
      when $lb$richa-singh-425078360@leaderboard.mece.in$lb$ then $lb$XIMB '25-27$lb$
      when $lb$sumit-rthore@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$itskchoudhary@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$yash-kumar-897613321@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$siddharth-sahoo-183a73175@leaderboard.mece.in$lb$ then $lb$IIM Raipur '27$lb$
      when $lb$alok-singh-2a593b153@leaderboard.mece.in$lb$ then $lb$IIM Shillong '27$lb$
      when $lb$prithviraj-panda-26210b20a@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$priyanka-yadav-207450255@leaderboard.mece.in$lb$ then $lb$IIM Indore '27$lb$
      else null end),
    -- linkedin_url derived from the handle in the email local-part
    $lb$https://www.linkedin.com/in/$lb$ || split_part(au.email, '@', 1) || $lb$/$lb$,
    true
  from auth.users au
  where au.email like '%@leaderboard.mece.in';
end $$;


-- PART C — pull each profile's photo from the testimonials bucket (uploaded via
-- /admin/testimonials) onto the leaderboard row, matched by name. avatar_url is
-- not guarded, so this is a plain UPDATE. Overrides the static /testimonials/*.jpg
-- for the 3 if a testimonial photo exists; leaves initials where no photo exists.
update public.users u
set avatar_url = (
  select t.avatar_url
  from public.testimonials t
  where lower(trim(t.name)) = lower(trim(u.name))
    and t.avatar_url is not null and t.avatar_url <> ''
  order by t.updated_at desc nulls last
  limit 1
)
where (
    u.email like '%@leaderboard.mece.in'
    or u.email in ($lb$satyam.11081998@gmail.com$lb$, $lb$mohitkumarraj.hrmlr27@gmail.com$lb$, $lb$p25kishanj@iimidr.ac.in$lb$)
  )
  and exists (
    select 1 from public.testimonials t
    where lower(trim(t.name)) = lower(trim(u.name))
      and t.avatar_url is not null and t.avatar_url <> ''
  );


-- CONFIRM (run separately): expect 17 rows, points desc, Kishan 6247 at top,
-- linkedin = yes for all 17, and avatar = photo wherever a testimonial photo exists.
select name, points, college_other,
  case when linkedin_url is not null then 'yes' else 'no' end as linkedin,
  case when avatar_url is not null then 'photo' else 'initials' end as avatar
from public.users
where email in ($lb$satyam.11081998@gmail.com$lb$, $lb$mohitkumarraj.hrmlr27@gmail.com$lb$, $lb$p25kishanj@iimidr.ac.in$lb$)
   or email like $lb$%@leaderboard.mece.in$lb$
order by points desc;

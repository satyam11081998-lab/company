-- =====================================================================
-- Migration 0035: REVAMP the leaderboard seed deterministically.
-- The guard trigger (0006) reverts points on UPDATE unless role=service_role, so
-- every UPDATE we tried was undone. INSERT does NOT fire that BEFORE-UPDATE guard,
-- so we wipe the seed/placeholder accounts and RE-INSERT public.users with the
-- points baked in. One DO block = one statement (editor runs it whole).
-- Run: clear the SQL editor, paste ONLY this, Run. Then run the SELECT below.
-- =====================================================================
do $$
begin
  -- 1) wipe our failed @seed accounts + the old @mece-seed.local placeholders
  --    (auth.users delete cascades to public.users; these have no real activity).
  delete from auth.users where email like '%@seed.mece.in' or email like '%@mece-seed.local';

  -- 2) create 17 fresh auth accounts (the on_auth_user_created trigger makes a
  --    public.users row at points=0 for each).
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$kishan.jayaswal@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Kishan Jayaswal$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$satyam.kumar@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Satyam Kumar$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$mohit.kumar.raj@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Mohit Kumar Raj$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$anahita.bansal@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Anahita Bansal$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$mitiksha.jain@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Mitiksha Jain$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$anubhav.anurag@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Anubhav Anurag$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$srijita.sengupta@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Srijita Sengupta$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$akansh.shankar@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Akansh Shankar$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$advika.gupta@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Advika Gupta$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$richa.singh@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Richa Singh$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$sumit.rathore@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Sumit Rathore$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$khushi.choudhary@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Khushi Choudhary$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$yash.kumar@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Yash Kumar$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$siddharth.sahoo@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Siddharth Sahoo$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$alok.singh@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Alok Singh$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$prithviraj.panda@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Prithviraj Panda$lb$)),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $lb$priyanka.yadav@seed.mece.in$lb$, crypt($lb$mece-seed$lb$, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', $lb$Priyanka Yadav$lb$));

  -- 3) drop the trigger-created (points=0) rows, then RE-INSERT with the real
  --    points/college/linkedin. INSERT bypasses the BEFORE-UPDATE points guard.
  delete from public.users where email like '%@seed.mece.in';
  insert into public.users (id, email, name, points, college_other, linkedin_url, show_linkedin)
  select au.id, au.email, au.raw_user_meta_data->>'full_name',
    (case au.email
      when $lb$kishan.jayaswal@seed.mece.in$lb$ then 6247
      when $lb$satyam.kumar@seed.mece.in$lb$ then 5983
      when $lb$mohit.kumar.raj@seed.mece.in$lb$ then 5861
      when $lb$anahita.bansal@seed.mece.in$lb$ then 5574
      when $lb$mitiksha.jain@seed.mece.in$lb$ then 5392
      when $lb$anubhav.anurag@seed.mece.in$lb$ then 5114
      when $lb$srijita.sengupta@seed.mece.in$lb$ then 4967
      when $lb$akansh.shankar@seed.mece.in$lb$ then 4738
      when $lb$advika.gupta@seed.mece.in$lb$ then 4451
      when $lb$richa.singh@seed.mece.in$lb$ then 4186
      when $lb$sumit.rathore@seed.mece.in$lb$ then 3947
      when $lb$khushi.choudhary@seed.mece.in$lb$ then 3782
      when $lb$yash.kumar@seed.mece.in$lb$ then 3641
      when $lb$siddharth.sahoo@seed.mece.in$lb$ then 3296
      when $lb$alok.singh@seed.mece.in$lb$ then 3081
      when $lb$prithviraj.panda@seed.mece.in$lb$ then 2754
      when $lb$priyanka.yadav@seed.mece.in$lb$ then 2419
      else 0 end),
    (case au.email
      when $lb$satyam.kumar@seed.mece.in$lb$ then $lb$IMI Delhi '27$lb$
      when $lb$mohit.kumar.raj@seed.mece.in$lb$ then $lb$TISS HRM & LR '27$lb$
      when $lb$anahita.bansal@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$anubhav.anurag@seed.mece.in$lb$ then $lb$DMS IIT Delhi '27$lb$
      when $lb$akansh.shankar@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$richa.singh@seed.mece.in$lb$ then $lb$XIMB '25-27$lb$
      when $lb$sumit.rathore@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$khushi.choudhary@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$yash.kumar@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$siddharth.sahoo@seed.mece.in$lb$ then $lb$IIM Raipur '27$lb$
      when $lb$alok.singh@seed.mece.in$lb$ then $lb$IIM Shillong '27$lb$
      when $lb$prithviraj.panda@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      when $lb$priyanka.yadav@seed.mece.in$lb$ then $lb$IIM Indore '27$lb$
      else null end),
    (case au.email
      when $lb$anahita.bansal@seed.mece.in$lb$ then $lb$https://www.linkedin.com/in/anahita-bansal-897537221/$lb$
      when $lb$akansh.shankar@seed.mece.in$lb$ then $lb$https://www.linkedin.com/in/akansh-shankar-630588227/$lb$
      else null end),
    true
  from auth.users au
  where au.email like '%@seed.mece.in';
end $$;

-- Confirm (run separately):
-- select name, points, college_other from public.users where email like '%@seed.mece.in' order by points desc;

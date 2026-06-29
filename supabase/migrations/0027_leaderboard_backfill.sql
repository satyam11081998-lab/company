-- =====================================================================
-- Migration 0027: Backfill + fix the leaderboard seed (run AFTER 0026).
-- If 0026's auth inserts succeeded but the on_auth_user_created trigger did not
-- create the public.users rows, this creates them directly (the auth.users FK is
-- now satisfied), then sets the real points. Idempotent. Run in Supabase SQL editor.
-- =====================================================================

-- 1) Ensure a public.users row exists for every seeded auth account.
insert into public.users (id, email, name, points)
select au.id, au.email,
       coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'), 0
from auth.users au
where au.email like '%@seed.mece.in'
on conflict (id) do nothing;

-- 2) Apply the real points / college / linkedin.
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

-- 3) DIAGNOSTIC — you should see all the seeded users with their points here.
select name, email, points, college_other, linkedin_url
from public.users
where email like '%@seed.mece.in'
order by points desc;

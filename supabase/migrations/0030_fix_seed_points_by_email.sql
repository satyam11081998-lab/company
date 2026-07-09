-- =====================================================================
-- Migration 0030: Set points on the testimonial/seed accounts by EXACT EMAIL.
-- (0028 matched by name, which missed real accounts that have name variants and
--  is fragile; this is surgical — one row per email, no collisions.)
-- IMPORTANT: select ALL of this and Run, so every UPDATE executes (not just one).
-- =====================================================================

update public.users set points = 5574, show_linkedin = true where email = 'anahita.bansal@seed.mece.in';
update public.users set points = 5114, show_linkedin = true where email = 'anubhav.anurag@seed.mece.in';
update public.users set points = 4738, show_linkedin = true where email = 'akansh.shankar@seed.mece.in';
update public.users set points = 4186, show_linkedin = true where email = 'richa.singh@seed.mece.in';
update public.users set points = 3947, show_linkedin = true where email = 'sumit.rathore@seed.mece.in';
update public.users set points = 3782, show_linkedin = true where email = 'khushi.choudhary@seed.mece.in';
update public.users set points = 3641, show_linkedin = true where email = 'yash.kumar@seed.mece.in';
update public.users set points = 3296, show_linkedin = true where email = 'siddharth.sahoo@seed.mece.in';
update public.users set points = 3081, show_linkedin = true where email = 'alok.singh@seed.mece.in';
update public.users set points = 2754, show_linkedin = true where email = 'prithviraj.panda@seed.mece.in';
update public.users set points = 2419, show_linkedin = true where email = 'priyanka.yadav@seed.mece.in';

-- These 6 were NOT given @seed accounts (a same/similar name already existed).
-- If you want their points too, first run the DIAGNOSTIC below to find which real
-- account is theirs (note the email), then UPDATE that exact email.
-- Kishan Jayaswal 6247 | Satyam Kumar 5983 | Mohit Kumar Raj 5861 |
-- Mitiksha Jain 5392 | Srijita Sengupta 4967 | Advika Gupta 4451

-- DIAGNOSTIC — every account whose name resembles your 17 (name | points | email):
select name, points, email
from public.users
where name ilike any (array[
  '%kishan%','%satyam%','%mohit%','%anahita%','%mitiksha%','%anubhav%','%srijita%',
  '%akansh%','%advika%','%richa%','%sumit%','%khushi%','%yash%','%siddharth%',
  '%alok%','%prithviraj%','%priyanka%'
])
order by name, points desc;

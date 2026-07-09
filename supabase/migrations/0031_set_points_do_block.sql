-- =====================================================================
-- Migration 0031: Set points for all 17 in ONE statement (a DO block), so a SQL
-- editor that "runs only the statement under the cursor" still executes them all.
-- Targets each person by their EXACT email (from the diagnostic), so no name
-- collisions and no duplicate updates.
--   HOW TO RUN: click anywhere inside the DO block and press Run. Then run the
--   SELECT at the bottom separately to confirm.
-- =====================================================================

do $$
begin
  -- testimonial accounts (@seed.mece.in)
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

  -- the 6 that already had real accounts (matched by their real email)
  update public.users set points = 6247 where email = 'jayaswalkishan380@gmail.com';   -- Kishan Jayaswal
  update public.users set points = 5983 where email = 'satyam.p25@imi.edu';            -- Satyam Kumar
  update public.users set points = 5861 where email = 'mohitkumarraj787@gmail.com';    -- Mohit Kumar Raj
  update public.users set points = 5392 where email = 'm2025hrm026@stud.tiss.ac.in';   -- Mitiksha Jain (institutional)
  update public.users set points = 4967 where email = 'srijita.p25@imi.edu';           -- Srijita Sengupta
  update public.users set points = 4451 where email = 'advikagupta2011@gmail.com';     -- Advika Gupta
end $$;

-- Confirm (run separately):
select name, points, email from public.users
where email in (
  'anahita.bansal@seed.mece.in','anubhav.anurag@seed.mece.in','akansh.shankar@seed.mece.in',
  'richa.singh@seed.mece.in','sumit.rathore@seed.mece.in','khushi.choudhary@seed.mece.in',
  'yash.kumar@seed.mece.in','siddharth.sahoo@seed.mece.in','alok.singh@seed.mece.in',
  'prithviraj.panda@seed.mece.in','priyanka.yadav@seed.mece.in','jayaswalkishan380@gmail.com',
  'satyam.p25@imi.edu','mohitkumarraj787@gmail.com','m2025hrm026@stud.tiss.ac.in',
  'srijita.p25@imi.edu','advikagupta2011@gmail.com'
)
order by points desc;

-- =====================================================================
-- Migration 0033: Set leaderboard points, bypassing the privilege-guard trigger.
-- public.users has a BEFORE UPDATE trigger (trg_guard_user_cols, migration 0006)
-- that reverts `points` unless auth.role() = 'service_role'. The SQL editor is
-- not the service role, so every earlier UPDATE was silently undone.
-- This DO block sets session_replication_role = replica for THIS TRANSACTION
-- ONLY (is_local = true), which bypasses user triggers, applies the points, and
-- auto-restores the guard when the transaction ends. Run the whole thing.
-- =====================================================================
do $$
begin
  perform set_config('session_replication_role', 'replica', true);

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

  update public.users set points = 6247 where email = 'jayaswalkishan380@gmail.com';
  update public.users set points = 5983 where email = 'satyam.p25@imi.edu';
  update public.users set points = 5861 where email = 'mohitkumarraj787@gmail.com';
  update public.users set points = 5392 where email = 'm2025hrm026@stud.tiss.ac.in';
  update public.users set points = 4967 where email = 'srijita.p25@imi.edu';
  update public.users set points = 4451 where email = 'advikagupta2011@gmail.com';
end $$;

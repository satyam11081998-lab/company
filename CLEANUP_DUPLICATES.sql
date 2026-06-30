-- =====================================================================
-- Duplicate-account cleanup from the 2026-06-30 roster audit. Run manually in
-- the Supabase SQL editor. Deleting from auth.users cascades to public.users +
-- child data. Irreversible. PREVIEW each block before deleting.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- KUNAL PRASAD — owner confirmed: same person, KEEP the IIM Ranchi account
-- (kunal.prasad25m@iimranchi.ac.in), DELETE the gmail one.
-- ─────────────────────────────────────────────────────────────────────
-- preview:
select id, name, email, points from public.users
where email in ($lb$kunalkumarprasad1234@gmail.com$lb$, $lb$kunal.prasad25m@iimranchi.ac.in$lb$);

-- delete the gmail duplicate:
delete from auth.users where email = $lb$kunalkumarprasad1234@gmail.com$lb$;


-- ─────────────────────────────────────────────────────────────────────
-- SATYAM ×3 — owner decision PENDING ("decide deletes later").
-- Keeper for the leaderboard = satyam.11081998@gmail.com.
-- The two below look like alt/test accounts (satyam-pattern emails, different
-- display names). NOT deleting yet — uncomment when you confirm.
-- ─────────────────────────────────────────────────────────────────────
-- preview:
-- select id, name, email, points from public.users
-- where email in ($lb$satyam.110819981@gmail.com$lb$, $lb$satyamk.rancholabs@gmail.com$lb$);
--
-- delete (only after you confirm):
-- delete from auth.users where email in ($lb$satyam.110819981@gmail.com$lb$, $lb$satyamk.rancholabs@gmail.com$lb$);


-- CONFIRM remaining Kunal/Satyam accounts:
select name, email, points from public.users
where lower(email) like $lb$%kunal%$lb$ or lower(email) like $lb$%satyam%$lb$
order by email;

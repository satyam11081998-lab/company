-- =====================================================================
-- Migration 0028: Set leaderboard points for all 17 users — one simple UPDATE
-- per person, matched by name (covers both the seeded rows and the 6 that
-- already had accounts). Replaces the VALUES-join approach (points came back 0).
--
-- WARNING: overwrites current points for any existing account with these names,
-- including the owner's own (Satyam Kumar -> 5,983). Idempotent. Run in the
-- Supabase SQL editor.
-- =====================================================================

update public.users set points = 6247, show_linkedin = true where lower(name) = lower($lb$Kishan Jayaswal$lb$);
update public.users set points = 5983, show_linkedin = true, college_other = $lb$IMI Delhi '27$lb$ where lower(name) = lower($lb$Satyam Kumar$lb$);
update public.users set points = 5861, show_linkedin = true, college_other = $lb$TISS HRM & LR '27$lb$ where lower(name) = lower($lb$Mohit Kumar Raj$lb$);
update public.users set points = 5574, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$, linkedin_url = $lb$https://www.linkedin.com/in/anahita-bansal-897537221/$lb$ where lower(name) = lower($lb$Anahita Bansal$lb$);
update public.users set points = 5392, show_linkedin = true where lower(name) = lower($lb$Mitiksha Jain$lb$);
update public.users set points = 5114, show_linkedin = true, college_other = $lb$DMS IIT Delhi '27$lb$ where lower(name) = lower($lb$Anubhav Anurag$lb$);
update public.users set points = 4967, show_linkedin = true where lower(name) = lower($lb$Srijita Sengupta$lb$);
update public.users set points = 4738, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$, linkedin_url = $lb$https://www.linkedin.com/in/akansh-shankar-630588227/$lb$ where lower(name) = lower($lb$Akansh Shankar$lb$);
update public.users set points = 4451, show_linkedin = true where lower(name) = lower($lb$Advika Gupta$lb$);
update public.users set points = 4186, show_linkedin = true, college_other = $lb$XIMB '25-27$lb$ where lower(name) = lower($lb$Richa Singh$lb$);
update public.users set points = 3947, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$ where lower(name) = lower($lb$Sumit Rathore$lb$);
update public.users set points = 3782, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$ where lower(name) = lower($lb$Khushi Choudhary$lb$);
update public.users set points = 3641, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$ where lower(name) = lower($lb$Yash Kumar$lb$);
update public.users set points = 3296, show_linkedin = true, college_other = $lb$IIM Raipur '27$lb$ where lower(name) = lower($lb$Siddharth Sahoo$lb$);
update public.users set points = 3081, show_linkedin = true, college_other = $lb$IIM Shillong '27$lb$ where lower(name) = lower($lb$Alok Singh$lb$);
update public.users set points = 2754, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$ where lower(name) = lower($lb$Prithviraj Panda$lb$);
update public.users set points = 2419, show_linkedin = true, college_other = $lb$IIM Indore '27$lb$ where lower(name) = lower($lb$Priyanka Yadav$lb$);

-- Confirm:
select name, points, college_other from public.users
where lower(name) = any (array[lower($lb$Kishan Jayaswal$lb$),lower($lb$Satyam Kumar$lb$),lower($lb$Mohit Kumar Raj$lb$),lower($lb$Anahita Bansal$lb$),lower($lb$Mitiksha Jain$lb$),lower($lb$Anubhav Anurag$lb$),lower($lb$Srijita Sengupta$lb$),lower($lb$Akansh Shankar$lb$),lower($lb$Advika Gupta$lb$),lower($lb$Richa Singh$lb$),lower($lb$Sumit Rathore$lb$),lower($lb$Khushi Choudhary$lb$),lower($lb$Yash Kumar$lb$),lower($lb$Siddharth Sahoo$lb$),lower($lb$Alok Singh$lb$),lower($lb$Prithviraj Panda$lb$),lower($lb$Priyanka Yadav$lb$)])
order by points desc;

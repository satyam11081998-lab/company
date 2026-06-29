-- =====================================================================
-- Migration 0029: Remove the leftover @mece-seed.local placeholder users.
-- These are generic fake accounts from an earlier seed (NOT real users and NOT
-- the owner's 17 restored users, which use @seed.mece.in). Run in Supabase SQL
-- editor. STEP 1 lets you eyeball exactly who will be deleted; STEP 2 deletes.
-- public.users.id -> auth.users(id) is ON DELETE CASCADE, so removing the auth
-- rows also removes the public.users rows (and any of their submissions cascade).
-- =====================================================================

-- STEP 1 — REVIEW first (run this alone, confirm these are all placeholders):
select email, raw_user_meta_data->>'full_name' as name
from auth.users
where email like '%@mece-seed.local'
order by email;

-- STEP 2 — DELETE (run after you've confirmed STEP 1):
delete from auth.users where email like '%@mece-seed.local';

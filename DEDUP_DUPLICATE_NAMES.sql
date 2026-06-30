-- =====================================================================
-- One-off dedup: collapse public.users rows that share a NAME, keeping the
-- highest-points row per name (the seeded leaderboard entry) and deleting the
-- rest. Run manually in the Supabase SQL editor. NOT a migration.
--
-- RUN ORDER: WIPE_LEADERBOARD.sql -> SEED_LEADERBOARD.sql -> THIS.
-- (Seed must exist first so the seeded row is the high-points keeper.)
--
-- ⚠️ DESTRUCTIVE: the deleted side is a real auth login. Deleting from
-- auth.users cascades to public.users + all child data (attempts/submissions/
-- payments/badges). If your OWN account's display name equals a seeded name
-- (e.g. "Satyam Kumar"), it WILL be deleted. Irreversible. PREVIEW FIRST,
-- and if needed exclude specific emails in the WHERE of STEP 2.
--
-- Keep rule (owner-chosen): per name, keep MAX(points); tie-break oldest row.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- STEP 1 — PREVIEW: every duplicate-name group, marked KEEP vs DELETE.
-- Run alone first. Confirm the KEEP row is the seeded one and that nothing
-- you want to retain is marked DELETE.
-- ─────────────────────────────────────────────────────────────────────
with ranked as (
  select id, email, name, points, created_at,
    row_number() over (
      partition by lower(trim(name))
      order by points desc nulls last, created_at asc
    ) as rn,
    count(*) over (partition by lower(trim(name))) as group_size
  from public.users
)
select name, email, points,
  case when rn = 1 then 'KEEP' else 'DELETE' end as action
from ranked
where group_size > 1
order by lower(trim(name)), action;   -- KEEP sorts before DELETE


-- ─────────────────────────────────────────────────────────────────────
-- STEP 2 — DELETE the duplicates (everything except the per-name keeper).
-- Deletes via auth.users so the cascade cleans public.users + child rows.
-- To spare a specific login, add e.g.:  and u.email <> 'me@example.com'
-- ─────────────────────────────────────────────────────────────────────
with ranked as (
  select id,
    row_number() over (
      partition by lower(trim(name))
      order by points desc nulls last, created_at asc
    ) as rn
  from public.users
)
delete from auth.users u
where u.id in (select id from ranked where rn > 1);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 3 — CONFIRM no duplicate names remain (expect 0 rows).
-- ─────────────────────────────────────────────────────────────────────
select lower(trim(name)) as name_key, count(*) as n
from public.users
group by 1
having count(*) > 1
order by n desc;

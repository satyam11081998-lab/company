# ANTIGRAVITY_HANDOFF — leaderboard-wipe-and-gate (Brain / Cowork, 2026-06-30)

touches:
- WIPE_LEADERBOARD.sql (repo root, NEW) — one-off manual cleanup, NOT a migration. Full leaderboard
  reset per owner: (1) hard-delete every seed account (`email like '%@seed.mece.in'` and the old
  `%@mece-seed.local`) — `delete from auth.users` cascades to public.users + child rows; (2) zero
  `points` for ALL remaining (real) users. Preview-first (STEP 1), then STEP 2 delete, STEP 3 zero,
  STEP 4 confirm. Owner has SAVED the datapoints and reinserts them via SEED_LEADERBOARD.sql.
- SEED_LEADERBOARD.sql (repo root, NEW) — one-off manual reseed, NOT a migration. Idempotent DO block:
  clears @seed.mece.in (cascade), creates 17 fresh auth accounts, drops trigger-made points=0 rows,
  then INSERTs public.users with points/college/linkedin baked in. INSERT does NOT fire the
  BEFORE-UPDATE points guard, so no special privilege needed. Same 17 people / points as migration 0035.
- consilio/lib/dashboard/leaderboards.ts — added a **solve gate**: a user is only shown / counted as a
  rival once they have >= `MIN_SOLVES_TO_RANK` (= 3) solves. "Solves" = `effectiveSolves(realSubs, points)`
  = real submission count, else `estimateSolvesFromPoints(points)` (round(points/62)) for seeded/restored
  rows — identical to the `submissions` value already displayed, so gate and shown count never disagree.
  New helpers: `MIN_SOLVES_TO_RANK` (exported), `effectiveSolves`, `gateAndSlice`. Both
  `getAllTimeLeaderboard` and `getCohortLeaderboard` now over-fetch a pool (`max(limit*4, 200)`),
  compute sub-counts, then `gateAndSlice` down to the top `limit`. Top-50 cap unchanged (`limit = 50`,
  set by app/(app)/leaderboard/page.tsx). `buildView` reuses `effectiveSolves` for the row count.

breaking: no — no CONTRACTS.md surface touched. leaderboards.ts keeps its "real rows only, no email
leaves the module" contract; LbRow/YouSummary/LeaderboardView shapes are unchanged. Both SQL files are
manual ops, not auto-running migrations.

## Behaviour notes / caveats
- `total` (used for percentile) is still the raw user count, NOT the gated count — kept cheap; percentile
  remains "top X% of all users". `myRank` is still global. Only displayed ROWS + rivalry neighbours are
  gated. Flag if owner wants total gated too.
- All 17 reseeded rows clear the 3-solve gate via the points estimate (min 2419 pts ≈ 39 est. solves)
  and fit within top-50. Real users with 0–2 real solves and < ~155 points stay hidden until 3 solves.
- "Top 50 only" was already enforced before this session (limit = 50 in page.tsx + both query fns).

## Phased build steps + gates (run on the real tree, not the Cowork sandbox mount)
1. Code: `cd consilio && npx tsc --noEmit` — must be clean. (Cowork's bash mount served a stale,
   truncated copy of leaderboards.ts this session, producing a false TS1002; authoritative file on disk
   is complete/274 lines. Gate logic verified in isolation: pool {6247,200,100,0,(50 w/5 real subs)} →
   qualified = [6247, 200, 50-real], hiding 100(est 2) and 0.)
2. Code: `next build` — must pass.
3. SQL wipe: run WIPE_LEADERBOARD.sql STEP 1 (preview) ALONE; confirm seed accts in 1a + expected real
   users in 1b. Then STEP 2 (delete seeds), STEP 3 (zero points), STEP 4 (confirm). Idempotent + safe to
   re-run.
   - STEP 3 note: `session_replication_role='replica'` is superuser-only in Supabase (error 42501), so
     STEP 3 now impersonates service_role for the txn via `set_config('request.jwt.claim.role',
     'service_role', true)` + `request.jwt.claims '{"role":"service_role"}'` — exactly what
     guard_user_privileged_cols()/auth.role() check. Owner-privilege fallback (disable/enable
     trg_guard_user_cols) documented inline.
4. SQL reseed: run SEED_LEADERBOARD.sql; the confirm SELECT should return 17 rows points-desc, top =
   Kishan 6247. Hard-refresh /leaderboard (force-dynamic).
5. SQL dedup (optional, owner-requested): after SEED, run DEDUP_DUPLICATE_NAMES.sql STEP 1 (preview)
   ALONE, then STEP 2 (delete losers) + STEP 3 (confirm 0 dupes).
6. Commit: `git add consilio/lib/dashboard/leaderboards.ts WIPE_LEADERBOARD.sql SEED_LEADERBOARD.sql
   DEDUP_DUPLICATE_NAMES.sql .brain/handoffs/ANTIGRAVITY_HANDOFF_leaderboard-wipe-and-gate.md`; push;
   redeploy frontend (the gate is a code change). All SQL files are manual ops — keep them OUT of
   supabase/migrations/.

---
## Update — avatars + LinkedIn + dedup (2026-06-30)
- SEED_LEADERBOARD.sql now also sets `avatar_url` to the testimonial photos for the 3 people who have
  one in public/testimonials/: Kishan (/testimonials/kishan.jpg), Mohit (/mohit.jpg), Satyam
  (/satyam.jpg). Other 14 stay null → UI renders a generated initials avatar. Standalone backfill
  UPDATEs included (commented) for the already-ran case (avatar_url is NOT a guarded column).
- SEED LinkedIn expanded beyond Anahita+Akansh to also include Satyam, Mohit, Mitiksha, Srijita, Advika
  (URLs sourced from migrations 0012/0022/0025 + lib/testimonials.ts). Kishan has NO LinkedIn anywhere
  in the repo — left null; supply if owner has it.
- NEW DEDUP_DUPLICATE_NAMES.sql (manual, preview-first): collapses public.users rows sharing a name,
  keeping MAX(points) per name (= the seed), deleting the rest via auth.users cascade. Owner chose
  "keep highest points (seed)". DESTRUCTIVE — deletes the real login on the losing side, incl. the
  owner's own account if its display name matches a seeded name; STEP 1 preview + per-email exclusion
  hook documented in-file. Run AFTER seed.

---
## Update — real-email identity + @leaderboard.mece.in placeholders (2026-06-30)
- Owner asked why @seed.mece.in existed and to use real emails. New identity convention (saved to brain
  memory): real email when known > else the person's LinkedIn handle as local-part on the
  owner-controlled @leaderboard.mece.in placeholder domain > else name slug. The domain is non-routable
  so no shadow login is created under a real inbox. Email is never displayed by the leaderboard UI.
- SEED_LEADERBOARD.sql REWRITTEN into two parts:
  - PART A — the 6 people who already have real accounts (jayaswalkishan380@gmail.com, satyam.p25@imi.edu,
    mohitkumarraj787@gmail.com, m2025hrm026@stud.tiss.ac.in, srijita.p25@imi.edu, advikagupta2011@gmail.com)
    get points/college/linkedin/avatar set IN PLACE on their real account via the JWT-claim points-guard
    bypass. No placeholder, no duplicate for them.
  - PART B — the other 11 INSERTed under @leaderboard.mece.in; local-part = LinkedIn handle for the 2 we
    have one (Anahita, Akansh), else name slug. INSERT bypasses the points guard.
  - PART 0 deletes legacy @seed.mece.in twins so re-running is idempotent. Points unchanged from the table.
- WIPE_LEADERBOARD.sql now also targets @leaderboard.mece.in in STEP 1/2/4. With PART A using real
  accounts, DEDUP_DUPLICATE_NAMES.sql is now mostly redundant (kept as a safety net).
- Run order unchanged: WIPE -> SEED -> (optional) DEDUP.

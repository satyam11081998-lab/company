# ANTIGRAVITY_HANDOFF — leaderboard-wipe-and-gate (Brain / Cowork, 2026-06-30)

touches:
- WIPE_LEADERBOARD.sql (repo root, NEW) — one-off manual cleanup, NOT a migration. Full leaderboard
  reset per owner: (1) hard-delete every seed account (`email like '%@seed.mece.in'` and the old
  `%@mece-seed.local`) — `delete from auth.users` cascades to public.users + child rows; (2) zero
  `points` for ALL remaining (real) users via a `session_replication_role='replica'` DO block (the
  same guard-bypass used by 0033, because `trg_guard_user_cols` reverts a plain UPDATE). Preview-first
  (STEP 1), then STEP 2 delete, STEP 3 zero, STEP 4 confirm. Owner has SAVED the datapoints and will
  reinsert fresh seed data afterward.
- consilio/lib/dashboard/leaderboards.ts — added a **solve gate**: a user is only shown / counted as a
  rival once they have >= `MIN_SOLVES_TO_RANK` (= 3) solves. "Solves" = `effectiveSolves(realSubs, points)`
  = real submission count, else `estimateSolvesFromPoints(points)` (round(points/62)) for seeded/restored
  rows — identical to the `submissions` value already displayed, so gate and shown count never disagree.
  New helpers: `MIN_SOLVES_TO_RANK` (exported), `effectiveSolves`, `gateAndSlice`. Both
  `getAllTimeLeaderboard` and `getCohortLeaderboard` now over-fetch a pool (`max(limit*4, 200)`),
  compute sub-counts, then `gateAndSlice` down to the top `limit`. Top-50 cap unchanged (`limit = 50`,
  set by app/(app)/leaderboard/page.tsx). `buildView` reuses `effectiveSolves` for the row count.

breaking: no — no CONTRACTS.md surface touched. leaderboards.ts keeps its "real rows only, no email
leaves the module" contract; LbRow/YouSummary/LeaderboardView shapes are unchanged. The SQL is a manual
op, not an auto-running migration.

## Behaviour notes / caveats
- `total` (used for percentile) is still the raw user count, NOT the gated count — kept cheap; percentile
  remains "top X% of all users". `myRank` is still global (count of users with strictly more points).
  Only the displayed ROWS and the rivalry neighbours are gated. Flag if owner wants total gated too.
- After the wipe the board is empty; once owner reinserts seed data (points), high-point rows clear the
  3-solve gate automatically via the points estimate. Real users with 0–2 real solves and < ~155 points
  stay hidden until they reach 3.
- "Top 50 only" was already enforced before this session (limit = 50 in page.tsx + both query fns).

## Phased build steps + gates (run on the real tree, not the Cowork sandbox mount)
1. Code: `cd consilio && npx tsc --noEmit` — must be clean. (Cowork's bash mount served a stale,
   truncated copy of leaderboards.ts this session, producing a false TS1002; the authoritative file on
   disk is complete/274 lines. The gate logic was verified in isolation: pool of
   {6247,200,100,0,(50 w/5 real subs)} → qualified = [6247, 200, 50-real], hiding 100(est 2) and 0.)
2. Code: `next build` — must pass.
3. SQL: in the Supabase SQL editor, run WIPE_LEADERBOARD.sql STEP 1 (preview) ALONE; confirm only seed
   accounts in 1a and the expected real users in 1b. Then STEP 2 (delete seeds), STEP 3 (zero points),
   STEP 4 (confirm 0 seed accounts + 0 users-with-points). SQL idempotency: re-running is safe — the
   deletes match nothing the 2nd time and the points-zero is a no-op (`points is distinct from 0`).
4. Owner reinserts saved datapoints (their own SQL), then hard-refresh /leaderboard (force-dynamic).
5. Commit: `git add consilio/lib/dashboard/leaderboards.ts WIPE_LEADERBOARD.sql` +
   `.brain/handoffs/ANTIGRAVITY_HANDOFF_leaderboard-wipe-and-gate.md`; push; redeploy frontend (the gate
   is a code change). WIPE_LEADERBOARD.sql is a manual op — keep it OUT of supabase/migrations/.

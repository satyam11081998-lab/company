# CHANGE RECORD — Prep Copilot curated tools (Phase 1)

**STATUS: APPLIED by Cowork, 2026-09-12.** Verified: backend `py_compile` clean, frontend `esbuild` clean.
Run `tsc --noEmit` + `npm run build` (frontend) before deploy.

## What ships
Turns the copilot from advice into an **agent with a curated tool**: it GENERATES a case or
guesstimate aimed at the candidate's weakest skill + target firm/role, saved **private** to them
(`is_active=false`, `owner_id`), and links them straight into it. Because attempting a case *is* the
conversational scored interview, this one tool = **curated case + guesstimate + role-based live scored mock**.

Reuses the entire existing loop unchanged (solve → interview engine → scorer → history → points).
Private cases never enter practice lists / daily / leaderboard (all filter `is_active=true`), and Pro
users can attempt any case (`access.ts`), so it "just works" for the Pro-gated copilot.

## Files
- **Migration:** `consilio/supabase/migrations/0064_copilot_generated_cases.sql` — adds `owner_id`,
  `generated`, `generated_for` to `cases`; owner-read RLS policy added **only if** cases RLS is already
  on (never enables it). Idempotent.
- **Backend:** `consilio-backend/services/coach/tools.py` (new) — `generate_curated_case(...)`, grounded
  in dimension technique + firm/role, gpt-4o via the `daily_content` provider feature, metered in
  `ai_usage_log`. `routes/coach.py` (edit) — `POST /coach/tool/case` (Pro-gated, rate-limited, budget-guarded).
- **Frontend:** `consilio/app/(app)/coach/page.tsx` (edit) — a "Curated tools" card with **Generate a
  curated case** / **Targeted guesstimate** buttons that call the tool and hand the candidate a
  "Start your interview →" link. (Also carries the earlier margins/container fix.)

## Deploy
1. Supabase: run `0064_copilot_generated_cases.sql`.
2. Backend (`consilio-backend`): `git add services/coach/tools.py routes/coach.py`, commit, push, redeploy.
3. Frontend (`consilio`): `npx tsc --noEmit && npm run build`, `git add "app/(app)/coach/page.tsx" supabase/migrations/0064_copilot_generated_cases.sql .brain/handoffs/HANDOFF_copilot-curated-tools.md`, commit, push.
4. Smoke test: `/coach` → "Generate a curated case" → follow "Start your interview" → confirm the
   conversational interview loads and scores. Confirm it does NOT appear in `/practice` or the leaderboard.

## Next (Phase 2, per MECE_copilot_toolbelt.md)
Living roadmap → constellation binder (recompute on every scored submit), role-intel intake questions,
news→GD tool, post-mortem tool.

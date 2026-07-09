# ANTIGRAVITY_HANDOFF — free-tier-rework (Brain / Cowork, 2026-07-10) — 2 REPOS

Owner spec (pre-launch): free tier becomes a "taste of everything":
1. Practice: daily case + daily guesstimate (unchanged) PLUS **one bank case and
   one bank guesstimate — ONE-TIME, lifetime** (owner-confirmed cadence).
2. GD Briefs: free users browse ALL headlines (visible, NOT locked) but **source
   links are dead** (can't click through to the article) and they can
   generate/view exactly **ONE lifetime brief** of their choice — including
   saving its data points to the cheat sheet and downloading the cheat-sheet PDF.
3. Cheat Sheet: was Pro-only → now **Lite+ full**, free = only points from their
   one unlocked brief (owner-confirmed ladder).
4. CV Pointer Lab (/resume): now a **Pro feature with 2 lifetime free
   generations** for everyone below Pro — UI always fully visible; locked
   overlay after the tries are spent (owner: "try once or twice").

## touches — FRONTEND (this repo, implemented)
- lib/tier.ts — TIER_LIMITS gains additive keys: `lifetimeExtraCases/Guesstimates`
  (free 1/1, paid ∞), `gdBriefsLifetime` (free 1), `cheatSheet`
  ('unlocked-brief' | 'full'), `cvLabTrialUses` (2, Pro ∞). lite.maxBookmarks 0→∞.
  No key removed/renamed.
- lib/access.ts — free non-daily branch rewritten: counts lifetime non-daily
  first-attempts per bucket (`is_first_attempt` && !`counted_for_daily` &&
  !today's dailyRefs), allows while < 1, else new reason **'free-extra-used'**.
  Signed-out stays 'free-non-daily'. AttemptReason union extended (additive).
- app/(app)/cases/[id]/page.tsx — lock copy + CTA for 'free-extra-used'.
- app/(app)/gd-briefs/page.tsx — reads `gd_brief_unlocks` (own row) →
  `unlockedId`/`freeCredit`; CTA ladder per card: "View your free brief" (their
  unlock) / "Use your 1 free brief" (credit unspent; existing brief = navigate,
  else generate) / "Unlock with Lite". Source `<a>` replaced by dead `<span>`
  for free users (both card types). Banner copy per state.
- app/(app)/gd-briefs/[id]/page.tsx — 3-state gate (checking/allowed/denied):
  free allowed if headline is their unlock OR credit unspent; denied = "You've
  used your free GD brief" card. Passes `freeUnlocked` down so the star/save
  button works on THEIR brief.
- components/cheat-sheet/add-to-cheat-sheet-button.tsx — gate Pro→(Lite ||
  freeUnlocked); RLS-denial (42501) gets a friendly upgrade toast.
- app/(app)/cheat-sheet/page.tsx — Pro wall removed; open to all tiers (adds are
  gated at source by RLS); free sees a "your 1 free brief" banner; PDF download
  now reachable by free/lite. TierGate usage removed.
- app/(app)/resume/page.tsx — reads `feature_trials` ('cv_pointer_lab', service
  client) → passes `trial {remaining, limit}` (null for Pro) to BulletLab.
- components/resume/bullet-lab.tsx — trial chip ("Free preview · N of 2 tries
  left"); exhausted = full UI visible under a blur overlay + Upgrade-to-Pro card;
  run() guarded + Generate disabled.
- components/pricing-plans.tsx — Free/Lite/Pro bullets updated to match (Free
  gains the tastes; Lite gains "Unlimited GD briefs + source links" and "Full
  cheat sheet"; Pro gains "CV Pointer Lab — unlimited").
- supabase/migrations/0038_free_tier_rework.sql (NEW, idempotent):
  `gd_brief_unlocks` (PK user+headline; RLS select-own; NO client writes),
  `feature_trials` (PK user+feature, uses int; RLS select-own; NO client writes),
  and cheatsheet_points INSERT tightened (see adversarial #1).

## touches — BACKEND SPEC (consilio-backend, Antigravity to implement)
1. **services/access_guard.py** — mirror lib/access.ts exactly: free non-daily
   allowed while lifetime non-daily first-attempt count in that bucket < 1
   (was: always deny). Same counted_for_daily/dailyRefs semantics. This is the
   authoritative gate on /submit + /attempts/*.
2. **routes/news.py** —
   - POST generate + GET /news/briefs/{id} for tier=free: allow IF a
     gd_brief_unlocks row (user, headline) exists; ELSE if user has NO row at
     all, allow AND insert the row (service role) — atomically enough that two
     racing requests can't create two unlocks (insert … on conflict do nothing,
     then re-check count; PK dedupes same-headline, add a
     `where not exists (select 1 … user_id=X)` guard for different-headline race,
     or take a per-user advisory lock). Free users over quota → 403 with a
     friendly reason.
   - GET /news/headlines for tier=free: **blank out `source_url`** (defense in
     depth — the dead links must not ship the URL in the payload either).
3. **resume routes (/resume/*)** — tier != pro: read feature_trials
   ('cv_pointer_lab'); if uses >= 2 → 403 friendly ("free preview used — Pro");
   on each successful generation upsert+increment (service role). Count a
   REQUEST once (not per internal OpenAI call).
4. Run migration 0038 BEFORE deploying either repo.

breaking: **tier-surface change, cross-repo (C4-adjacent)** — announce in
CHANGELOG with affects: Case solve UX, Practice hub, GD Briefs, Cheat Sheet,
Resume Lab, Pricing. No contract KEY renamed; DB changes additive (no cases/users
columns — NOT a C1/C6 event). Frontend and backend MUST deploy together:
frontend free-brief UX 403s until routes/news.py lands (merge as one train).

## Adversarial check (done; fixes are in the design)
1. **Cheat-sheet Pro gate was CLIENT-ONLY** (found during this work): RLS 0014
   let ANY authed user insert cheatsheet_points directly via PostgREST. 0038
   fixes: INSERT now requires unexpired lite/pro OR the point's headline being
   in the user's gd_brief_unlocks. Pre-existing rogue rows remain readable
   (harmless) — optionally audit later.
2. **Client cannot forge entitlements**: gd_brief_unlocks + feature_trials have
   select-own RLS and NO insert/update/delete policies → only service role
   writes. A user can't reset tries, move their unlock, or add a second one.
3. **All UI gates have a server twin**: attempts → access_guard.py (/submit);
   briefs → routes/news.py; CV lab → resume routes; cheat-sheet add → RLS.
   Frontend state (unlockedId, trial.remaining) is display-only.
4. **Dead links really dead**: free tier gets no <a href> AND (spec #2) no
   source_url in the payload — devtools reveals nothing.
5. **Race: two tabs "Use your 1 free brief" on different headlines** → backend
   unlock insert must be guarded (spec #2). PK alone only dedupes same headline.
6. **Downgrade/expiry**: expired Lite falls to free; RLS expiry check
   (`subscription_expires_at > now()`) blocks further cheat-sheet adds; their
   existing points stay readable (goodwill + re-subscribe pull). A downgraded
   user with no unlock row gets one free brief — accepted (negligible cost).
7. **Account farming**: a fresh email = fresh tastes. Baseline risk accepted at
   launch (signup friction + college-email verification limits it); revisit with
   device/IP heuristics only if abused.
8. **Known transient**: on hydration, `user` from context can be momentarily
   null → the brief detail page may flash the lock card before allowing. QA it;
   if annoying, gate on a `userLoading` flag from user-context.

## ROI rationale (owner asked)
- Cost of a fully-tasted free user (est., from ai_usage_log pricing): 1 bank
  case + 1 guesstimate scoring ≈ $0.02–0.06, 1 GD brief ≈ $0.01–0.02, 2 CV
  bullets ≈ $0.01, dailies ≈ $0.02–0.05/active day. **≈ $0.10–0.25 one-time +
  pennies per active day** — bounded by the existing $10/day kill switch +
  Telegram credit monitor.
- Lite ₹299/mo (≈$3.6) pays for ~15–30 fully-tasted free users; ONE Pro
  (₹599) for ~30–60. Break-even conversion on tasted users ≈ **3–6%** — below
  typical freemium edtech (5–15% when the taste maps 1:1 to the paid feature).
- Every taste ends ON the paywall at the moment of highest intent: the lock
  lands AFTER the aha (solved one bank case, read one brief, generated 2
  bullets), not before. Visible-but-locked (news list, CV lab UI under blur)
  converts better than hidden features — users upgrade for what they've SEEN.
- Retention hooks preserved: dailies + leaderboard stay free, so unconverted
  users keep returning (future upsell audience) instead of churning.
- Watch after launch (admin AI-usage + attempts data): taste-completion rate,
  taste→upgrade conversion within 7d, and free-user AI cost/user — kill or
  loosen limits based on those three numbers.

## Phased build steps + gates (run on the real tree — Cowork mount stale AGAIN;
## frontend tsc could not run in-sandbox this session, review was line-by-line)
1. Frontend: `npx tsc --noEmit` then `next build` — MUST be clean before merge.
   Likely-suspect files if anything trips: the 10 frontend files above.
2. Backend: implement spec, `python -m py_compile` all touched modules.
3. SQL: run 0038 twice on scratch — second run no-ops. Verify with a free-tier
   JWT: INSERT into cheatsheet_points for a random headline → 42501; for their
   unlocked headline → succeeds. INSERT into gd_brief_unlocks / feature_trials
   as authed user → denied.
4. Manual QA (free account): solve daily ✓; solve 1 bank case ✓ then second →
   lock "You've used your free bank case"; same for guesstimate. GD list shows
   dead titles + "Use your 1 free brief"; after using it, other briefs lock,
   theirs stays; star-save works on their brief only; /cheat-sheet shows the
   point + PDF downloads. /resume: chip shows 2 tries, then 1, then blur overlay;
   direct POST to /resume/* after 2 uses → 403. Lite account: cheat sheet full,
   briefs + source links work, CV lab still previews 2 then locks. Pro: no locks.
5. Deploy backend + frontend together; run 0038 first.

## Commit
git add lib/tier.ts lib/access.ts "app/(app)/cases/[id]/page.tsx" \
  "app/(app)/gd-briefs/page.tsx" "app/(app)/gd-briefs/[id]/page.tsx" \
  components/cheat-sheet/add-to-cheat-sheet-button.tsx "app/(app)/cheat-sheet/page.tsx" \
  "app/(app)/resume/page.tsx" components/resume/bullet-lab.tsx \
  components/pricing-plans.tsx supabase/migrations/0038_free_tier_rework.sql \
  .brain/handoffs/ANTIGRAVITY_HANDOFF_free-tier-rework.md
Suggested branch: feat/free-tier-rework (frontend) + feat/free-tier-rework (backend)
Suggested message: feat(tiers): free-tier rework — one-time bank taste, 1 lifetime
GD brief w/ cheat-sheet, dead source links, CV lab 2-try preview, Lite gets full
cheat sheet; migration 0038 + RLS tightening

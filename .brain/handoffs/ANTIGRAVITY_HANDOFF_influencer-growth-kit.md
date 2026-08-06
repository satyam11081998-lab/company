# ANTIGRAVITY_HANDOFF — influencer-growth-kit

**Author:** Cowork brain, 2026-08-06
**touches:** `supabase/migrations/0044_growth_kit.sql`, `supabase/seed-demo-account.sql`,
`lib/{coupons,sessions,tier,types,constants}.ts`,
`lib/dashboard/{demo-users,skill-graph,leaderboards,peer-proximity,activity-feed}.ts`,
`lib/supabase/{auth-cached,middleware}.ts`,
`app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `app/(app)/cheat-sheet/page.tsx`,
`app/(app)/admin/{users,coupons}/*`, `app/api/razorpay/{order,verify,webhook}/route.ts`,
`app/api/coupons/validate/route.ts`, `app/api/cheat-sheet/share/route.ts`,
`app/api/session/end/route.ts`, `app/s/[id]/*`, `app/session-conflict/*`,
`components/cheat-sheet/*`, `components/admin/admin-nav.tsx`, `components/sign-out-button.tsx`
**breaking:** YES — **C7 · Discount coupons** must go v1 → v2 (see below). No other contract moves.
**gates run:** `tsc --noEmit` **EXIT 0** (full project). Postgres grammar + plpgsql
compile validated for both SQL files via libpg_query (`pglast v8.4`) — **OK**.
`next build` could NOT be run in this environment (no linux SWC binary, no npm network);
**owner must run `npm run build` before pushing.**

---

## Why

Influencer marketing launch. Four asks from the owner, plus one latent bug found on the way.

---

## 1 · Demo / showcase account

A demo account is a **real** account: normal signup, normal login, Pro tier, real rows.
It is marked `users.is_demo = true`, which excludes it from the public leaderboard, the
"N aspirants" headcount, the cohort benchmark radar, the live activity tape and the
peer-proximity rival — a seeded Pro history would otherwise sit at rank 1 on the live
national board (the product's main differentiation claim) and move the average every
real user is scored against.

- `lib/dashboard/demo-users.ts` — `getDemoUserIds()` + `notInList()`.
  **Fails open:** on any error (including "column does not exist" pre-migration) it
  returns `[]` and every caller behaves exactly as before. No leaderboard can be blanked.
- `is_demo` was added to `guard_user_privileged_cols()` (migration 0006's trigger), so a
  logged-in user cannot self-flag to hide from the board while keeping their points.
- `leaderboard_top()` (anon RPC) now filters demo accounts. Signature and return shape
  unchanged, so grants and all existing callers are untouched.
- Demo accounts are **exempt from the single-session lock** (§4) — a creator will have the
  account open on a phone and a laptop while filming.

**Seeding:** `supabase/seed-demo-account.sql`, run order documented at the top of the file.
Idempotent — it stamps every row it writes (`feedback_json->>'seed' = 'demo'`) and deletes
its own previous rows before re-inserting. It never touches a row it did not create.

Result: 17 of 22 constellation nodes mastered (**77%**; drop one array entry for 73%),
3 more in progress, a 12-week heatmap, badges, guesstimate radar, a stocked cheat sheet,
and `users.points` set to the **exact sum of first-attempt scores** — computed the same way
`routes/submit.py` does, so the nav-bar number reconciles against the submission log
instead of being a magic number.

### ⚠️ Latent bug fixed here — read this

`lib/dashboard/skill-graph.ts` read `display_x` / `display_y` / `src` / `dst`.
Those columns **do not exist anywhere** in the repo. The live schema (0004 +
`seed-skill-graph.sql`) uses `x_pos` / `y_pos` / `source_id` / `target_id`.

So whenever `skill_nodes` is seeded, every node got `x: NaN` and every edge became
`[undefined, undefined]`. Production has evidently been running with `skill_nodes` EMPTY,
which silently routed the constellation to its built-in mock — the same picture for
every user, ignoring their real progress. The reader now accepts both column names
(`n.display_x ?? n.x_pos`) and drops malformed edges.

**Consequence the owner must accept:** running `seed-skill-graph.sql` (step 2 of the demo
seed) flips the constellation from mock to live data **for every user**. That is the
intended behaviour of the code as written, and a new user's mock view (`nodesForUser('new')`)
is already mostly locked, so this is not a visual downgrade. Rollback is one line:
`delete from public.skill_edges; delete from public.skill_nodes;`

---

## 2 · Admin — Users panel

`/admin/users` (new nav entry). Signups-per-day bar chart for the last 30 days, four
summary tiles, search across name/email/college/LinkedIn, tier filter, and a full-record
drawer per user: identity + phone, college and verification state, LinkedIn, plan dates,
points/streak/avg/best/last-active, payments, coupons used, **sessions with IP, city and
country**, and recent submissions. Plus a demo-flag toggle and "sign out everywhere".

`users.phone` was added as a nullable column — nothing collects it yet; the panel shows it
when present. Wire it into onboarding when you want it captured.

`getUserDetail` re-checks `is_admin` on every call, not just in the layout, and each optional
read is individually error-tolerant so a table missing on one environment cannot blank the panel.

**Note:** the list query selects `is_demo`, so this page needs 0044 to have run. If it
hasn't, the page renders an explicit "Could not load users: …" banner rather than an
empty table pretending to be the truth.

---

## 3 · Influencer coupons (⚠️ contract C7 v1 → v2)

### Proposed CONTRACTS.md change — please apply before the next brain touches Payments

> **C7 · Discount coupons & deck submissions (v2, 2026-08-06)**
> A coupon is now one of two shapes:
> - `user_id NOT NULL` → **user-locked, single use** (Deck Vault Rewards). Behaviour is
>   byte-for-byte v1: only the owner may use it, redeeming flips `status` to `'redeemed'`.
> - `user_id NULL` → **public / influencer**. Any signed-in buyer may use it, capped by
>   `max_redemptions` (NULL = unlimited); redeeming increments `redemption_count` and only
>   flips `status` when the cap is hit.
>
> All four call sites (`/api/coupons/validate`, `/api/razorpay/{order,verify,webhook}`) now
> route through **`lib/coupons.ts`** — `loadCoupon` / `checkCoupon` /
> `couponHonouredAtPayment` / `redeemCoupon`. Do not re-implement coupon rules inline; that
> duplication is exactly what the money rule exists to prevent.
>
> **Money rule (extends v1):** the charged amount is still computed ONLY by
> `discountedPaise()`. Owner commission is computed ONLY by `commissionPaise()` and is based
> on **LIST price, not the amount paid** (owner decision, 2026-08-06) so a payout does not
> shrink as the discount grows. Every redemption is booked to `coupon_redemptions`, which has
> `UNIQUE(razorpay_payment_id)` — that unique index, not application logic, is what makes
> `/verify` and the webhook racing on the same payment safe. `coupon_redemptions` has RLS
> enabled with **zero policies** (deny-all): commission is service-role-only and must never
> reach a buyer-facing response.
>
> **Rule:** any change to coupon states, either pct computation, the notes schema, or any of
> the three tables = `BREAKING`. Affects: Payments, Deck Vault Rewards, Admin.

### Seeded
`ANUSHKA10` — 10% off any plan for the buyer, 5% of list price accrued to Anushka,
unlimited uses, valid 365 days. Create more at `/admin/coupons`, which also shows
redemption logs, gross collected, commission owed, and a "mark paid" payout action.

Worked example (Pro monthly, ₹599): buyer pays **₹539.10**, Anushka accrues **₹29.95**.

The `/upgrade` coupon box needed **no changes** — it already posts any typed code to
`/api/coupons/validate`, which now understands public codes.

---

## 4 · Single active session (Netflix-style)

- `user_sessions` keyed on the Supabase JWT `session_id` claim. Live while `revoked_at IS NULL`.
- **Sessions never time out.** They end on explicit sign-out, on take-over, or via admin.
- Enforcement lives in **`app/(app)/layout.tsx`, not middleware** — deliberately. The layout
  runs on the Node runtime (service-role client available) and the existing auth +
  onboarding path in middleware is completely untouched. Middleware got exactly one line:
  a `/session-conflict` carve-out in the onboarding gate, without which a not-yet-onboarded
  user would ping-pong `/session-conflict → /onboarding → /session-conflict`.
- Second device → `/session-conflict`, which names the other device (browser, OS, city,
  last seen) and offers one button: *Use MECE here instead*. That is the anti-lockout valve —
  a strict refusal would strand anyone whose laptop died with no way back.
- `touchSession()` **never throws**: missing table, missing claim, failed query all return
  `untracked` and the lock is simply inactive. Losing device bookkeeping must never lock a
  paying user out of the product.
- Heartbeat writes are throttled to once per 5 minutes.
- Sign-out now calls `POST /api/session/end` first, so the slot frees immediately.

**Known, accepted race:** two brand-new logins hitting their first page view simultaneously
can both insert and both stay live, silently disabling the lock for that account until an
admin uses "sign out everywhere". Fail-open was chosen over kicking a legitimate device.

---

## 5 · Cheat sheet PDF — branded, watermarked, shareable

- Tiled diagonal `MECE` background watermark on every page (5% opacity, painted first so
  body text stays fully readable and selectable), MECE masthead, and a footer carrying
  `mece.in`, the share link and page numbers.
- **Get shareable link** renders the PDF, uploads it, mints `mece.in/s/<id>`, then
  re-renders once with that link baked into the footer and replaces the object. Two renders
  is the honest cost of a self-referencing document.
- `/s/<id>` is public (added to `PUBLIC_ROUTES`): OG/Twitter metadata for link previews,
  inline `<object>` viewer, Open/Download buttons for mobile browsers that refuse inline
  PDFs, and a signup CTA underneath. The sheet is the ad; the page is the landing.
- `/s/<id>/file` **streams** the object through our domain rather than redirecting, so the
  shared URL stays on `mece.in` end to end.
- Bucket `cheat-sheets` is `public = true` (read) with **no storage policies**, so only the
  service role can write. Uploads are validated on size (5 MB), declared type, and `%PDF`
  magic bytes; a failed row insert rolls the object back so no orphan is left in a public bucket.
- `PUT` (used only for the self-referencing swap) checks row ownership — one user can never
  overwrite another's published sheet.

---

## Adversarial review — round 2 (2026-08-06, after the AGV brain sync)

Four defects found on re-read and fixed in place. All were mine, none were AGV's.
`tsc --noEmit` **EXIT 0** after the fixes; all three SQL files re-validated.

1. **Lost update on `discount_coupons.redemption_count`** (`lib/coupons.ts`).
   The counter was written as `loadedValue + 1`. Two concurrent redemptions both
   read the same stale row, so one increment was silently lost and a *capped*
   code could over-redeem. It now **recounts from `coupon_redemptions`**, which
   `UNIQUE(razorpay_payment_id)` already makes exact. Money was never at risk —
   the ledger was always correct — but the cap was under-enforcing.
   *Residual, accepted:* the cap is still checked at ORDER time, so N buyers
   checking out simultaneously against the last slot can all pass. Discount
   caps, not seats — not worth a row lock.

2. **Public `cheat-sheets` bucket defeated revocation** (`0044`, share route).
   `/s/<id>/file` checks `revoked_at`, but a public bucket also hands out a
   permanent direct object URL that skips that check — revoking a shared sheet
   would not have revoked anything. The bucket is now **private**; the route
   already streamed via the service role, so nothing else changed.
   **Re-run `0044` if you ran the earlier version** — it flips the bucket back.

3. **`getDemoUserIds` fired 4× per dashboard render.** Rank, benchmark, peer
   proximity and the activity tape each asked independently. Added
   `getDemoUserIdsCached()` (React `cache()`, request-scoped, takes no client
   arg so the memo key is stable) — back to one round-trip. This matters:
   dashboard latency is a tracked concern in this repo.

4. **`/session-conflict` reachable with no `session_id` claim.** Typing the URL
   rendered a conflict screen whose take-over button could not work. Now
   redirects to `/dashboard`, matching the layout, which never sends you there
   in that state.

Also polished: a public code at its cap now says *"reached its limit"* instead of
*"already been used"* (it flips to `status='redeemed'` at the cap, which would
otherwise read as an accusation).

**Checked and found clean:** order/verify/webhook all still agree to the paisa;
`notes.coupon` remains server-set; deck-vault coupons keep v1 semantics exactly;
every server action re-checks `is_admin` (they are publicly callable by URL);
`coupon_redemptions` is RLS deny-all; user-locked coupons still return a generic
"Invalid coupon code" so they cannot be brute-forced; every demo-exclusion filter
fails open to unfiltered if 0044 has not run.

**Known and accepted, documented not fixed:** `shared_cheat_sheets.view_count` is
a read-modify-write and undercounts concurrent views (cosmetic); admin pages read
data before the layout's redirect resolves, because Next renders layout and page
in parallel — pre-existing across every admin page, and nothing reaches the client.

---

## Verification

`supabase/check-growth-kit.sql` — **read-only**, 10 blocks, verified SELECT-only by
AST (every top-level node is a `SelectStmt`). Reports: whether 0044 landed, demo
account health with a points-reconciliation check, per-node constellation mastery,
nodes with no case authored, coupon money with a counter-drift check, the
redemption ledger, ledger-vs-payments reconciliation, live sessions per user,
shared sheets, and 30-day signups. Supabase shows only the last result set — run
it block by block.

---

## Run order (owner)

1. `supabase/migrations/0044_growth_kit.sql`  — after 0041, 0042, 0043
2. `supabase/seed-skill-graph.sql`            — see the §1 warning first
3. `supabase/seed-cases-constellation.sql`
4. Sign the demo account up at `/signup`, finish onboarding
5. Set `v_email` in `supabase/seed-demo-account.sql`, run it
6. `npm run build`, then deploy

`SUPABASE_SERVICE_ROLE_KEY` must be set on Vercel — the session lock and PDF sharing both
no-op without it (deliberately: they degrade, they do not error).

---

## Test plan

**Demo account:** log in → constellation shows ~17 mastered nodes with real labels, not the
mock → points on the nav bar equal `sum(score)` over first attempts → heatmap filled →
badges present → cheat sheet has 12 points → open on a second device: NO conflict screen →
open `/leaderboard` from a different real account: demo account absent.

**Coupons:** `/upgrade` → enter `ANUSHKA10` → both cards show a slashed price → buy Pro
monthly → charged ₹539.10 → `/admin/coupons` shows 1 redemption, ₹29.95 owed → mark paid →
owed drops to ₹0, lifetime stays ₹29.95. Negative: revoked code (400), `max_redemptions`
reached (400), Lite purchase with a Pro-scoped code (400), a *deck-vault* coupon belonging
to someone else (still the generic "Invalid coupon code" — no oracle), reusing a deck-vault
coupon (400).

**Sessions:** log in on Chrome → log in on Firefox → Firefox lands on `/session-conflict`
naming "Chrome on Windows" + city → click *Use MECE here instead* → Firefox works, Chrome's
next navigation bounces to the conflict screen → sign out in Firefox → Chrome takes over
cleanly. Admin: `/admin/users` → open that user → sessions list shows IP + city → "sign out
everywhere" clears them.

**PDF:** `/cheat-sheet` as Pro → Download → watermark on every page, text still selectable,
footer shows mece.in → *Get shareable link* → link copied → open it in a private window
(logged out) → PDF renders, footer now carries its own URL → check `shared_cheat_sheets.view_count`
increments. Negative: upload a renamed `.exe` via the API (400 on magic bytes), share twice
within 10s (429), `PUT` another user's sheet id (404).

**Regression (must all still pass):** deck-vault coupon end-to-end; Razorpay refund →
downgrade; leaderboard + cohort tabs; dashboard rank/percentile; onboarding gate for a
brand-new signup; guest preview on `/dashboard` while logged out.

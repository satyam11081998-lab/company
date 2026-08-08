# ANTIGRAVITY_HANDOFF — guest-mode + dashboard-as-landing

**Author:** Cowork brain, 2026-08-07. **Feature:** NEW — `guest-mode` (no LEDGER row yet).
**Proposed branch:** `feat/guest-mode` (frontend) + `feat/guest-mode` (backend).
**Type:** growth / acquisition. Cross-repo. Touches auth, RLS, routing and SEO.

```
touches:  supabase  migrations/0045_guest_mode.sql (NEW)
          frontend  middleware + lib/supabase/middleware.ts, lib/constants.ts,
                    lib/tier.ts, lib/access.ts, lib/guest.ts (NEW),
                    lib/sessions.ts, lib/seo.ts, app/sitemap.ts,
                    app/page.tsx, app/explore-mece/page.tsx (NEW),
                    app/(app)/layout.tsx, app/(app)/dashboard/page.tsx,
                    app/(app)/cases/[id]/page.tsx,
                    app/api/razorpay/*, app/api/coupons/validate,
                    components/guest/* (rewrite), components/dashboard/*,
                    lib/dashboard/{leaderboards,activity-feed,peer-proximity,demo-users}.ts
          backend   services/access_guard.py, services/auth.py, routes/attempts.py,
                    routes/submit.py, routes/transcribe.py, routes/vision.py,
                    routes/resume.py, routes/deck_vault.py
breaking: YES — proposes C6 v1 → v2 (public.users gains is_guest).
          Adds RESTRICTIVE anon clauses that change the meaning of "authenticated"
          across every existing policy. PROPOSES new contract C10 (guest identity
          surface). NOT yet written into CONTRACTS.md — owner must approve first.
affects:  Auth, Onboarding, Dashboard, Case solve UX, Free-tier rework, Payments,
          Leaderboard, Admin, Landing, Deck Vault Rewards
```

---

## Owner decisions (2026-08-07)

| Question | Decision |
| --- | --- |
| Guest identity | **Supabase anonymous auth** (`signInAnonymously()`) |
| Landing | `/` becomes the dashboard; current landing moves to **`/explore-mece`** with its Start-Case / Start-Guesstimate buttons made **live**. **SEO must be enhanced, never degraded — non-negotiable.** |
| Preview isolation | **Supabase branch + Render preview environment** |
| Guest quota | **Exactly today's daily case + today's daily guesstimate.** Nothing else. |

---

## Part 1 — Guest identity

### The core mechanic

`supabase.auth.signInAnonymously()` creates a real `auth.users` row with
`is_anonymous = true` and returns a real JWT. Consequences, all of them free:

- `auth.uid()` resolves → every existing RLS policy works.
- `handle_new_user` (0001) fires → a real `public.users` row exists.
- `services/auth.py get_verified_user_id()` validates the token unchanged →
  **the entire FastAPI backend needs no new auth path.**
- `case_attempts`, `submissions`, `feedback_json`, scoring, badges, streak — all
  write against a real user id.

This is why the owner's original question ("how will streaks / activity / career
ladder show if they're not logged in?") dissolves: **they are logged in.** The
dashboard renders their real (day-1) streak, their real empty activity feed, and
their real ladder position. No sample data, no `pointer-events-none`, no
"you're viewing a demo" banner. `lib/dashboard/guest-sample.ts` is **deleted**.

### The quota is not new code

The owner's rule — *the daily case + the daily guesstimate, nothing more* — is
already what `services/access_guard.py` computes for free tier. `assert_can_attempt`
returns early on `is_daily` for every tier. A guest is therefore:

> **a free-tier user whose one-time non-daily extras are zero.**

Implementation is the `is_daily is False` branch only:

```python
# services/access_guard.py — inside assert_can_attempt, after `is_daily` is computed
if not is_daily and is_guest(supabase, user_id):
    raise HTTPException(
        status_code=403,
        detail="Sign up free to practise beyond today's case and guesstimate.",
    )
```

Mirror in `lib/access.ts` as a new `AttemptReason = 'guest-non-daily'` (UX only —
the backend stays authoritative, per the existing comment in that file).
**Do not invent a second quota system.** `CLARIFICATION_QUOTA` (C9) is untouched:
a guest is `free`, so 7 clarifications per attempt, exactly as today.

### Conversion

The wall fires **once**, at the moment a guest reaches for a third solve, or taps
"Save my progress". It is not a login nag and there is no "demo" label anywhere.
Copy intent (owner to finalise):

> **Save your work.** You've solved 2 and scored 71 average. Add an email and this
> stays yours — otherwise it's gone when you close this browser.

Mechanically: `updateUser({ email })` or `linkIdentity({ provider: 'google' })`
upgrades **the same `auth.users` row**. Attempts, submissions, streak, constellation
and points all carry over with zero migration of rows. This is the single strongest
argument for anon auth over cookies or IP and it must not be compromised by any
implementation shortcut that creates a second user.

**Requires:** *Manual linking* enabled in the Supabase dashboard alongside
*Anonymous sign-ins*. Both are project-level toggles — see Part 4.

### Identity conflict (must be handled, not deferred)

A guest whose email already belongs to a permanent account will get an error from
`updateUser`. Handle per the Supabase-documented flow: catch it, sign them into the
existing account, and **discard** the guest rows (do not re-parent attempts —
`case_attempts` has first-attempt semantics that a merge would corrupt). Show:
*"You already have an account — we've signed you in. Today's practice was not
carried over."* Silent data loss here is a support ticket generator; the message is
mandatory.

---

## Part 2 — Adversarial surface (the real cost of this change)

**Anonymous users assume the `authenticated` Postgres role.** Every policy written
`to authenticated` today silently starts admitting guests the moment the toggle
flips. Supabase's own linter flags this as `0012_auth_allow_anonymous_sign_ins`.
This is the highest-risk part of the feature and the adversarial check must cover
every row below.

Two mechanisms are used, and `0044` already gave us the pattern for the second:

1. **RESTRICTIVE RLS policies** — `as restrictive ... using ((select (auth.jwt()->>'is_anonymous')::boolean) is false)`. Permissive policies OR together; only a restrictive one can subtract.
2. **`public.users.is_guest`** — mirrored from `is_anonymous` by the `handle_new_user` trigger, so every existing `is_demo` exclusion query gains the filter with one clause. Same shape as `getDemoUserIdsCached()` / `notInList()`.

| # | Surface | Threat if unguarded | Fix |
| --- | --- | --- | --- |
| 1 | `razorpay/{order,verify,webhook}`, `coupons/validate` (**C7 v2**) | Guest buys Pro; guest burns `ANUSHKA10` redemptions; commission booked to a throwaway user | Hard 403 on `is_anonymous` at the top of all four routes, **before** `loadCoupon`. Restrictive policy on `discount_coupons`, `coupon_redemptions` |
| 2 | `submissions` → leaderboard, `activity_feed`, `peer_proximity`, `proof_rail`, global rank | Public boards fill with `Guest #a81f` | Extend the `is_demo` exclusion to `is_demo or is_guest` in `lib/dashboard/{leaderboards,activity-feed,peer-proximity,proof-rail}.ts` and the 0044 leaderboard view |
| 3 | Interview stream, `/submit` scoring, `/transcribe`, `/vision`, `/resume` | **Real per-call spend.** A bot loop is a direct bill | Turnstile CAPTCHA on `signInAnonymously`; keep `services/rate_limit.py`; guests denied `/resume`, `/transcribe`, `/vision` entirely (403) — the daily pair is text-only |
| 4 | `user_sessions` device lock (0044) | Every guest contends for a session row; `/session-conflict` storms | Exempt `is_guest` exactly as `is_demo` is exempted in `app/(app)/layout.tsx:118` |
| 5 | Middleware onboarding gate | Guest has no `onboarding_completed_at` → **infinite redirect to `/onboarding`** → blank 503 (this exact failure is documented in `lib/supabase/middleware.ts`) | Add `&& !isGuest` to the gate condition. **Highest-severity functional bug in this feature — test first.** |
| 6 | `deck_submissions` upload | Rights grant / T&C signed by an anonymous nobody — legal exposure, and the T&C is already awaiting review (STATE blocker 6) | 403 on `is_anonymous` in `routes/deck_vault.py`; restrictive policy on the table |
| 7 | `endorsements`, `testimonials`, `feedback`, `case_ratings` | Spam vector with zero attribution | Restrictive policy per table |
| 8 | `auth.users` growth | Supabase has **no automatic cleanup** for anonymous users | `pg_cron` nightly: `delete from auth.users where is_anonymous is true and created_at < now() - interval '30 days'`. Cascades to `public.users` |
| 9 | `/admin/*` | Guest reaching admin | Existing admin check is role-based, but add the anon guard as defence in depth |
| 10 | `users.points` / `trg_guard_user_cols` | Guest inflating points | Already guarded by the trigger (0044 adds `is_demo` to the reverted set — **add `is_guest` to the same set**) |

> **Note for the reviewer:** run `get_advisors(type: "security")` on the branch after
> the toggle is enabled and after 0045 is applied. Lint `0012` will fire by design;
> every *other* new finding is a real defect.

---

## Part 3 — Landing split, and the SEO contract

Owner constraint, quoted: *"SEO must not be compromised, that's non negotiable, it
must be enhanced only, not degraded."* This part is therefore written as a set of
invariants, not suggestions.

### Invariants — the build fails review if any is violated

1. **Zero redirects.** `/` is never 301/302'd anywhere. Backlinks point at `/`.
2. **Zero `noindex`.** No route loses indexability.
3. **`/` keeps its `<head>` byte-identical**: title, description, canonical, OG,
   Twitter card, and the **`FAQPage` JSON-LD** (`faqPageJsonLd(HOMEPAGE_FAQS)`).
4. **`/` stays statically rendered with `revalidate = 300`.** See "the CWV trap".
5. **The sitemap only gains entries.** Nothing is removed.
6. **No duplicate content** between `/` and `/explore-mece` — see the content split.

### The CWV trap (the actual SEO risk — not the content move)

The instinct is to make `/` `force-dynamic` like `/dashboard`. **Do not.** That
would replace a 300-second-ISR page with a per-request page doing Supabase auth
round-trips — an LCP regression on the single most valuable URL on the domain, and
Core Web Vitals *is* a ranking input. It would also hit the hazard Supabase warns
about explicitly: *"user metadata being cached across unique anonymous users as a
result of Next.js static page rendering."*

Both problems have the same solution:

> **`signInAnonymously()` runs client-side, after first paint. No server component
> on `/` may read the anon session.**

The server render of `/` is therefore identical for every visitor and every crawler
— cacheable, static, fast. Googlebot gets a full static page. The browser hydrates,
creates the anon session, and swaps in the live dashboard. `revalidate = 300`
survives. This is a hard architectural constraint, not an optimisation.

### The content split (avoids self-cannibalisation)

Moving the landing copy wholesale to `/explore-mece` and leaving `/` as a bare
dashboard **would** degrade `/`. Splitting by intent does not:

| | `/` | `/explore-mece` |
| --- | --- | --- |
| Primary intent | branded + trust | non-branded acquisition |
| Target terms | "MECE", "case interview prep India", "MBA placement prep" | "free case interview practice online", "practice guesstimates free", "15 minute case interview" |
| H1 | unchanged from today | new, distinct |
| Body | live dashboard, **then** the proof half: scoring-rubric explainer, testimonials, FAQ | the product half: live hero demo, features, how-it-works, the 15-minute live case |
| JSON-LD | `FAQPage` (kept) + site graph | `SoftwareApplication` + `HowTo` (**new rich-result surfaces**) |
| Rendering | static, `revalidate = 300` | static, `revalidate = 300` |

Net effect on the index: `/` keeps its head, its FAQ rich result, its H1 and
substantial crawlable body copy, and **gains** dwell-time and engagement signal from
a working product above the fold. `/explore-mece` is a **new** indexable URL with
**new** structured data. Internal linking improves (`/` ⇄ `/explore-mece` ⇄
`/pricing` ⇄ `/learn/casebook/*`). Nothing is subtracted.

**Copy split needs the owner's eye before build** — the two pages must not read as
the same page twice.

### Navigation

- On `/`: a **quiet text link** in the nav — *"How this works"* — not a button
  competing with "Start today's case". "About MECE" is inward-facing; the label
  should say what the visitor gets.
- On `/explore-mece`: the return CTA is **"Start practising →"** pointing at `/`.
- Start Case / Start Guesstimate on `/explore-mece` become **live**: fire
  `signInAnonymously()`, then route to today's daily. The "15 minutes" framing is a
  timer and a promise in the copy — **no new plumbing**, it is the same solve
  workspace.

### Sitemap deltas

```
+ entry('/explore-mece', 0.9, 'weekly')
  entry('', 1, 'weekly')            ← unchanged, still priority 1
```

---

## Part 4 — Preview isolation

Vercel already builds a preview per branch (`mece-git-feat-guest-mode-*.vercel.app`)
and production is untouched by a push. That half is free. The other three are not:

1. **Supabase branch** (owner-approved). Gives an isolated DB *and* its own
   auth settings. This matters more than the DB: **"Enable anonymous sign-ins" and
   "Manual linking" are project-level dashboard toggles, not code.** On the
   production project, flipping them is live on `mece.in` instantly. The Supabase
   branch is the only option where that is not true.
2. **Render preview environment** for the backend, or a second Render service. The
   preview frontend must not call the production FastAPI — `access_guard.py` there
   has no guest branch, so guests would silently get free-tier extras.
3. **Preview env vars:** the preview frontend must point `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_API_URL` at the branch DB and
   the preview backend. **Vercel preview deployments inherit Preview-scoped vars —
   verify these are overridden per-branch or the preview will silently write to
   production.**

> ⚠️ **STATE blocker 1** (Vercel prod build failing at prerender on missing
> `NEXT_PUBLIC_SUPABASE_*`) predates this work and is still listed as open. Commits
> have landed since, so it may be resolved — **confirm before starting**, because
> this feature adds two more prerendered public routes and would re-trigger the same
> failure mode.

---

## Phased build + gates

Each phase ends with its gate green before the next begins. Do not batch.

**Phase 0 — isolation (no code)**
- Create Supabase branch. Create Render preview service. Point Vercel preview env at both.
- Enable *Anonymous sign-ins* + *Manual linking* **on the branch only**.
- Set the anon IP rate limit (default 30/hr) and attach Turnstile.
- Gate: branch `list_projects` / `list_branches` shows the branch; `/api/me` on the preview returns the branch project ref, **not** production's.

**Phase 1 — DB (`0045_guest_mode.sql`)**
- `alter table public.users add column if not exists is_guest boolean not null default false;`
- `handle_new_user` writes `is_guest := (new.is_anonymous is true)`.
- Add `is_guest` to the `trg_guard_user_cols` reverted set (mirror 0044's `is_demo` line).
- Partial index `where is_guest = true`.
- Restrictive policies on: `discount_coupons`, `coupon_redemptions`, `deck_submissions`, `endorsements`, `testimonials`, `feedback`, `case_ratings`.
- `pg_cron` 30-day cleanup job.
- Gate: **idempotent** — runs twice with identical end state. Postgres grammar + plpgsql compile validated. `get_advisors(type:"security")` shows no new finding except lint `0012`.

**Phase 2 — backend guard**
- `services/auth.py` exposes `is_guest_token()`; `access_guard.py` gets the non-daily branch.
- 403 for guests on `routes/{deck_vault,resume,transcribe,vision}.py`.
- Gate: `python -m py_compile` EXIT 0 on every changed file. Manual: guest token on today's daily → 200; on any other case → 403.

**Phase 3 — middleware + session (the crash-risk phase)**
- Onboarding-gate exemption for `is_guest` (surface #5).
- Session-lock exemption in `app/(app)/layout.tsx` (surface #4).
- Gate: `tsc --noEmit` EXIT 0. Manual: fresh incognito hits `/` and **does not** redirect to `/onboarding`; two incognito windows do not trigger `/session-conflict`.

**Phase 4 — guest surface rewrite**
- `lib/guest.ts` (client-side `ensureGuestSession()`), delete `lib/dashboard/guest-sample.ts`, rewrite `components/guest/*` (drop `GuestPreviewFrame`'s banner, sticky bar and `pointer-events-none`).
- Dashboard exclusion filters gain `is_guest` (surface #2).
- Gate: `tsc --noEmit` EXIT 0. Manual: guest dashboard shows day-1 streak, empty activity, real ladder — no sample numbers anywhere.

**Phase 5 — landing split**
- `/` = dashboard + proof half; `/explore-mece` = product half; sitemap + JSON-LD.
- Gate: `npm run build` EXIT 0 **and `/` still reports as statically prerendered with `revalidate: 300` in the build output** — if it prints `ƒ (Dynamic)`, the phase has failed its own invariant. Lighthouse SEO on `/` ≥ the pre-change score. `curl` of `/` with JS disabled returns the FAQ JSON-LD and the H1.

**Phase 6 — conversion + payments lockout**
- Upgrade flow (`updateUser` / `linkIdentity`), identity-conflict message, the single wall.
- 403s on all four payment routes (surface #1).
- Gate: `tsc --noEmit` + `npm run build` EXIT 0. Manual: guest → `/upgrade` → Razorpay is refused server-side, not merely hidden in the UI.

**Phase 7 — adversarial pass** (owner explicitly asked for this)
- Walk all 10 rows of Part 2 as an attacker with a guest JWT.
- Re-run `get_advisors` for security **and** performance.
- UI pass: mobile + dark mode on `/`, `/explore-mece`, guest dashboard, guest solve, the wall.
- Confirm: no "demo" label, no "login" nag before solve #3, nothing inert.

---

## Proposed contract changes — **owner approval required before writing**

Per the session preamble, these are proposed here and **not** written into
`CONTRACTS.md`:

- **C6 · `users` table → v2** — adds `is_guest boolean not null default false`,
  mirrored from `auth.users.is_anonymous` by `handle_new_user`, added to the
  `trg_guard_user_cols` reverted set. Additive; readers may ignore it, but every
  public-aggregate reader **must** filter it exactly as it filters `is_demo`.
- **C7 · coupons → v2 note** — all four call sites gain a hard anon rejection
  before `loadCoupon`. Behaviour for permanent users is unchanged.
- **C9 · clarification quota → unchanged.** A guest is `free` = 7. Recorded here so
  the next brain does not "helpfully" add a guest tier and re-create the 2026-08-01
  P0.
- **C10 · Guest identity surface (NEW)** — proposed. Would state: guest = Supabase
  anonymous user; `is_anonymous` is the source of truth and `public.users.is_guest`
  is its mirror; guests get the daily pair only; anon sign-in is **client-side only**
  so `/` stays static; and any table reachable by `authenticated` must declare its
  anon stance explicitly.

## Rollback

Feature-flag the client entry point (`NEXT_PUBLIC_GUEST_MODE`). Disabling the flag
stops new anon sessions immediately without a deploy. Disabling the Supabase
dashboard toggle is the hard kill. `0045` is additive and safe to leave in place;
existing anon rows are collected by the 30-day cleanup job.

---
---

# ADDENDUM — review of the Antigravity implementation plan (2026-08-07)

Cowork brain reviewed the AGV plan against the tree at `ea93fe2`. **Four blockers
below must be resolved before Phase 1 starts.** Everything else in the AGV plan is
accepted as written.

### Verified correct in the AGV plan (do not "fix" these)

- `public.users.email` is `text not null` (0001 L18) and anonymous users carry a NULL
  email — so `handle_new_user` **must** `coalesce(new.email, '')` or every
  `signInAnonymously()` 500s on a not-null violation. AGV caught this; it was not in
  the original handoff. There is **no unique index on `users.email`**, so blank
  emails do not collide. Keep the coalesce, and add a comment that this is why
  guests render with an empty email column in `/admin/users`.
- Table names are right: `feedback_reports` (0011), `case_ratings` (0001 L83),
  `endorsements` (0019), `testimonials` (0012).
- `user.is_anonymous` **is** available on the middleware `getUser()` result —
  `@supabase/auth-js` `types.d.ts:382` (`is_anonymous?: boolean`) via
  `@supabase/supabase-js ^2.106.0`. No extra query needed. Correct.
- Reusing the `is_demo` session-lock exemption at `app/(app)/layout.tsx:118`. Correct.
- The `guard_user_privileged_cols` reverted-set line and `leaderboard_top()` where-clause
  match 0044 exactly. Correct.

---

## BLOCKER 1 — there is no FK from `public.users` to `auth.users`

AGV, Phase 1: *"delete from auth.users … Cascades to public.users via FK."*

**This is false.** `0001_baseline_schema.sql:16` declares `id uuid primary key` with
**no `references auth.users(id)`**. Grepped every migration: no FK is ever added.

Consequence: the 30-day `pg_cron` job deletes the `auth.users` row and leaves the
`public.users` row orphaned **forever**. Every downstream table (`case_attempts`,
`submissions`, `user_sessions`, …) cascades off `public.users`, not `auth.users`, so
none of that data is collected either. The cleanup job silently does almost nothing
while appearing to work — and it directly feeds Blocker 2.

**Fix — choose one, do not skip:**
- (a) Delete from `public.users` in the same job, before/with the auth delete; or
- (b) Add the missing FK in 0045: `alter table public.users add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade;` — **audit first**, the leaderboard seed rows (0026) insert into `auth.users` directly and must still satisfy it.

(b) is correct long-term but is a schema change with blast radius beyond this feature.
(a) is the safe call for this branch. Either way the job must be **verified by row
count**, not assumed.

## BLOCKER 2 — the `is_demo` exclusion pattern does not scale to guests

AGV, Phase 4: extend `getDemoUserIdsCached()` to `.or('is_demo.eq.true,is_guest.eq.true')`.

Read `lib/dashboard/demo-users.ts`: it does `select id from users where …` and
`notInList()` inlines **every returned UUID** into a PostgREST `not.in.(…)` filter.
That is fine for 2 demo accounts. Guests are an **unbounded** set — and per Blocker 1
they are never actually deleted.

At 5,000 guests that is a ~180 KB query string, built **four times per dashboard
render** (`leaderboards.ts:227`, `:267`, `activity-feed.ts:17`, `peer-proximity.ts:41`),
for **every real user**, on the hot path. This will produce 414s / statement blowups
and take the dashboard down. It is the single most dangerous line in the AGV plan.

**Fix:** guests must be excluded **in SQL**, never by materialising IDs in the app.
Filter on the joined `users` row (`.eq('users.is_guest', false)`) or push the
exclusion into `leaderboard_top()` / a dedicated view or RPC. `getDemoUserIdsCached()`
keeps handling `is_demo` **only** — leave that function alone.

## BLOCKER 3 — the client-side dashboard data endpoint does not exist

AGV, Phase 5: *"Fetches dashboard data via a client-side API call or SWR hook."*

That is one bullet standing in for the largest work item in the feature.
`DashboardClient`'s props are assembled in `app/(app)/dashboard/page.tsx` from
**twelve** server modules — `getHeatmap`, `getGrowthDeltas`, `getActivityFeed`,
`getCohortActivity`, `getPeerProximity`, `getProofRail`, `getSkillGraph`,
`getNodeOpenTargets`, `getTodayMeta`, `getDailyProgress`, `computeReadiness`,
`nextAction` — several of them using the **service-role** client for cross-user
aggregates that RLS deliberately forbids the cookie client from reading.

Two separate problems:
1. **Scope.** This is a new API surface, not a hook. It must be estimated as its own phase.
2. **Security.** Cohort benchmark, peer proximity and global rank are server-only *by design* (see the comment at `dashboard/page.tsx:52`). Exposing them through a client-callable route is a new data-exposure surface needing its own review — it is not covered by the Part 2 table.

**Fix:** make this **Phase 5a** with an explicit contract for what the endpoint
returns, and confirm no service-role aggregate reaches the client in raw form. If
that proves too large, the fallback is: `/` server-renders the *logged-out marketing
+ proof* page as today and mounts the live dashboard only after the guest session
exists (a client-side route swap), keeping the static `/` invariant intact.

## BLOCKER 4 — direct-landing cold start bounces guests to `/login`

Anon sign-in is client-side (correct, and required by the SEO invariant). Therefore
the **first server request from any new visitor carries no cookie**.

`lib/supabase/middleware.ts` then evaluates `!user && !isPublic && !isPreview` and
redirects to `/login`. This fires for anyone arriving **directly** at `/cases/<id>`:
a shared link, a new-tab open of "Start today's case", an organic search hit.
`app/(app)/cases/[id]/page.tsx:35` compounds it — the server component still branches
on `!user` and renders `GuestCasePreview`.

AGV lists `lib/constants.ts` as MODIFY in the file-change table but **never describes
the change**, and never touches `cases/[id]/page.tsx`. The guest solve flow has no
cold-start path.

**Fix:** keep `PREVIEW_ROUTES` / `isPreviewPath` (do not delete them — they are exactly
the cold-start allowance), and add an explicit client boundary that calls
`ensureGuestSession()` then `router.refresh()` so the server re-renders with the
session. Name `cases/[id]/page.tsx` in Phase 4.

---

## High-severity corrections

**H1 · Restrictive `for all` blocks SELECT, not just writes.**
`testimonials` and `endorsements` have public `select`-published policies (0012 L56,
0019 L39) and are rendered in the proof half of `/`. A restrictive
`for all using ((auth.jwt()->>'is_anonymous')::boolean is not true)` denies guests the
**read** as well, breaking the endorsement wall and testimonials for exactly the
audience this feature exists to serve. (Note: for `FOR ALL` with `USING` and no
`WITH CHECK`, Postgres reuses `USING` as the check — so inserts *are* blocked. The
policy blocks too much, not too little.)
**Fix:** scope to `for insert, update, delete` on all four content tables. Leave
`for all` only on `discount_coupons`, `coupon_redemptions`, `deck_submissions`.

**H2 · The webhook must not "skip the upgrade".**
AGV, Phase 6: *"log a warning and skip the upgrade."* That is money captured with no
Pro granted. Since `/order` and `/verify` already 403 guests, a guest-shaped webhook
is either a **race** (they converted between order and callback → **honour it**) or an
**attack** (alert via `telegram_notify`, do not silently drop). Silently skipping also
cuts against C7's stated idempotency reasoning, where `coupon_redemptions`'
`UNIQUE(razorpay_payment_id)` — not application logic — is what makes verify/webhook
safe to race.

**H3 · Double auth round-trip on the hot path.**
`is_guest_token()` calls `supabase.auth.get_user(token)` a second time, immediately
after `get_verified_user_id()` already did exactly that — a network hop added to
**every interview message**. Same shape in `access_guard._is_guest()`, which re-queries
`users` when `effective_tier()` already selected from `users` in the same function.
**Fix:** add `get_verified_user()` returning the user object and derive both from one
call; select `is_guest` alongside `subscription_tier` in `_effective_tier_from_row`.

**H4 · `pg_cron` is not known to be enabled.**
Grepped all 44 migrations: `cron.schedule` appears nowhere. The extension may not be
installed on the project. There is already a working cron path (`app/api/cron` +
`daily_scheduler.py`). **Verify with `list_extensions` before Phase 1; fall back to
the existing cron rather than adding a dependency.**

**H5 · Phase order is unsafe.**
Phase 1 enables the trigger and RLS while the onboarding-gate fix does not land until
Phase 3. On a branch DB with the toggle already on, that is a live window where any
guest sign-in infinite-redirects to `/onboarding` — the documented 503 failure mode.
**Fix:** land Phase 3's middleware fix with (or before) Phase 1.

---

## Medium

**M1 · Unspecified: what does a *logged-in* user see at `/`?**
The AGV plan never says. As written they get the static shell plus a client fetch —
slower than `/dashboard` is today, and two URLs rendering the same dashboard.
Recommendation: redirect `/` → `/dashboard` **for authenticated non-guest sessions
only**. This is safe for the SEO invariants because crawlers are never authenticated,
so the static `/` they receive is unchanged. Needs owner sign-off as it is a routing
decision.

**M2 · Guests now reach `createServiceClient()`** in `dashboard/page.tsx` once the
guest branch is deleted. Server-side that is fine, but `SUPABASE_SERVICE_ROLE_KEY`
must be present on the **preview** environment or the guest dashboard throws. Add to
the Phase 0 checklist.

**M3 · Turnstile has no phase.** It is required by Part 2 surface #3 but appears in
neither AGV's phases nor its file table. Add to Phase 0 alongside the toggles.

---
---

# ADDENDUM 2 — review of AGV plan **v2** (2026-08-07)

v2 correctly resolves B1, B2, B4, H1, H2, H3, H4, H5, M2, M3 and the `email`/
`is_anonymous` handling. **Accepted as written.** Four new findings below; the first
is data loss and the second replaces v2's B3/M1 approach entirely.

---

## NEW-BLOCKER 1 — a converted user is never un-flagged, then deleted

**Severity: data loss. Affects paying customers. Fix before anything else.**

`handle_new_user` is `AFTER INSERT ON auth.users` (0001 L202-205). It is the **only**
writer of `is_guest`. When a guest converts — `updateUser({email})` or
`linkIdentity()` — `auth.users.is_anonymous` flips to `false`, but that is an
**UPDATE**, and **no trigger listens for it**. `public.users.is_guest` stays `true`
forever.

Consequences for a converted, possibly paying user:
- permanently excluded from `leaderboard_top()` (v2 Phase 2 adds `is_guest` to its where-clause)
- permanently invisible in activity feed, proof rail, peer proximity (v2 Phase 4)
- and **v2's cleanup job deletes their account and all their work 30 days later**, because it keys on `public.users.is_guest = true`.

These are precisely the users the feature exists to create.

**Fix — all three parts:**
1. Add `AFTER UPDATE ON auth.users` trigger (security definer) syncing
   `is_guest := coalesce(new.is_anonymous, false)` **and** `email := coalesce(new.email, '')`
   — the email sync matters too, or converted users keep the blank email forever and
   never receive transactional mail.
2. `guard_user_privileged_cols` already reverts `is_guest` for non-service roles (v2
   Phase 2, correct) — the new trigger is `security definer`, so it is unaffected.
3. **Harden the cleanup job:** key both deletes off `auth.users.is_anonymous`, never
   off `public.users.is_guest`. The `public.users` delete becomes:
   ```sql
   delete from public.users u
   where exists (
     select 1 from auth.users a
     where a.id = u.id and a.is_anonymous is true
       and a.created_at < now() - interval '30 days'
   );
   ```
   Defence in depth: even if the sync trigger fails, a converted user is never collected.

**Phase 7 gate to add:** convert a guest → confirm `is_guest = false`, they appear on
the leaderboard, and the cleanup job does not select them.

## NEW-BLOCKER 2 — Googlebot executes JavaScript; v2's `/` redirect is not crawler-safe

v2 Phase 5 / M1: *"Authenticated non-guest users get `router.push('/dashboard')`
client-side. This is invisible to crawlers (they never have cookies)."*

The mechanism is backwards. Googlebot has **no cookies**, so it takes the *other*
branch: `ensureGuestSession()` fires. Result:

1. **Every crawl creates an anonymous `auth.users` row.** Googlebot, Bingbot, AhrefsBot, SemrushBot, GPTBot, on every pass. Direct DB pollution and direct cost — precisely what Turnstile was added to prevent, arriving through the front door.
2. **Google renders the DOM.** The rendered view of `/` is a client-side navigation to `/dashboard` — a URL that is not in the sitemap. The most valuable URL on the domain renders as a bounce. This breaks the owner's non-negotiable SEO constraint.

There are two independent defects here and both need fixing:

### Fix 2a — create the guest session on INTENT, never on page load

`ensureGuestSession()` must fire only from an explicit click: "Start today's case",
"Start the guesstimate", "Start practising →". Never from a `useEffect` on mount.

This is strictly better on four axes: crawlers never trigger it (SEO invariant fully
intact); no junk rows from any bot; Turnstile pressure drops to intentful users only;
and no visitor gets an invisible account created merely for reading a page.

### Fix 2b — replace the client redirect with a **middleware rewrite**

v2's `router.push('/dashboard')` has three further problems beyond the crawler issue:

- **Back-button trap.** `/dashboard` → Back → `/` → effect fires → pushed to `/dashboard`. The user cannot go back. (`router.replace()` fixes the trap but not the rest.)
- **Flash of wrong content.** Marketing renders, then jumps. On a slow Indian mobile connection that is a visible 1–3 s of the wrong page, and the shift is measured by CLS — hurting the Core Web Vitals the plan set out to protect.
- **It is not what was asked for.** The owner's requirement was *"the landing page should be the dashboard page only."* v2 delivers a marketing page that auto-forwards, with `/dashboard` in the address bar. That is the "keep `/` as marketing + a Try-it-now CTA" option the owner explicitly did **not** choose, with a redirect substituted for the button.

**Use a middleware rewrite instead.** `updateSession()` already resolves `user`:

```ts
// lib/supabase/middleware.ts — after `user` is resolved, before the onboarding gate
if (pathname === '/' && user) {
  return NextResponse.rewrite(new URL('/dashboard', request.url));
}
```

A rewrite serves `/dashboard`'s content **while the URL stays `mece.in/`**. This
collapses B3, M1, and both defects above:

| | outcome |
| --- | --- |
| URL | stays `/` — the owner's actual requirement |
| Crawlers (no cookie) | fall through to the static, ISR-cached `/`. SEO invariant intact |
| Logged-in users | dashboard at `/`, server-rendered, no flash, no back-trap |
| New API endpoint | **not needed** — B3 dissolves entirely |
| Extra latency | none; middleware already calls `getUser()` on `/` today |

Verify at the Phase 5 gate that the cookieless request still hits the ISR cache
(`x-vercel-cache: HIT` on a cold `curl` of `/`).

---

## NEW-HIGH 1 — `proof-rail.ts` filter is a silent no-op as specified

v2 Phase 4: *"Add guest exclusion: join to users and filter `.eq('users.is_guest', false)`."*

`proof-rail.ts:26` selects `'user_id, users(name)'` — a **non-inner** embed. PostgREST
only applies an embedded-column filter to parent rows when the embed is `!inner`. As
written the filter silently does nothing and guests keep appearing in "N started
today". Must become `users!inner(name, is_guest)`.

(`activity-feed.ts:23` already uses `users!inner(name)`, so v2's example there is
correct once `is_guest` is added to the select — which it is.)

## NEW-HIGH 2 — v2's phase reorder breaks Phase 1's own gate

Moving the middleware work to Phase 1 (correct, per H5) means
`app/(app)/layout.tsx` reads `userRow?.is_guest` in Phase 1 — but `is_guest` is not
added to the `UserRow` type until **Phase 4** (`lib/types.ts`). Phase 1's stated gate
is `tsc --noEmit` EXIT 0; it will fail on its own gate.

**Fix:** move the `lib/types.ts` change into Phase 1. (Runtime is harmless before the
Phase 2 migration — `undefined` makes the session lock still apply — but the type
error is real and blocks the phase.)

## NEW-MEDIUM 1 — the cleanup job's delete privileges

`cron.schedule` runs the job as its owner. Deleting from `auth.users` requires
`postgres` / `supabase_auth_admin`; a job created by a lesser role fails silently
every night. Add to the Phase 2 gate: run the job body once by hand and assert both
row counts dropped.

---
---

# IMPLEMENTATION RECORD — Cowork brain, 2026-08-07

Built on branch **`feat/guest-mode`** (both repos). AGV had already landed Phase 1,
the first draft of 0045, `lib/guest.ts` and the Phase 3 backend guards; this session
audited those, fixed what the reviews found, and completed Phases 4 and 6.

## Gates

| Gate | Result |
| --- | --- |
| `tsc --noEmit` (frontend) | **EXIT 0** |
| `python -m py_compile` (8 backend files) | **EXIT 0** |
| `npm run build` | **NOT RUN — see below** |

**`npm run build` could not be executed here.** The sandbox caps a single shell call
at ~3 minutes and background processes do not survive between calls; a 286-page
`next build` over the mounted filesystem takes >12. `tsc --noEmit` covers every type
error, but the **build gate is still owed** and must be run locally before merge —
specifically to confirm `/` still prints `○ (Static)` with `revalidate: 300` and not
`ƒ (Dynamic)`.

## What changed beyond the v2 plan

**1. NEW-BLOCKER 1 fixed (data loss).** 0045 §2b adds `handle_user_converted`, an
`AFTER UPDATE ON auth.users` trigger syncing `is_guest` **and** `email`. Without it a
converted — possibly paying — user stayed `is_guest = true` forever and was deleted
by the 30-day job. The job was also rewritten as
`public.cleanup_stale_guests(interval)`, keyed off `auth.users.is_anonymous` for
**both** deletes, so a failed trigger can never cause a deletion. `cron.schedule` is
wrapped in an exception handler (M-OLD) and falls back to `app/api/cron`.

**2. NEW-BLOCKER 2 fixed (crawler safety).** The anonymous session is minted in
exactly ONE place — `components/guest/guest-start-button.tsx`, inside an `onClick`.
Never a mount effect. Googlebot renders JS and carries no cookie, so a mount effect
would have minted a row on every crawl by every bot and made the indexed DOM a
post-sign-in view. Verified: `signInAnonymously` appears only in `lib/guest.ts`, and
`ensureGuestSession` has exactly one caller.

**3. `router.push` replaced with a middleware rewrite.** `lib/supabase/middleware.ts`
now rewrites `/` → `/dashboard` when a session exists. URL stays `mece.in/`; crawlers
have no cookie so they still get the static ISR `/`. This removes the back-button
trap, the content flash and the need for a client dashboard API (B3 dissolves).
Two things the naive version gets wrong and this one handles:
  - **auth cookies are copied onto the rewrite response.** `NextResponse.rewrite()`
    starts a fresh response; not copying `supabaseResponse.cookies` drops the rotated
    refresh token, which logs users out at random.
  - **`/` opts into the onboarding gate** via `isRootWithUser`. `/` is in
    `PUBLIC_ROUTES` and would otherwise skip it, showing a half-onboarded user a
    dashboard instead of `/onboarding`.

**4. NEW-HIGH 1 fixed.** `proof-rail.ts` embed changed to `users!inner(name, is_guest)`.
As a plain embed the filter was a silent no-op.

**5. RLS coverage gap found in our own list.** Auditing every `for insert` policy in
the migration set against 0045 turned up **`resumes`, `cheat_sheets`,
`cheat_sheet_items`** — all accept writes from any `authenticated` role and none were
in the plan. Added (guarded by `to_regclass`, so still idempotent). The FastAPI 403s
are not a substitute: a guest can talk to PostgREST directly with their own JWT and
never touch the backend.

**6. Deploy-order safety in the backend.** `effective_tier_and_guest()` selects
`is_guest`, which does not exist until 0045 runs — and it sits under
`assert_can_attempt`. A backend deployed minutes before the migration would have
meant *nobody can start a case*. It now falls back to the pre-0045 select on a
missing-column error only, and re-raises everything else.

## Deploy order — not negotiable

1. **Run 0045 in Supabase** (after 0041–0044).
2. Deploy backend and frontend.
3. Only then set `NEXT_PUBLIC_GUEST_MODE=true`, and only on the preview.

The frontend leaderboard queries use `.eq('is_guest', false)`, which — unlike
`getDemoUserIdsCached()` — **cannot fail open**. Ship them before the migration and
the leaderboard blanks.

## Deliberately NOT built

**Phase 5 (the `/` ÷ `/explore-mece` content split).** It is the highest-SEO-risk
change in the feature and it depends on a copy split the owner has been asked for
three times and has not given. Shipping it unreviewed alongside a security change
would put both at risk in one deploy. Guest mode is complete and shippable without
it: the middleware rewrite already makes `/` the dashboard for anyone with a session,
and logged-out `/` is untouched. `/explore-mece` should be its own branch.

Also outstanding, all owner-side: Turnstile key, Supabase branch + Render preview,
`pg_cron` availability check, and the C6 v2 / C7 v2 / C10 contract writes.

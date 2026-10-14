# ANTIGRAVITY HANDOFF — admin-login (separate sign-in for Admin + CRM)

**Author:** Claude brain (cloud session), 2026-10-14. **Feature:** NEW — `admin-login`.
**Repo:** frontend `consilio` only (backend untouched). **Branch:** `feat/admin-login` (one commit, on top of `feat/crm-admin-merge`).
**Why (owner):** "an admin login page instead of logging in via account — a separate admin login, so even if I am
not the user I can open admin by email and password, and set it different from the user."
**Type:** new page + middleware routing + an owner SQL step. No migration, no new dependency, no env var.

```
touches:  frontend  NEW  app/admin/login/{page.tsx,admin-login-form.tsx,switch-account.tsx,actions.ts}
                         (the staff sign-in page; OUTSIDE the (app) group: no learner chrome, no admin-layout loop)
                    NEW  lib/staff-paths.ts     (ADMIN_LOGIN_PATH, isStaffPath, staffDestination — edge-safe, pure)
                    NEW  lib/staff-access.ts    (staffKind(userId): 'admin' | 'crm' | null — service role, fails closed)
                    NEW  components/admin/{admin-account,change-password}.tsx (rail footer: who is signed in,
                         change password, sign out of admin)
                    NEW  supabase/create-admin-login.sql (owner runs once; marks a dashboard-created account admin)
                    NEW  scripts/crm-tests/staff-paths.test.ts (+ registered in run.ts → 82 unit tests)
                    MOD  lib/supabase/middleware.ts  (logged-out /admin*, /crm* → /admin/login?next=…; the onboarding
                         gate treats an is_admin account as onboarded ON STAFF PATHS ONLY; selects is_admin too)
                    MOD  lib/constants.ts            (PUBLIC_ROUTES += '/admin/login' — that one page only)
                    MOD  app/(app)/admin/layout.tsx  (no user → /admin/login; signed-in non-admin → /admin/login?next=…
                         instead of /dashboard; renders the rail footer)
breaking: no. C4 (routes) ADDITIVE: new public page /admin/login (PUBLIC_ROUTES, the /verify precedent; matcher
          untouched; robots.ts already disallows /admin). No API added or changed.
          C6 (users): no schema change. Middleware now also READS users.is_admin (own row, RLS) in the
          onboarding gate. The SQL WRITES is_admin + onboarding_completed_at for ONE named account.
affects:  Admin, CRM sign-in (logged-out visitors to /admin or /crm now see /admin/login instead of /login).
          Learners: nothing changes (/login, onboarding, everything else identical).
```

## How it works
- **A dedicated admin account** is a normal Supabase Auth user with `users.is_admin = true`. A separate password
  store was rejected on purpose: five admin pages (AI providers, Agentic AI, Prep Copilot, Growth, Status) call
  the backend with the user's Supabase JWT and the backend checks `is_admin`; anything that isn't a real
  Supabase admin session would break them, and the backend is out of scope.
- **/admin/login**: email + password, signed in **from the browser** (Supabase sees the visitor's IP for its
  sign-in rate limit; Turnstile CAPTCHA identical to /login). Then the server action `finishStaffSignIn`
  checks staff = `is_admin` OR active `crm_users` row (the same two facts the admin layout and CRM context gate
  on — no new kind of access). Not staff → that session is revoked (`scope: 'local'`) and the browser cleared.
- **A browser already signed in** (learner or guest) gets "Sign out and continue" instead of the form: signing in
  over a live session would orphan its single-device slot (next /login → bogus /session-conflict) and move a
  guest's practice onto the admin account. The learner path calls `/api/session/end` first, like the normal
  sign-out. The form also re-checks right before submitting.
- **Where you land**: `next` is honoured only for staff pages that account may open (admins: /admin*, /crm*;
  CRM members: /crm*), the path must already be in normal form (no `.`/`..` segments, `//`, encoded `/` `.` `\`),
  never /admin/login itself; otherwise /admin (admins) or /crm (CRM members). Never off-site.
- **Password changes** happen in Supabase Auth only (Admin rail → "Change password" → `updateUser`, then every
  OTHER session of the account is signed out). The SQL never sees a password, so none sits in query history,
  `pg_stat_statements` or logs.
- **Sign out of admin** = this browser only (`scope: 'local'`); on a network failure it says so instead of
  bouncing straight back into the console.

## Owner steps (in order)
1. Merge + deploy (Vercel). Nothing changes for anyone until step 2 except the sign-in page for /admin and /crm.
2. Supabase → Authentication → Users → **Add user → Create new user**: a NEW email (not your learner email), a
   strong password, tick **Auto Confirm User**.
3. Supabase → SQL Editor: paste `supabase/create-admin-login.sql`, set `v_email` to that address, Run. It refuses
   unknown emails, guests and learner accounts (onboarded or has solved anything) unless `v_promote_learner`.
4. Sign in at **https://mece.in/admin/login**.
5. Optional: un-comment the last block of the SQL file to take admin off your personal account, so /admin opens
   only through the admin login.

## Gates (2026-10-14, cloud session)
tsc --noEmit clean · next build clean · unit `npm run test:crm` 82/82 (2 new: staff paths, 60+ `next` cases) ·
SQL on a GoTrue-shaped scratch DB: no-account / guest / onboarded learner / learner with submissions refused and
unchanged; fresh account promoted; idempotent re-run; guard trigger path both via JWT claim and via the
transaction-local disable; non-owner role → "did not stick", fully rolled back, trigger left enabled; optional
demotion block (refuses same account / unknown email / no admin yet) · p6 browser + HTTP suite (logged-out
routing, look-alike paths, 25 `next` cases × admin/CRM member, learner/guest/deactivated member panels, direct
server-action calls incl. revocation scope, wrong password, rate limit, unconfirmed, learner credentials refused
and revoked, "session appeared meanwhile", staff check aborted mid-flight, CRM deep link, sign-out, change
password incl. old password refused after rotation, mobile width) · regression p1–p5 (CRM) all green.
An independent review agent audited the change; its findings (orphaned session when signing in over a live
one, password in SQL text, learner protection, `next` normalisation, CRM named on the public page, unchecked
session on a failed check) are all fixed above.

## Rollback
Revert the commit. The admin account stays a normal admin user (works through /login as before); to remove it,
delete it in Supabase → Authentication → Users.

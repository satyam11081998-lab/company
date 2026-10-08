# ANTIGRAVITY HANDOFF — crm (MECE CRM: a Zoho-class CRM inside mece.in)

**Author:** Claude brain (cloud session), 2026-10-08. **Feature:** NEW — `crm`.
**Repo:** frontend `consilio` only (backend untouched). **Branch:** `feat/crm` (four commits, one per phase).
**Why:** IMI Delhi MK615 (CRM) CEC-3 project — run MECE's own customer relationships on a real CRM:
segmentation, CLV and profitability, tech-stack fit, live CRM configuration, recommendations. The CRM
lives at `/crm`, is invisible to everyone who is not a CRM user, and reads MECE's real (unmasked) data.
**Type:** new feature + 4 migrations + 1 cron. No new dependency (recharts was already installed).

```
touches:  frontend  NEW  supabase/migrations/0071_crm_core.sql            (metadata, records, audit, sync RPCs)
                    NEW  supabase/migrations/0072_crm_marketing_service.sql (outbox, tracking, forms, surveys)
                    NEW  supabase/migrations/0073_crm_automation.sql       (jobs, cadences, approvals, webhooks)
                    NEW  supabase/migrations/0074_crm_analytics_ai_privacy.sql (consent, rights, breaches,
                         blocklist, AI models/feedback, API keys/usage, cohort + daily-metric functions)
                    NEW  lib/crm/**            (pure engine: modules, fields, criteria, formula, permissions,
                         automation, analytics, ml, reports, nlq, privacy, rfm, sla, surveys, templates …)
                    NEW  lib/crm/server/**     (service-role data layer; every function takes a CrmContext)
                    NEW  app/(app)/crm/**      (pages + server actions)
                    NEW  components/crm/**     (UI)
                    NEW  app/api/crm/{forms,survey,t,unsub,backup,v1}/** , app/api/cron/crm/route.ts
                    NEW  app/f/[key], app/survey/[token]   (public web form + survey answer pages)
                    NEW  scripts/crm-tests/**  (80 unit tests: `npm run test:crm`)
                    NEW  docs/crm/DESIGN.md
                    MOD  lib/constants.ts      (PUBLIC_ROUTES += '/f', '/survey')
                    MOD  app/robots.ts         (disallow /crm, /f/, /survey/)
                    MOD  vercel.json           (cron 0 1 * * * → /api/cron/crm)
                    MOD  lib/revenue.ts        (export PLACEHOLDER_EMAIL_RE — was module-private; no logic change)
                    MOD  components/admin/admin-nav.tsx (a "CRM" link for admins)
                    MOD  package.json          (script test:crm)
breaking: no. C4 (routes) is ADDITIVE: new Next APIs /api/crm/* (forms, survey, t, unsub, backup, v1 REST),
          /api/cron/crm, public pages /f/<key> and /survey/<token> (PUBLIC_ROUTES, middleware untouched).
          C6 (users): no schema change. The CRM READS users/payments/attempts/submissions/feedback_reports and
          WRITES only users.marketing_opt_out=true when someone clicks a CRM email's unsubscribe link
          (same meaning as the existing unsubscribe). C1 (cases): untouched.
affects:  Admin (one nav link). Nothing student-facing changes.
```

## Security model (read before touching anything)
- Every `crm_*` table: RLS on, **no policies, no anon/authenticated grants**; functions granted to
  `service_role` only. All access is server-side through `lib/crm/server/*`, which takes the caller's
  `CrmContext` (profile → module perms + setup perms + field security; role hierarchy; sharing rules;
  territories; manual shares) and checks it on every read and write. `crm_audit` is append-only
  (trigger; UPDATE may only redact).
- Not a CRM user (not admin, not an active `crm_users` row) → the whole `/crm` tree is a 404, and every
  server action returns "Not found". Admins (`users.is_admin`) are CRM super-admins.
- Customer email: **approve-before-send Outbox**. Consent, opt-out, privacy restriction and erasure are
  re-checked at the moment of sending; daily cap; signed open/click/unsubscribe tokens
  (`CRM_TRACKING_SECRET` || `UNSUBSCRIBE_SECRET` || service key — never a hard-coded fallback).
- Webhooks: https/443 only; private, loopback and metadata IPs refused at connect time (custom DNS
  lookup), 60/min, signed body.
- REST API keys: only SHA-256 stored; key acts as its CRM user (same permissions) ∩ scopes
  (read/write/delete); 100 calls/min; expiry ≤ 730 days; revocable; audited.

## What ships (by phase)
1. **Core** — the standard modules (leads, contacts, accounts, deals, tasks, calls, meetings, cases,
   solutions, campaigns, products, price books, quotes, sales orders, invoices, vendors, purchase
   orders) + custom modules/fields (formula, roll-up, lookup, picklists),
   list views, kanban, import (dedupe, undo), export, merge, convert lead, quotes → orders → invoices,
   notes, attachments (private bucket), recycle bin, audit log, roles/profiles/sharing, field security,
   global search. **MECE sync** (daily + "Sync now"): users → Contacts, colleges → Accounts, payments →
   Deals + Invoices, expiring plans → Renewal deals, feedback reports → Cases; revenue follows
   `lib/revenue.ts` exactly.
2. **Marketing + service** — email templates, segments (criteria + RFM), campaigns, web-to-lead /
   web-to-case forms (honeypot, signed render time, per-IP hash limits, consent text), NPS/CSAT/CES
   surveys, cases with SLAs + business hours + escalation, knowledge base.
3. **Automation** — workflow rules (instant + scheduled, loop guard), Blueprints, multi-stage approvals,
   round-robin assignment, scoring, validation and layout rules, macros, cadences, webhooks.
4. **Analytics, Iris, privacy, developer** —
   - *Customer analytics (MK615):* CLV simple / Gupta–Lehmann / finite discounted, retention and margin
     estimated from real renewals, customer equity, CLV:CAC, payback, CAC by channel, CLV by plan /
     channel / market / RFM, whale curve, profit deciles, Reinartz–Kumar quadrants, Gini/HHI/Lorenz,
     lifecycle funnel, monthly cohorts, NPS/CSAT/CES. Assumptions editable (validated).
   - *Reports* (tabular / summary / matrix, charts, CSV export needs module export permission),
     *dashboards* (KPI with period comparison, target meters, report charts), *forecasts* (per owner,
     targets, commit / best case / weighted pipeline). Six default reports + "MECE overview" seeded.
   - **Iris** — the CRM's AI assistant (named Iris at the owner's request): Ask Iris (natural-language
     → a constrained, permission-checked query; never SQL), churn and lead-conversion models
     (logistic regression trained in-app, 30% deterministic holdout, used only if AUC ≥ 0.6 with ≥ 30
     examples per class), custom prediction builder, health score, deal health, next best action
     (blocked without marketing consent / under restriction), anomaly alerts, best time to email, email
     drafts (the person's name never leaves MECE — the draft uses the {{first_name}} merge tag; only
     plan and usage counts go to the optional language model, nothing for people who opted out of
     profiling, and no drafts at all under a privacy restriction; a template otherwise). Questions
     Ask Iris can't parse on its own are sent (text only, with the field list) to the same model. Every score shows its reasons; people agree / disagree / override with a reason
     (audited). Insights are hidden from anyone who can't see a field they are computed from.
   - *Privacy (DPDP Act 2023):* consent ledger per purpose, rights requests (access export, correction
     task, erasure, restriction, consent withdrawal, grievance, nomination) with due dates, erasure
     (personal fields blanked on the person and every related record, financial facts kept, notes /
     attachments / email contents deleted, audit redacted, email hash blocklisted so sync/import can't
     bring them back), breach register with the 72-hour clock, compliance overview, daily reminders.
   - *Territories* (criteria-based access with hierarchy), *REST API v1* (`/api/crm/v1`), *backup
     download* (JSON, secrets removed, audited).

## Owner steps (in order)
1. **Supabase SQL editor:** run `0071` → `0072` → `0073` → `0074` (each is idempotent; re-running is safe).
2. **Vercel env (optional):** `CRM_TRACKING_SECRET` (any long random string; otherwise the unsubscribe
   secret is used). `OPENAI_API_KEY` is already set → Iris drafts use it; `CRM_LLM_MODEL` optional.
   `TURNSTILE_SECRET_KEY` optional (web-form CAPTCHA). Nothing else.
3. Deploy, open `/crm` as an admin → metadata seeds itself → **Setup → MECE sync → Sync now**.
4. Add CRM users in **Setup → Users** (they must already have a MECE account).

## Gates (all passed in the cloud session, 2026-10-08)
- `npx tsc --noEmit` clean · `next build` clean (font-fetch warnings are the sandbox's, not the code's).
- `npm run test:crm` → 80/80 unit tests (engine, automation, analytics formulas, ML, reports, Ask Iris,
  privacy).
- End-to-end + adversarial suites against Postgres 16 + PostgREST + a fake Supabase gateway, from a
  clean reset: p1 core 80/80, p2 marketing/service 135/135, p3 automation 120/120, p4 analytics/Iris/
  privacy/API/territories/backup 212/212. Includes: outsider/guest/customer get 404 everywhere;
  rep vs admin permission splits; hidden fields never leak through reports, Ask Iris, insights or the
  API; erasure survives the daily sync and imports; API keys hashed, scoped, rate-limited, revocable.
- SQL idempotency: all four migrations applied twice on the same database without error.

## Rollback
Remove the cron entry and the `/crm` nav link (or revert the branch). The `crm_*` tables are isolated;
dropping them affects nothing else. Never drop `crm_audit` without exporting it first.

---

## Follow-up 2026-10-09 — admin ↔ CRM, loading feedback, logo (branch `feat/crm-admin-merge`)

Owner's call: **admin stays** (it runs the product), but the two screens that duplicated the CRM move
into it, data is synced both ways, and a dead page goes. Plus: the CRM must never feel frozen, and it
uses the real MECE logo.

```
touches:  frontend  MOD  app/(app)/admin/feedback/page.tsx   (now redirects → /crm/m/cases?view=feedback)
                    DEL  app/(app)/admin/feedback/{actions.ts,feedback-admin-client.tsx}
                    MOD  app/(app)/admin/users/page.tsx      (now redirects → /crm/m/contacts)
                    DEL  app/(app)/admin/users/{actions.ts,types.ts,users-admin-client.tsx}
                    DEL  app/(app)/admin/deck-vault/{page.tsx,deck-vault-admin-client.tsx}  (dead: redirected
                         to /admin since the Deck Rewards programme was disconnected)
                    KEPT app/(app)/admin/deck-vault/actions.ts + app/api/admin/deck-vault/file (listed in C7/C8)
                    MOD  components/admin/admin-nav.tsx      (Users → CRM, Feedback → CRM)
                    MOD  app/(app)/admin/coupons/page.tsx    (comment only)
                    MOD  lib/feedback.ts                     (unused listFeedback removed; labels unchanged)
                    MOD  components/home/wordmark.tsx        (additive prop taglineFrom="never")
                    NEW  lib/crm/server/account.ts, app/(app)/crm/account-actions.ts,
                         components/crm/{account-panel,admin-pulse,nav-progress,skeletons}.tsx,
                         app/(app)/crm/{loading,template}.tsx + loading.tsx for list / record / new / import
                    MOD  lib/crm/server/{sync,records,privacy,jobs}.ts, lib/crm/views.ts, components/crm/{ui,crm-shell}.tsx,
                         app/(app)/crm/page.tsx, app/(app)/crm/m/[module]/{page,[id]/page}.tsx
breaking: no. C4: /admin/users and /admin/feedback still answer (they forward to the CRM); no API changed.
          C6 (users): no schema change. The CRM now WRITES, MECE admins only, the same columns the old admin
          Users screen wrote (is_demo, market; user_sessions.revoked_at), and users.marketing_opt_out=true when
          marketing consent is withdrawn in the CRM, when a person is erased, or while processing is
          restricted (restored to its previous value when the restriction lifts; never switched back on
          otherwise). C7/C8: the deck-vault review actions and file API are untouched.
affects:  Admin (two screens now live in the CRM). Nothing student-facing changes.
```

**Feedback → CRM Cases.** New in-app reports become cases within minutes (CRM tick + whenever the Cases
list opens), view "In-app feedback & flags". A case's status and internal comments are written back to
`feedback_reports` (New→new, Open→triaged, In progress/Waiting/Escalated→in_progress, Resolved→resolved,
Closed→resolved if it was Resolved just before, else dismissed). Notes written in the old screen move onto
the case once. The daily sync never overwrites CRM triage.

**Users → CRM Contacts.** New sign-ups become contacts within minutes (facts follow with the daily sync);
view "New sign-ups (7 days)". MECE admins get a "MECE account" panel on the contact (plan, college email,
goals, sessions and devices, coupons, recent submissions; demo flag, market, sign out everywhere — each
copied onto the contact at once and audited) and "Revenue received" + sign-ups on CRM home.

**Loading feedback.** A thin progress bar runs while the CRM waits on the server (navigations, refreshes,
every server action, and link clicks while Next fetches the page shell); the clicked menu item shows a
spinner; every page has a skeleton; buttons with async work show a spinner and block double clicks; pages
ease in. All of it is off for prefers-reduced-motion.

**Logo.** The CRM header uses the site's own `Wordmark` (brand mark + MECE) with a "CRM" tag.

Gates (2026-10-09, from a clean reset): tsc clean · next build clean · unit 80/80 · p1 80/80 · p2 135/135 ·
p3 120/120 · p4 212/212 · p5 (this follow-up: redirects, live report/sign-up sync, two-way case status,
account tools and their permissions, consent → app opt-out, loading bar/skeleton/spinners, logo) 49/49.

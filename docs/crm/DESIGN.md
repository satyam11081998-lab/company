# MECE CRM — design

A Zoho-CRM-style system built into MECE. It runs on MECE's real customers
(users, colleges, payments, attempts, feedback) and lives at **`/crm`**.

Only two kinds of people can open it:
- MECE admins (`users.is_admin`), who are always CRM Administrators.
- Team members an admin adds under **Setup → Users**, each with a role (who
  reports to whom) and a profile (what they may do).

Everyone else gets a 404, from the layout and again from every server action.

## 1. Architecture

```
browser ──► /crm pages (server components) ──► lib/crm/server/* ──► Supabase (service role)
        └─► server actions ('use server') ──┘        │
public  ──► /f/<key>  /survey/<token>  /api/crm/t/*  /api/crm/v1/*  /api/cron/crm
```

- **Metadata-driven, like Zoho.** A module is a row in `crm_modules`. Its
  fields are rows in `crm_fields`. Every record of every module is one row in
  `crm_records`, and its field values live in `data jsonb`. The standard modules
  are seeded from `lib/crm/modules.ts`. Custom modules and custom fields are
  just more rows, so they need no DDL at runtime.
- **One gate.** Every server action calls `requireCrm()`. It resolves the
  signed-in user to a CRM context (profile permissions, role subtree,
  territories), then checks module and field permissions before it reads or
  writes. The CRM tables have RLS **on with no policies**, so the browser can
  never read them directly. Only the service role can, and only after that check.
- **Pure core, thin I/O.** Criteria, formulas, field coercion, permissions,
  automation decisions, analytics and the statistical models are pure
  TypeScript in `lib/crm/*`, with unit tests. Database access is in
  `lib/crm/server/*`.
- **MECE is the source of truth for MECE facts.** Sync copies users →
  Contacts, colleges → Accounts, and payments, deck purchases, vault access
  and voice-minute packs → Deals and Invoices. It also copies support reports →
  Cases. Synced fields are read-only in the CRM. CRM-owned fields (owner, tags,
  lifecycle, notes, custom fields) are never overwritten. Sync merges with
  `data || patch` in one SQL statement (`crm_sync_upsert`), so a CRM edit made
  during a sync is not lost.

## 2. Modules (Zoho → MECE)

| Zoho | MECE meaning | Source |
|---|---|---|
| Leads | Prospects who are not MECE users yet: campus/B2B inquiries, web-form sign-ups, imports | web forms, import, manual |
| Contacts | Every registered MECE user, plus B2B people (placement officers, club heads) | sync (`users`) + manual |
| Accounts | Colleges (B2B key accounts) and companies | sync (`colleges`) + manual |
| Deals | B2C: every paid order and every abandoned checkout. B2B: campus licences. Renewals | sync (payments …) + manual |
| Tasks / Calls / Meetings | Activities, with reminders and call logging | manual, automation |
| Products / Price Books | Lite, Pro (periods), deck, vault, voice packs; INR / USD / EUR / campus price books | seeded |
| Quotes → Sales Orders → Invoices | B2B line-item documents. B2C invoices come from verified Razorpay payments | manual / sync |
| Vendors / Purchase Orders | OpenAI, Google, Render, Vercel, Supabase …; costs feed customer profitability (ABC) | manual |
| Cases / Solutions | Support tickets (from `feedback_reports` and web-to-case); knowledge base | sync + web form + manual |
| Campaigns | Broadcasts and acquisition campaigns, with members, cost and ROI | manual |

## 3. Invariants (each one is tested)

1. No CRM data reaches a non-CRM user: not through a page, an action, an
   export, a report, search, the timeline or the API.
2. Hidden fields are stripped and read-only fields are refused on every path.
3. Records outside a user's sharing scope are invisible, including inside
   report totals.
4. Nothing is emailed to a customer without an admin approving it in the
   **Outbox**, and approval re-checks opt-out, consent and the erasure
   blocklist at send time.
5. Money matches `lib/revenue.ts`: only Razorpay-verified rows count, internal
   accounts are excluded, and INR is never mixed with USD/EUR without a rate.
6. Automation can't loop. A rule re-triggers itself at most twice, and a chain
   stops at depth 3.
7. The audit log is append-only. A database trigger refuses UPDATE and DELETE,
   except the redaction an erasure request needs.
8. Every AI score shows its factors and can be overridden. Nothing AI-generated
   reaches a customer without passing the consent gate and the Outbox.

## 4. Phases

1. **Sales:** records engine, standard modules, pipelines + Kanban, activities,
   notes, attachments, 360° timeline, views, tags, search, mass actions,
   import/export, duplicate check + merge, lead conversion, line items and
   quote/order/invoice conversion, recycle bin, audit, users/roles/profiles,
   sharing.
2. **Marketing + Service:** email templates, Outbox (approve before send),
   tracking, campaigns, segments (criteria + RFM), web forms, cases + SLAs +
   escalation, knowledge base, NPS/CSAT/CES surveys.
3. **Automation:** workflow rules, scheduled actions, blueprints, approvals,
   assignment (round robin), scoring rules, validation and layout rules,
   macros, cadences, webhooks.
4. **Analytics, AI, governance:** reports, dashboards, forecasts and
   territories. Course analytics: CLV (simple + discounted), customer equity,
   CAC, RFM, cohorts, ABC profitability and concentration. Iris (MECE's own
   AI assistant) models:
   conversion, churn, health, deal health, prediction builder, next best
   action, anomaly detection, best time to contact. Also Ask-CRM, DPDP Act 2023
   consent + rights + breach register, API keys + REST API, and data backup.

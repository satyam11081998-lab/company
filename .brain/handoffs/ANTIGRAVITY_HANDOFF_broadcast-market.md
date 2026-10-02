# ANTIGRAVITY HANDOFF — broadcast-market (India vs US & Europe audience)

**Author:** Claude brain (cloud session), 2026-10-02. **Feature:** NEW — `broadcast-market`
(extends `broadcast-targeted-practice`, 2026-09-16, and builds on `us-launch` markets, 0070).
**Repos:** frontend `consilio` + backend `consilio-backend`. Committed straight to `main` in each by
`apply-broadcast-market.ps1` at the owner's request (same delivery as the US redesign).
**Type:** behaviour + UI. No migration, no env var, no new dependency.

```
touches:  backend   MOD  routes/broadcast.py (optional `market` on both bodies; response echoes it)
                    MOD  services/broadcast_gen.py (normalize_market, US register prompts, US case-type set,
                         save_option stamps cases.market='US'; India prompt/row byte-identical)
                    NEW  tests/test_broadcast_market.py (34 checks, stdlib only)
          frontend  NEW  lib/broadcast-audience.ts (pure: Audience, inAudience, audienceProblem, parse*)
                    NEW  scripts/test-broadcast-audience.mjs (20 checks)
                    MOD  app/(app)/admin/email-actions.ts (audience filter on users.market, per-market
                         digest, market on generate/materialize, link-market guard on send + send-to-one,
                         per-recipient footer line)
                    MOD  app/(app)/admin/broadcast-composer.tsx (Audience: India | US & Europe | Both;
                         market-aware digest, targeted practice, card copy, mismatch banner)
                    MOD  lib/email/templates.ts (optional footer `tagline`; India default unchanged;
                         US welcome email now says "Case interview prep for consulting, finance and
                         strategy recruiting" instead of "...for Indian MBA students")
breaking: no. C4 (API) gains one OPTIONAL request field `market` on /broadcast/generate-options and
          /broadcast/materialize (default "IN" = previous behaviour) and one additive response key
          `market`. C1 (cases): no schema change — writes the existing cases.market column (0070).
affects:  Daily content + admin (broadcast composer only). India broadcast output: unchanged
          (prompt pinned by test; email HTML compared byte-for-byte).
```

## Why
Broadcast practice is market-specific in two ways:
1. **Content.** The generator only wrote India material (Rs/crore, Indian firms) and saved it as an
   India case. Irrelevant to US recruiting.
2. **Access.** A case belongs to one bank (`cases.market`) and `services/markets.assert_market_access`
   refuses the other market's accounts (403 "This case isn't available in your region"). So until now,
   a broadcast to "All users" sent US & Europe accounts links they could not open — and the daily
   digest always carried the India pair (IST `daily_schedule`) plus India GD news.

## What ships
**Audience** control in Admin → Broadcast: **India** (default) | **US & Europe** | **Both**.
- Recipients filter on `users.market` via `contentMarketOf` (NULL → India, EU → US & Europe: Europe
  practises the US bank). "Count recipients" shows the market split when Both is chosen.
- **Generate today's digest** is per market. India: the original digest, unchanged. US & Europe:
  `market_daily_schedule` on the US Eastern day (most recent on/before today, the US dashboard's own
  rule), US copy ("market sizing"), no GD block, US footer line. Disabled for Both.
- **Targeted practice** generates for the selected market. US: US dollars, US companies, American
  English, the US bank's nine case types; saved with `cases.market='US'`, so US & Europe recipients can
  open it and the interviewer/scorer switch to the US register automatically (`llm_case_content`).
  Each option and card carries its market; options are cleared when the audience changes. Disabled for
  Both.
- **Guard, twice.** The composer computes the market of the email's practice links (cards + built
  digest/practice email). If it does not match the audience it shows a banner and disables Send; the
  server action refuses the same send (`audienceProblem`). One-person sends are refused when the
  person's account is in the other market. Plain announcements (no practice links) can go to Both.
- **Footer line per market.** Simple heading+body broadcasts render each recipient's own footer line;
  built US emails carry the US line; India output keeps the original line byte-for-byte.

Backend contract: `market` "IN" | "US" ("EU" read as "US"; anything else → 422). Materialize with an
option generated for the other market → 422 ("This option was written for … users"). Old frontends
that send no `market` get exactly the previous behaviour. A frontend deployed before this backend
refuses US generation with "deploy the backend first" (it checks the echoed `market`), India unaffected.

## Gates (run in the cloud sandbox on origin/main as of ff60903 / 45c982d)
- backend: `py_compile` all tracked modules EXIT 0; `python -m tests.test_broadcast_market` 34/34
  (India system+user prompt equal to a golden copy of the pre-change strings; India insert row has no
  `market` key and the same content); `tests.test_markets` 48/48 unchanged.
- frontend: `npx tsc --noEmit` clean; `node scripts/test-broadcast-audience.mjs` 20/20;
  `node scripts/test-intl.mjs` 51/51; `next build` clean.
- India email HTML: `baseEmailLayout`, `broadcastEmail`, `practiceCard`, India `welcomeEmail`
  byte-identical to before.
- End-to-end in a browser against the REAL broadcast router (stubbed model + Supabase + Resend):
  counts India 2 / US & Europe 2 / Both 4 (opted-out excluded, NULL market counted as India); US
  option → card → switching to India or Both shows the banner and disables Send; built US email sent
  to exactly the US + EU accounts with a mece.in/p/<code> link and per-recipient unsubscribe; India
  digest sent to exactly the India accounts; US digest has the US pair and no GD block; one-person send
  of US practice to an India account refused, to a Europe account sent; saved row `market='US'`,
  `type='market entry'`, unlisted.

## Deploy order
Either order is safe. Backend first means US targeted practice works the moment the frontend lands.

## Proposed LEDGER row
| **Broadcast market audience** | Claude (cloud) | main | **BUILT 2026-10-02** | `lib/broadcast-audience.ts`, `app/(app)/admin/{email-actions.ts,broadcast-composer.tsx}`; backend `routes/broadcast.py`, `services/broadcast_gen.py` | broadcast-targeted-practice, us-launch (0070 `users.market` / `cases.market` / `market_daily_schedule`), C4 |

## Proposed CHANGELOG line
`2026-10-02 · broadcast-market · frontend + backend · non-breaking — Admin broadcast gets an India / US & Europe / Both audience; per-market digest and targeted practice (US register, saved as US cases); sends refused when practice links don't match the audience. touches: see handoff. affects: Daily content + admin.`

---

## Addendum 2026-10-03 — digest links to real practice, one button per market

```
touches:  frontend  MOD  app/(app)/admin/email-actions.ts (digest builder),
                         app/(app)/admin/broadcast-composer.tsx (two digest buttons + "more" count)
breaking: no. No API, schema or contract change.
affects:  Daily content + admin (broadcast composer only).
```

Owner report: the digest gave one link, to the dashboard. Cause: the India digest looked up
`daily_schedule` for today's IST date only. The India cron fires after IST midnight and GitHub
often starts it hours late, so in that window there is no row for "today" and the digest fell back to
a single "Open the dashboard" card. It also resolved `guesstimate_code` by `id` only, which misses
rows that store the short code (the same bug lib/daily-server.ts already guards against).

Now (both markets, one builder):
- **Today's pair** = the dashboard's own rule: today's row, else the most recent before it; refs
  resolved by id OR code. The admin note says when a previous day's pair is used and why.
- **More practice**: N more cases AND N more guesstimates from the market's live bank (`is_active`,
  market-scoped via `marketScoped`; never unlisted or private cases), different every day (stable
  hash of market + date + id), never repeating the pair. N = 0–4, default 2, chosen in the composer.
- If the pair is missing entirely, bank picks stand in as the headline cards ("Case to practise").
  A link to /practice is used only if the bank itself is empty. The dashboard is never linked.
- **Buttons**: "Today's India digest" and "Today's US digest" are always visible; each also sets the
  audience (or the one-person practice market) to that market.
- India keeps the GD news block; US has none (see below).

Checked in production on 2026-10-03 (admin → US & Europe, GitHub Actions):
- US daily pair IS generated every day: `market_daily_schedule` latest 2026-10-02 (AI-generated
  titles); US bank 56 cases + 56 guesstimates (50 seeded + one generated pair per day). The Vercel cron
  (05:15 UTC, `/api/cron/refresh?market=US`) fills it; the GitHub workflow `daily-cases-us.yml`
  (12/12 runs green) is the backstop and reports "already full".
- **US news does not exist.** `services/news_fetcher.py` queries Indian domains only (RBI etc.), the
  US dashboard has no news module, and GD briefs are India-only. Nothing to put in a US digest's
  news slot. Building it = a US news fetch (US business sources) + a market column on
  `news_headlines` + a US dashboard module — not done here.

Gates: tsc clean; test-broadcast-audience 20/20; test-intl 51/51; next build clean. E2E against a
mock database: India digest with a late cron + code-stored guesstimate → 6 distinct case links
(pair + 2+2), 0 dashboard links, GD block present; US digest → 6 distinct links, no GD, no India
content; extra = 0 → pair only; no US schedule at all → 8 bank links; unlisted cases never included.

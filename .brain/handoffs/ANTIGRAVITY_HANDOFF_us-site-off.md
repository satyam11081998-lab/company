# ANTIGRAVITY_HANDOFF — us-site-off

**Author:** Claude (cloud session). **Date:** 2026-10-07. **Feature:** US & Europe market —
public international site switched OFF to save Vercel Fluid Active CPU (account at 3h57m of the
Hobby plan's 4h on 2026-10-06). **Branch:** `main` (owner's instruction: "kill the US one, make it
inactive"). One switch: `NEXT_PUBLIC_INTL_MARKET` (off unless `=on`).

```
touches:  frontend lib/market.ts (INTL_MARKET_ACTIVE; detectRegion → India when off;
                   intlDestination never targets /us when off),
                   next.config.js (307 /us/pricing → /pricing, /us/:path* → / when off),
                   lib/seo.ts (HREFLANG_HOME / HREFLANG_PRICING: India only when off),
                   app/sitemap.ts (no /us, no US Learn entries, no mece-framework US pair when off),
                   app/llms.txt/route.ts, app/llms-full.txt/route.ts (no US sections when off),
                   scripts/test-intl.mjs (runs its checks with the switch ON)
          backend  none
breaking: no contract changed (C1–C9 untouched). Behaviour change, flag-gated and reversible:
          public /us pages redirect; visitors are no longer geo-routed; new accounts are
          stamped India. Accounts already stamped US/EU (20 on 2026-10-06: US 19, EU 1) keep
          the US bank, US daily, USD checkout (/upgrade → /upgrade/intl) — unchanged.
affects:  US & Europe market, Landing pages (US), Growth/SEO (sitemap, hreflang, llms.txt)
```

## Why
Vercel observability, 12h window on 2026-10-06: `/us` = 27 invocations, 13s Active CPU (5th most
expensive route; ISR revalidate=600 regenerations of a heavy page); `/us/pricing` 0.9s. Together
≈12% of the window's ~115s. With the switch off, `/us/*` is answered by Vercel's router (redirects
in next.config.js run before middleware) — no function, no middleware.

## Deliberately NOT changed
- `vercel.json` US cron (`/api/cron/refresh?market=US`) — kept: the 20 existing international
  accounts still get a fresh US daily pair. It is one invocation a day (negligible CPU).
- `normalizeMarket`, `ensureUserMarket`, checkout (`marketForCheckout`), `/upgrade/intl`, the
  US app shell, backend `assert_market_access` — existing US/EU accounts must keep working, and
  the backend still refuses India cases to a US account (403), so they must stay on the US bank.
- `app/us/**` pages stay in the build (static/ISR; never reached while off).

## Loop check (switch off)
Logged-out, any country: never geo-routed; `/us*` → `/` or `/pricing`. Signed-in US/EU account:
`/` → dashboard (guest-mode rewrite, else 307 /dashboard), `/pricing` → `/upgrade` → rewritten to
`/upgrade/intl`, `/learn/**` and other India-only pages → `/practice`, `/us*` → `/` → dashboard.
No rule targets a /us path, so no loop is possible.

## Gates (run 2026-10-07 on a copy of main @ d35bf2f + this change)
1. `npx tsc --noEmit` — 0 errors.
2. `next build` — exit 0 (sandbox: placeholder env + mocked Google Fonts response).
3. `.next/routes-manifest.json` — `/us`, `/us/learn`, `/us/learn/what-is-mece`,
   `/us/case-interview-examples` → 307 `/`; `/us/pricing` → 307 `/pricing`; `/usage`, `/users`,
   `/upgrade/intl`, `/pricing`, `/` → no redirect.
4. Built `sitemap.xml`, `llms.txt`, `llms-full.txt` — 0 references to `/us`; hreflang = en-IN +
   x-default only.
5. `node scripts/test-intl.mjs` — 51 checks passed (same as before the change).
6. Unit check of `lib/market.ts`: switch ON reproduces the old detectRegion/intlDestination
   results exactly; switch OFF returns India for every signal set and never a /us destination.
No SQL. No backend change.

## Rollback / turn back on
- Fastest: Vercel → Settings → Environment Variables → `NEXT_PUBLIC_INTL_MARKET=on`
  (Production) → Redeploy. Everything above flips back together.
- Or `git revert <this commit>` and push.

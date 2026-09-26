# ANTIGRAVITY_HANDOFF — us-launch (US + Europe international market)

**Author:** Claude brain (cloud session), 2026-09-25. **Feature:** NEW — `us-launch` (no LEDGER row yet — proposed below).
**Branch:** `feat/us-launch` in BOTH repos (frontend `consilio`, backend `consilio-backend`), committed there first. The owner asked (2026-09-26) for it to go to `main`; the merge + push is done by the owner's own PowerShell run and only after they confirm migration 0070 has run. Check `git log main` for the actual state.
**Type:** market expansion. Cross-repo. Touches payments, DB schema, routing, daily content, SEO.

```
touches:  supabase  migrations/0070_international_markets.sql (NEW), seed-us-market.sql (NEW, generated)
          frontend  NEW  lib/market.ts, lib/market-server.ts, lib/market-db.ts, lib/market-page.ts,
                         lib/payments-region.ts, lib/tier-core.ts, lib/billing.ts, lib/pricing-intl.ts,
                         lib/intl-plans.ts, lib/us-market/* (50 cases + 50 guesstimates + llms section),
                         components/region/*, components/intl/*,
                         app/us/{page,pricing,case-interview-examples,market-sizing-questions},
                         app/(app)/upgrade/intl/page.tsx, scripts/{gen-us-seed,test-intl}.mjs,
                         lib/admin-preview.ts, app/(app)/admin/us-market/page.tsx,
                         app/api/admin/us-preview/route.ts, components/admin/us-preview-bar.tsx
                    MOD  lib/tier.ts (split, re-exports — every old import still resolves),
                         app/api/razorpay/{order,verify,webhook}, lib/supabase/middleware.ts,
                         lib/access.ts, lib/daily-server.ts, lib/dashboard/{leaderboards,peer-proximity,
                         activity-feed,node-to-case}.ts, lib/revenue.ts, lib/email/{templates,send}.ts,
                         lib/seo.ts, lib/types.ts, lib/api.ts, lib/constants.ts, app/layout.tsx,
                         app/(app)/{layout,practice,dashboard,leaderboard,onboarding}/page.tsx,
                         app/(app)/cases/[id]/page.tsx, app/(app)/admin/{case-editor,users/*},
                         app/api/onboarding/complete, app/api/cron/refresh, app/{page,pricing/page,
                         sitemap,robots,llms.txt,llms-full.txt}, vercel.json (+1 cron),
                         components/{user-context,app-nav,mobile-bottom-nav,footer,tier-badge,tier-gate,
                         dashboard-client,landing-mobile-nav}.tsx, components/dashboard/*(3),
                         components/leaderboard/leaderboard-client.tsx, components/guest/guest-preview-nav.tsx,
                         components/onboarding/onboarding-form.tsx,
                         components/solve/{realtime-minutes,ConversationalSolve}.tsx (copy only),
                         lib/supabase/auth-cached.ts + app/api/me (admin preview hook),
                         components/admin/admin-nav.tsx (+ "US & Europe")
                    UNCHANGED  app/(app)/upgrade/page.tsx (byte-identical — India checkout untouched)
          backend   NEW  services/markets.py, tests/test_markets.py, .github/workflows/daily-cases-us.yml
                    MOD  services/access_guard.py, routes/{attempts,submit,daily,cron}.py,
                         (services/markets.py: admins may open either bank — admin US preview)
                         services/{content_generator,daily_scheduler}.py, requirements.txt (+tzdata)
breaking: YES —
          C1 v4 → v5: cases gains `market text not null default 'IN'` check ('IN','US').
                      Additive, but EVERY list reader must now filter by market or US cases
                      leak into India lists (all current readers are patched — see §4).
          C6 v1 → v2: users gains `market text` ('IN'|'US'|'EU', NULL = unstamped → treated as IN).
                      PRIVILEGED + LOCKED like subscription_tier: not in 0054's column grant,
                      and the guard trigger (0054 body + market) reverts it for non-service writers.
          C4 additive: /api/razorpay/order response gains `currency`; order accepts no new input.
                      /api/cron/refresh?market=US; backend POST /cron/schedule-daily-us;
                      GET /daily/today?market=US, GET /daily/leaderboard?market=US (param optional,
                      absent = today's behaviour byte-for-byte).
          C7 narrowed: coupons are INR-only. /order 400s a coupon on a non-INR order; /verify and
                      the webhook refuse one if it ever appears. INR coupon path is unchanged.
          C9 mirror:  lib/intl-plans.ts INTL_CLARIFICATIONS (7/12/20) is a 4th copy of the ladder.
                      test-intl.mjs asserts it equals TIER_LIMITS — move it in the same commit train.
          PROPOSES new C11 · International markets (text in §7) — owner to approve before it is
          written into CONTRACTS.md.
affects:  Payments, Daily content, Dashboard, Leaderboard, Case solve UX, Onboarding, Admin,
          Landing/SEO, Guest mode, Deck Vault (public /decks now India-only for intl humans),
          Free-tier rework (limits reused unchanged), Voice interview (RT minute packs India-only)
```

---

## 1. Owner decisions (2026-09-25, from the request)

| Question | Decision |
| --- | --- |
| Markets | US (USD) and Europe (EUR). Europe = EU/EEA + UK + CH + other European countries/timezones. |
| Price | **Lite $29 / €29 per month, Pro $49 / €49 per month.** |
| 3-month plan | **Lite $69 / €69** (≈ $23/mo, **21% off**), **Pro $119 / €119** (≈ $39.67/mo, **19% off**). Same number in both currencies (clean price points; EUR is not FX-converted). |
| Free tier | Identical to India: today's daily case + daily guesstimate + 1 lifetime extra; clarifications free 7 · lite 12 · pro 20. |
| India pricing | Never shown to an international visitor — not in the page, not in the page's JS (verified by chunk grep, §6). |
| Content | International users practice ONLY the US bank: 50 US cases (US-C-01..50) + 50 US guesstimates (US-G-01..50), plus a fresh US daily pair every US Eastern day. Europe uses the US bank. |
| Learning | Not offered internationally. `/learn`, `/gd-briefs`, `/cheat-sheet`, `/skeletons`, `/deck-vault`, `/decks`, `/resume`, `/coach` redirect intl users (logged-in → /practice, logged-out → /us). |
| India-only products | Deck Vault (₹99/₹499), real-time minute packs, coupons — refused server-side for intl, hidden in UI. |

---

## 2. How region is decided (and the honest VPN answer)

**Display (lib/market.ts `detectRegion`)** — two independent signals:
- `x-vercel-ip-country` (set by Vercel's edge; the client cannot forge it), and
- the browser's IANA timezone, written by `components/region/region-probe.tsx` to the `mece_tz` cookie.

Rule: **India only if IP = IN and the clock is India (or unknown). Any foreign IP → foreign.
An Indian IP with a US/EU clock → foreign** (this catches "VPN into India"). Crawlers are
never geo-routed (hreflang joins the twins instead).

**Account lock** — `users.market` is stamped ONCE (first signed-in request after 0070) by the
middleware as service role, then locked (§C6 above). Travelling or toggling a VPN later changes
nothing. All 0070-era existing users are backfilled `IN`. Admin can override in /admin/users.

**Money (lib/payments-region.ts) — the hard guarantee.** Display CAN be fooled by someone who
runs an Indian VPN *and* sets their OS clock to India. What they cannot fool: an INR order is
honoured only when Razorpay reports `payment.international === false` (Indian card / UPI /
Indian netbanking — decided by the card BIN, not the browser). A foreign card on an INR order
is **refunded in full, nothing granted, owner alerted on Telegram**. No `payments` row is
written for it (a row would let the `refund.created` webhook downgrade an existing subscriber).
Applied in /verify (subscriptions, decks, RT packs) and the webhook (subscriptions), idempotent
if both race.

Currency is chosen **server-side from the account's market** in /order — never from the body.
/verify + webhook recompute the expected amount from the ORDER's currency as Razorpay recorded
it, and check the captured currency matches.

---

## 3. Phased build steps (Antigravity) — ORDER MATTERS

### Phase 0 — Database (Supabase SQL editor), BEFORE any deploy
1. Run `supabase/migrations/0070_international_markets.sql`. Idempotent; tested twice on local PG.
2. Run its VERIFY block (bottom of the file). Expect: all users `IN`; `market` NOT in the
   authenticated UPDATE grant list; all cases `IN`; `market_daily_schedule` empty.
3. **Do NOT run `seed-us-market.sql` yet.** The currently-deployed code has no market filter; US
   cases seeded now would appear in India practice lists.

Deploy-order safety: code deployed before 0070 reads a missing column as "India"
(`lib/market-db.ts`, `services/markets.py`), so either order of Phase 0 / Phase 1-2 is safe —
only the SEED must come last.

### Phase 1 — Backend (Render)
- `pip install -r requirements.txt` (adds `tzdata==2025.2` for `America/New_York` on slim images).
- Gates: `python -m py_compile services/markets.py services/access_guard.py services/daily_scheduler.py services/content_generator.py routes/attempts.py routes/submit.py routes/daily.py routes/cron.py` → EXIT 0.
  `python tests/test_markets.py` → **48 checks pass**.
- Pre-existing, NOT regressions: `tests/test_session_signals.py` and `tests/test_interviewer_mode.py`
  fail on `main` too without SUPABASE env.

### Phase 2 — Frontend (Vercel)
- Gates: `npx tsc --noEmit` → EXIT 0. `npx next build` → EXIT 0 (305 pages; `/`, `/pricing`, `/us`,
  `/us/pricing`, `/us/case-interview-examples`, `/us/market-sizing-questions` all static ○).
  `node scripts/test-intl.mjs` → **46 checks pass** (region rules, prices, savings %, C9 mirror,
  domestic wall, India-only paths).
- Build note for sandboxes without Google Fonts egress: `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`.
  Irrelevant on Vercel.

### Phase 3 — Seed the US bank (only after Phases 1 + 2 are live)
- Run `supabase/seed-us-market.sql`. Idempotent (`on conflict (code) do update … where
  cases.market = 'US'` — it can never overwrite an India row). It also bootstraps today's US daily
  (US-C-05 + US-G-01) only if `market_daily_schedule` is empty.
- To regenerate after editing `lib/us-market/*`: `node scripts/gen-us-seed.mjs` (validates every
  item: unique codes, required fields, numbers present, no ₹ / lakh / crore / Rs terms).
- Verify: `select market, type = 'guesstimate' as g, count(*) from cases group by 1,2;` → US: 50 / 50.

### Phase 4 — Razorpay (owner, dashboard)
1. **Enable International Payments** (Settings → International payments). Until it is on, a USD/EUR
   order fails to create; /order returns a clean 503 and Telegrams the owner — nothing breaks for India.
2. Confirm USD and EUR are enabled currencies.
3. Test mode: pay a USD order with an international test card → Lite granted, `payments.currency='USD'`,
   `amount_paise` holds CENTS. Pay an INR order with an international test card → refunded, not
   granted, Telegram alert.

### Phase 5 — Crons
- Backend GitHub Action `.github/workflows/daily-cases-us.yml` (05:10 + 06:40 UTC — after New York
  midnight in both EDT and EST). Uses the EXISTING secrets `API_BASE_URL`, `CRON_SECRET` — nothing new.
  Run it once via workflow_dispatch after Phase 3.
- `vercel.json` gains a second cron `/api/cron/refresh?market=US` at 05:15 UTC. Check the Vercel
  plan's cron-count limit; if it is exceeded, drop this entry — the GitHub Action alone is sufficient.
- The US daily is AI-generated with a US system prompt (USD, US companies/geography); on any
  generation failure it falls back to the least-recently-used curated bank item.

### Phase 6 — QA matrix (real browser)
| Visitor | Expect |
| --- | --- |
| India IP, India clock, logged out | `/` India landing, ₹ pricing — **unchanged** |
| US IP, logged out | `/` → 307 `/us`; `/pricing` → `/us/pricing`; `/learn/*` → `/us`; USD shown |
| EU IP (e.g. DE), logged out | same routes, **€** shown (toggle to $ available) |
| India IP + US clock (VPN) | treated as US |
| US account, logged in | nav without Learn/GD/Deck Vault; practice = US bank only; US daily; `/upgrade` shows $ plans (served by `/upgrade/intl` via rewrite, URL stays `/upgrade`) |
| US account opens an India case URL | access refused (`wrong-market`), frontend + backend |
| India account | everything byte-identical to today, incl. `/upgrade` |
| Googlebot UA from US IP | `/` served as-is (no redirect); hreflang present |

### Phase 7 — SEO/AEO/GEO
- Resubmit `sitemap.xml` in Search Console (adds `/us`, `/us/pricing`, `/us/case-interview-examples`,
  `/us/market-sizing-questions`). hreflang: `/` = en-IN, `/us` = en-US / en-GB / en-IE, x-default = `/`.
- `/llms.txt` and `/llms-full.txt` gain a US section (US practice pages, USD prices).
- Target keywords on the US pages: case interview practice, consulting case interview prep,
  McKinsey / BCG / Bain case interview, market sizing questions, guesstimate questions, AI case
  interview coach, mock case interview, profitability case, market entry case, MBA consulting recruiting.

---

## 4. Blast radius — what India users could notice (should be nothing)

- Every list reader that could surface a US case now filters `market` (practice hub, dashboard
  sections, leaderboards, activity feed, peer proximity, node-to-case, solution study, admin case
  editor shows a market selector). With 0070 not yet run they fall back to the old unfiltered query.
- India daily: `daily_schedule` table untouched; `_newest_active` adds `.eq('market','IN')` only when
  the column exists.
- `/upgrade` India page: byte-identical file. The rewrite to `/upgrade/intl` fires only for a FRESH
  DB read of an intl account (never from IP, never from the 12h cookie).
- India checkout: order notes object is identical for INR; amount = `listMinor(tier, period, 'INR')`
  = old `priceFor(tier, period) * 100`.
- The domestic wall applies to India orders too: an Indian account paying with a FOREIGN card is
  refused + refunded. Only possible once International Payments is enabled (before that Razorpay
  rejects foreign cards anyway). Genuine NRI edge case → owner can grant manually from Telegram alert.

## 5. Known limitations / follow-ups (not in this branch)
- Vercel functions are pinned to `bom1` (Mumbai). US round-trips add latency on dynamic routes;
  static US pages are CDN-served. Consider a multi-region / `iad1` follow-up.
- Voice quota still resets at 00:00 IST (backend). International copy says "resets daily".
- Coupons INR-only until C7's `coupon_redemptions` ledger carries a currency.
- US and Europe share one leaderboard ("US & Europe").
- `lib/revenue.ts` reports each currency separately; admin totals no longer sum cents into rupees.

## 6. Verification already run in the sandbox
- tsc EXIT 0; next build EXIT 0; test-intl 46/46; test_markets 48/48; py_compile EXIT 0.
- 0070 run twice on local Postgres: idempotent; `authenticated` UPDATE of `market` → permission
  denied; guard trigger reverts it.
- seed-us-market.sql run twice: idempotent, 100 rows, no India row touched.
- JS-chunk audit: the INR price table (`monthly:299,quarter:749`) appears ONLY in the chunks for
  `/pricing`, `/upgrade` (India) and `/decks/[slug]` — every one of which intl humans are redirected
  away from. `/us`, `/us/pricing`, `/upgrade/intl` chunks contain no rupee price.

## 7. Proposed C11 · International markets (v1, 2026-09-25) — for owner approval
Source of truth: `lib/market.ts` (frontend), `services/markets.py` (backend), `0070_international_markets.sql`.
- `users.market` ∈ {IN, US, EU}; NULL ≡ IN. Service-role write only. Content market: EU → US.
- `cases.market` ∈ {IN, US}. Readers MUST scope by the viewer's content market
  (`marketScoped` / `scopeUsersToMarket` / `runMarketScoped`); a missing column ≡ IN.
- Currency is derived from the ACCOUNT market server-side (`currencyOf`), never from the client.
- INR orders require `payment.international === false` (domestic wall). USD/EUR have no wall.
- Intl prices live ONLY in `lib/pricing-intl.ts`; INR prices ONLY in `lib/tier.ts`. Client
  components shown to intl users must not import `lib/tier.ts` (use `lib/tier-core.ts`).
- **Rule:** adding a market, changing the detection rule, or changing any intl price = BREAKING.
  Affects: Payments, Daily content, Dashboard, Leaderboard, Landing/SEO.

## 8. Proposed LEDGER row
| **US / Europe launch** | Cloud brain | feat/us-launch | **BUILT 2026-09-25, NOT MERGED** — gates green; needs Phase 0-7 | `lib/market*.ts`, `lib/payments-region.ts`, `lib/pricing-intl.ts`, `lib/us-market/*`, `app/us/*`, `app/(app)/upgrade/intl/*`, `components/{intl,region}/*`, backend `services/markets.py` | C1 v5, C6 v2, C4, C7, C9, proposed C11 |

## 9. Admin: "US & Europe" section + view-as-US preview (added 2026-09-26, owner request)
- `/admin/us-market` (new admin nav item **US & Europe**): links to every public US page
  (`/us`, `/us/pricing`, `/us/case-interview-examples`, `/us/market-sizing-questions`), the USD/EUR
  price table, and a health panel (US bank size, latest US daily, accounts per market — says
  "run 0070 first" instead of erroring before the migration).
- **Start US preview** → `POST /api/admin/us-preview` sets httpOnly cookie `mece_admin_mkt=US` (12h)
  after checking `is_admin`, then 303 → `/practice` (full reload). While on, `getCachedUserRow`,
  the case page and `/api/me` hand pages a row with `market: 'US'` + `admin_preview: true`
  (lib/admin-preview.ts). The app then shows the US nav, US bank, US daily, USD plans, and an amber
  "Admin preview: US version · Exit preview" bar.
- DISPLAY ONLY: `users.market` is never written; Razorpay routes re-read the real market; the intl
  checkout button refuses while previewing. The cookie is ignored for non-admins.
- Backend `services/markets.assert_market_access`: on a market MISMATCH only, an admin (`users.is_admin`)
  may open the case, gated by the case's own market rules. Read error → 403 (fail closed).
  `tests/test_markets.py` now 48 checks.

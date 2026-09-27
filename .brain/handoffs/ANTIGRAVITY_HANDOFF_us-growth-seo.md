# ANTIGRAVITY_HANDOFF — us-growth-seo (US Learn library + AEO/GEO plumbing)

**Author:** Claude brain (cloud session), 2026-09-27. **Feature:** NEW — `us-growth-seo` (LEDGER row proposed in §8).
**Branch:** `feat/us-growth-seo`, frontend (`consilio`) only, cut from `main` at `4112489` (us-redesign v2).
Two commits: wave 1 (Learn library + SEO plumbing) and wave 2 (owner said "fix everything, push to main",
2026-09-27 13:19 IST: routing twins, Learn links in the US header/footer/app shell, entity text, honest lastmod).
Fast-forwarded into local `main` on the owner's instruction; the owner pushes (the Linux shell has no GitHub login).
**Depends on:** `us-launch` (the `/us` routes, US case bank, `'/us'` in PUBLIC_ROUTES) and `us-redesign`
(US header/footer/`FinalCta`/`StartButton`/`Eyebrow`/`US_CARD`, imported read-only).
**Type:** content + SEO. No backend, no DB, no migration, no env var, no new dependency.
**Brief it was built to:** `docs/growth-us/MASTER_PROMPT.md`. Strategy doc: see `docs/growth-us/README.md`.

```
touches:  frontend  NEW  app/us/learn/page.tsx (hub, static)
                         app/us/learn/[slug]/page.tsx (22 guides, SSG, dynamicParams=false)
                         components/us-learn/{blocks,inline-md}.tsx
                         lib/us-learn/{types,index,seo,markdown,us-data}.ts
                         lib/us-learn/content/{foundations,frameworks,roles}.ts
                         public/32253abc39d938d2742a313856778bbf.txt (IndexNow key file)
                         scripts/indexnow-submit.mjs
                         docs/growth-us/{MASTER_PROMPT,README}.md
                    MOD  app/sitemap.ts        (Learn entries with real lastmod; hreflang pair
                                                /learn/mece-framework ⇄ /us/learn/what-is-mece; lastmod now
                                                emitted ONLY when a real date is known — no more build-time lastmod)
                         app/llms.txt/route.ts (+Learn section; /mece-framework 308 link → /learn/mece-framework)
                         app/llms-full.txt/route.ts (+every Learn guide in full)
               wave 2 MOD lib/market.ts (+US_LEARN_HUB, isIndiaLearnPath, INTL_LEARN_TWIN, intlDestination)
                         lib/supabase/middleware.ts (both intl branches now call intlDestination)
                         scripts/test-intl.mjs (+5 checks → 51)
                         components/us/marketing/us-header.tsx (+"Learn" in US_MARKETING_NAV)
                         components/us/marketing/us-footer.tsx (+Learn library, What is MECE?, Case interview guide)
                         components/us/shell/us-app-shell.tsx (+"Learn" in the Practice group of the sidebar)
                         lib/seo.ts (Organization disambiguatingDescription covers US/EU; knowsAbout +2)
                    NOT TOUCHED  components/intl/**, app/us/{page,pricing,…}.tsx, lib/us-market/**, robots.ts,
                         pricing, payments, backend, package.json, yarn.lock, .brain/STATE.md
breaking: no CONTRACTS.md surface (C1–C9 untouched). Wave 2 changes the routing DESTINATION for international
          humans on India LEARNING pages only (was /us or /practice → now the US Learn twin or /us/learn).
          Detection, prices and every other redirect are unchanged (test-intl asserts it). Owner-approved
          2026-09-27. If C11 is written into CONTRACTS.md, record intlDestination() there as the routing rule.
affects:  Landing/SEO, US marketing nav, US app shell nav, middleware (intl learning redirects only).
          India humans and all crawlers: unchanged.
```

---

## 1. What ships

**US Learn library at `/us/learn`** — 1 hub + 22 guides, ~18,400 words, public, server-rendered, zero client JS
of its own (only the existing `StartButton` island). Three clusters:

| Cluster | Pages (`/us/learn/<slug>`) |
|---|---|
| Foundations | `what-is-mece`, `case-interview`, `issue-trees`, `market-sizing`, `case-interview-math`, `pyramid-principle` |
| Case frameworks | `profitability-framework`, `market-entry-framework`, `pricing-strategy-framework`, `growth-strategy-framework`, `mergers-and-acquisitions-case`, `go-to-market-framework`, `cost-reduction-framework`, `operations-case-framework`, `competitive-response-framework`, `business-frameworks` |
| Role guides (beyond consulting) | `product-manager-case-interview`, `sales-case-interview`, `marketing-case-interview`, `hr-case-interview`, `strategy-and-operations-interview`, `finance-case-interview` |

Every page: answer-first 40–60 word "Short answer" block (the passage AI engines quote), key takeaways,
question-shaped H2s, a worked example with checked arithmetic (fictional companies, labelled illustrative),
mistakes, visible FAQ, "Practice this" cards into the US bank (`/us/case-interview-examples#…` + `/p/<code>`,
nofollow), related guides, sources (real-world numbers only), and the one entity sentence
(`US_ENTITY_LINE` in `lib/us-learn/seo.ts`) that disambiguates MECE-the-product from MECE-the-principle.

**Structured data** (derived from the same records as the visible page): `Article`+`LearningResource`,
`BreadcrumbList`, `FAQPage`; hub = `CollectionPage`+`ItemList`. Organization/WebSite referenced by `@id` only.
`what-is-mece` also carries a `DefinedTerm` and hreflang (en-US/en-GB/en-IE ⇄ en-IN `/learn/mece-framework`).

**AEO/GEO plumbing:** sitemap entries with true `lastmod` (not build time); llms.txt one line per guide;
llms-full.txt carries every guide as markdown with absolute links; IndexNow key file + submit script (Bing →
Copilot and ChatGPT search, which partners with Microsoft per OpenAI's help center).

**Build-time integrity:** `generateStaticParams` runs `validateLearnLibrary()` and FAILS THE BUILD on a
duplicate slug, a related-slug or case-code that doesn't exist, an internal link to an unknown page/anchor,
or any link to a path US humans get redirected from (`/learn`, `/decks`, …). Answer length, title and
description lengths are checked too.

## 2. Content rules (for whoever edits these pages next)

- Real-world numbers live ONLY in `lib/us-learn/us-data.ts`, each with source URL + as-of date. Update them
  when Census/BLS/CDC release new figures and bump the page's `modified`.
- Example companies are fictional; example numbers are illustrative and say so on the page.
- Firm names only as plain text describing interview styles. No logos. Not-affiliated line on every page.
- Inline markup is `**bold**` and `[text](href)` only. Use `×`, never `*`.
- No rupees, lakh, crore, or India-only links (the validator and the page check enforce the links part).

## 3. Phased build steps (Antigravity) — ORDER MATTERS

### Phase 0 — Sync
`git fetch` in `D:\dev\mece\consilio`; confirm `origin/feat/us-growth-seo` exists and its base is `4112489`
(or later main, if rebased).

### Phase 1 — Gates on the branch
- `npx tsc --noEmit` → EXIT 0
- `npx next build` → EXIT 0 (330 pages; `/us/learn` ○ static, `/us/learn/[slug]` ● SSG with 22 paths)
- No SQL → no idempotency gate. No backend → no py_compile gate.

### Phase 2 — Vercel preview QA (real browser)
1. `/us/learn` and three guides at 390 and 1280, light and dark: no horizontal scroll, tables scroll inside
   their frame on phones, sticky "On this page" rail on desktop only.
2. As a logged-out US visitor: every "Practice live" link opens the case flow exactly as the same links on
   `/us/case-interview-examples` do (access rules unchanged).
3. View source on `/us/learn/what-is-mece`: canonical, 5 hreflang links, 3 JSON-LD scripts.
4. `https://<preview>/sitemap.xml` contains 23 `/us/learn` URLs; `/llms.txt` has the "MECE Learn" section.
5. India: `/`, `/pricing`, `/learn/mece-framework` render exactly as before (only sitemap/llms changed).

### Phase 3 — Merge, then `git push` and `node .brain\sync.mjs`.

### Phase 4 — Owner, after the production deploy (none of this can be done from code)
1. **Google Search Console:** resubmit `https://mece.in/sitemap.xml`; URL-inspect `/us/learn` and request indexing.
2. **Bing Webmaster Tools:** verify mece.in (import from Search Console is fastest), submit the sitemap, then
   watch **AI Performance** (Copilot/partner citations + grounding queries).
3. **IndexNow:** `node scripts/indexnow-submit.mjs --only /us/learn` (checks the key file is live first).
   Re-run with `--only /us` after any US content change.
4. **Vercel Firewall:** confirm no Bot Protection / "AI Bots" managed rule blocks OAI-SearchBot, PerplexityBot,
   ClaudeBot or Bingbot (OpenAI: blocked IPs make a site ineligible for ChatGPT search).
5. **Entity:** once confirmed live, add `https://www.linkedin.com/company/mece-in/` (already linked in the US
   footer) to `SOCIAL_PROFILES` in `lib/seo.ts`; add YouTube/X/Crunchbase/Product Hunt as they go live.

## 4. Done in wave 2 (were follow-ups) and what is still open

**Done (owner: "yes fix everything"):**
- "Learn" link in the US header nav, footer (3 links) and the logged-in US app-shell sidebar.
- Routing: `intlDestination()` in `lib/market.ts` is now the one rule both middleware branches use.
  India learning URL → its US twin (`INTL_LEARN_TWIN`, 30 exact paths, e.g. `/learn/mece-framework` →
  `/us/learn/what-is-mece`, `/learn/casebook/core-frameworks/profitability` → `/us/learn/profitability-framework`),
  any other `/learn/**` → `/us/learn`. Query strings (UTMs) are kept on learning redirects.
- Organization JSON-LD describes both markets; lastmod no longer lies.

**Still open (need the owner, not code):**
- Domain decision (see strategy §5).
- `SOCIAL_PROFILES` in `lib/seo.ts`: add `https://www.linkedin.com/company/mece-in/` once someone confirms it
  opens (LinkedIn blocks automated checks, so it could not be verified from here).
- USD/EUR coupons, an annual US plan, a student offer: pricing/payments decisions (C7 / proposed C11).
- Pre-existing, not caused by this branch: at ~1024–1100px the US header wraps "Case examples" and
  "Market sizing" onto two lines (it did before "Learn" was added). Check with the real Inter font on the
  preview; if it bothers you, `whitespace-nowrap` + `lg:px-2 xl:px-3` on the nav links is the fix to try.

## 5. Verification run in the sandbox (2026-09-27)

- `tsc --noEmit` EXIT 0. `next build` EXIT 0, 330/330 pages, clean `.next` (fonts mocked: no Google Fonts
  egress in sandbox). `node scripts/test-intl.mjs` → 51 checks passed (46 existing + 5 routing).
- Wave 2 routing (`next start`): US `/learn/mece-framework` → 307 `/us/learn/what-is-mece` (UTM kept);
  FR `/learn/casebook/core-frameworks/m-and-a/private-equity` → `/us/learn/mergers-and-acquisitions-case`;
  US `/learn/casebook/industry-primers/aviation` → `/us/learn`; US `/decks/x` → `/us` (unchanged);
  US `/` → `/us`, `/pricing` → `/us/pricing` (unchanged); India `/`, `/pricing` → 200 (unchanged);
  Googlebot is never redirected.
- `validateLearnLibrary()`: 0 problems.
- Routing matrix (`next start`, headers set by hand):

| Request | Result |
|---|---|
| Googlebot / OAI-SearchBot → `/us/learn`, `/us/learn/what-is-mece` | 200 |
| US human (IP US + NY clock) → `/us/learn/profitability-framework` | 200, no redirect |
| EU human (DE) → `/us/learn/hr-case-interview` | 200 |
| India human (IN + Kolkata clock) → `/us/learn/market-sizing` | 200 |
| Unknown slug | 404 |
| `/32253abc39d938d2742a313856778bbf.txt` | 200, body = key |
| `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/robots.txt` | 200 |

- Page check on all 23 URLs: exactly one `<h1>`, canonical = own URL, description + og:image present, every
  JSON-LD block parses, every FAQ question in the JSON-LD is visible on the page, no ₹/lakh/crore, no link to
  an India-only path.
- Layout: 0 px horizontal overflow at 390 and 1280 (hub + 4 guides). Screenshots taken with JS disabled —
  in the sandbox every page (including the existing `/us`) hits the global error boundary on hydration
  because the Supabase client env vars are absent; unrelated to this branch, but it means client-side
  behaviour was NOT verified here → Phase 2.
- Arithmetic: every worked example recomputed (49 inline expressions by script, the rest — CAGR, annuity
  factors, IRR, sums — by hand in Python). One deliberate rounding (6.7 ≈ 7 drinks/hour).
- Sources: every external URL cited was opened on 2026-09-27; one dead HBR link was replaced.

## 6. Known limitations
- 22 guides is a first wave (~630–1,470 words of body each). The strategy's cadence is two new guides a week,
  prioritised from Search Console and Bing grounding queries.
- `/p/<code>` practice links behave exactly like the existing US examples page (free tier: daily pair + one
  extra). A logged-out click on a non-daily case meets the same gate it meets there.
- mece.in is a ccTLD: Google treats .in as India-targeted. This branch can't change that; see the strategy's
  domain decision.

## 7. Proposed CHANGELOG line
`2026-09-27 · us-growth-seo · frontend · non-breaking for India — US Learn library (/us/learn: hub + 22 guides across foundations, case frameworks and role guides for PM/sales/marketing/HR/S&O/finance), Article/FAQ/Breadcrumb JSON-LD, honest sitemap lastmod + MECE hreflang pair, llms.txt/llms-full.txt sections, IndexNow key + script; wave 2: intl humans on India /learn/** now land on the US twin guide or /us/learn (intlDestination), Learn links in the US header/footer/app shell, Organization entity text covers US/EU. touches: app/us/learn/**, components/us-learn/**, lib/us-learn/**, lib/market.ts, lib/supabase/middleware.ts, components/us/{marketing/us-header,marketing/us-footer,shell/us-app-shell}.tsx, lib/seo.ts, app/sitemap.ts, app/llms*.txt, public/<key>.txt, scripts/{indexnow-submit,test-intl}.mjs. affects: Landing/SEO, US nav, intl learning redirects.`

## 8. Proposed LEDGER row
| **US growth: Learn library + AEO/GEO** | Claude (cloud) | feat/us-growth-seo | **BUILT 2026-09-27, merged to main locally (owner pushes)** | `app/us/learn/**`, `components/us-learn/**`, `lib/us-learn/**`, `scripts/indexnow-submit.mjs` | us-launch, us-redesign |

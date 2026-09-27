# ANTIGRAVITY_HANDOFF — us-growth-seo (US Learn library + AEO/GEO plumbing)

**Author:** Claude brain (cloud session), 2026-09-27. **Feature:** NEW — `us-growth-seo` (LEDGER row proposed in §8).
**Branch:** `feat/us-growth-seo`, frontend (`consilio`) only, cut from `main` at `4112489` (us-redesign v2).
Pushed as a branch so Vercel builds a preview. Merging to `main` is the owner's call.
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
                    MOD  app/sitemap.ts        (+24 lines: Learn entries with real lastmod; hreflang pair
                                                /learn/mece-framework ⇄ /us/learn/what-is-mece)
                         app/llms.txt/route.ts (+Learn section; /mece-framework 308 link → /learn/mece-framework)
                         app/llms-full.txt/route.ts (+every Learn guide in full)
                    NOT TOUCHED  components/us/**, components/intl/**, app/us/{page,pricing,…}.tsx,
                         lib/us-market/**, lib/market.ts, middleware, lib/seo.ts, robots.ts,
                         package.json, yarn.lock, .brain/STATE.md
breaking: no. No CONTRACTS.md surface (C1–C9 untouched; proposed C11 untouched).
affects:  Landing/SEO (sitemap, llms.txt, llms-full.txt gain entries). India: no rendered page changes.
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

## 4. Follow-ups for OTHER sessions (not done here on purpose)

**a) For the session that owns `components/us/**` (two additive lines — do this first, it's the biggest
internal-link win):**
- `components/us/marketing/us-header.tsx` `US_MARKETING_NAV`: add `{ href: '/us/learn', label: 'Learn' }`
  (e.g. after "Market sizing"). Its header comment says India learning tracks are not linked; `/us/learn` is
  a US page, open to US visitors, so the comment still holds.
- `components/us/marketing/us-footer.tsx` `COLUMNS` → "Method": add `{ href: '/us/learn', label: 'Learn library' }`
  and `{ href: '/us/learn/what-is-mece', label: 'What is MECE?' }`.

**b) PROPOSAL, needs owner approval (touches the proposed C11 routing surface in `lib/market.ts`):**
today a US human who clicks a Google/ChatGPT result for `/learn/mece-framework` (India) is bounced to the `/us`
home page, not to the answer. Map India Learn URLs to their US twins instead:
```ts
// lib/market.ts — INTL_TWIN
'/learn/mece-framework': '/us/learn/what-is-mece',
```
and, in `lib/supabase/middleware.ts`, prefer `INTL_TWIN[pathname]` over the India-only fallback for logged-in
intl users too (currently `indiaOnly` wins and sends them to `/practice`). Not applied here.

**c) Product follow-ups from the strategy:** USD/EUR coupons (C7 is INR-only) for creator/club codes;
an annual US plan and a student offer (pricing = proposed C11 breaking change, owner decision).

## 5. Verification run in the sandbox (2026-09-27)

- `tsc --noEmit` EXIT 0. `next build` EXIT 0, 330/330 pages (fonts mocked: no Google Fonts egress in sandbox).
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
`2026-09-27 · us-growth-seo · frontend · non-breaking — US Learn library (/us/learn: hub + 22 guides across foundations, case frameworks and role guides for PM/sales/marketing/HR/S&O/finance), Article/FAQ/Breadcrumb JSON-LD, sitemap with real lastmod + MECE hreflang pair, llms.txt/llms-full.txt sections, IndexNow key + script. touches: app/us/learn/**, components/us-learn/**, lib/us-learn/**, app/sitemap.ts, app/llms*.txt, public/<key>.txt, scripts/indexnow-submit.mjs. affects: Landing/SEO.`

## 8. Proposed LEDGER row
| **US growth: Learn library + AEO/GEO** | Claude (cloud) | feat/us-growth-seo | **BUILT 2026-09-27, preview pending** | `app/us/learn/**`, `components/us-learn/**`, `lib/us-learn/**`, `scripts/indexnow-submit.mjs` | us-launch, us-redesign |

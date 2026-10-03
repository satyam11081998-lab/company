# ANTIGRAVITY_HANDOFF — daily-blog (Growth Agent: one sourced article a day on /insights)

**Author:** Claude (cloud session, Project "project"). **Date:** 2026-10-04.
**Owner ask (2026-10-04):** a blog post every morning (6 or 8 a.m.) on a trending, non-controversial
business topic for MBA aspirants — broad, not too niche; real facts and figures; not machine-sounding;
not too long, not too short; with case/interview practice that brings readers to MECE.
**Branch:** `main` in both repos. **Ships dormant**: nothing runs until the env switches below are set.

```
touches:  consilio-backend
            NEW  services/growth/daily_blog.py      topic -> research -> write -> checks -> critic -> save
            EDIT routes/cron.py                     + POST /cron/daily-blog (x-cron-secret; no-op unless
                                                      DAILY_BLOG_ENABLED; budget kill switch respected)
            EDIT routes/seo.py                      + GET /seo/daily/status, POST /seo/daily/run (admin)
            NEW  .github/workflows/daily-blog.yml   01:30 UTC = 07:00 IST, after the 06:00 news fetch
            NEW  tests/test_daily_blog.py           32 checks, stdlib only (python -m tests.test_daily_blog)
          consilio
            EDIT lib/seo-pages.ts                   SeoContent gains the daily fields (additive)
            EDIT app/insights/[slug]/page.tsx       renders the daily format (summary, cited paragraphs,
                                                      By the numbers, interview angle, related case, FAQ +
                                                      FAQPage JSON-LD, numbered sources, byline/date/read
                                                      time); older 'news_case' pages render as before
            EDIT app/insights/page.tsx              dates on the list; copy
            EDIT app/(app)/admin/growth/growth-admin-client.tsx   "Daily post" panel (switches, topics it
                                                      would pick now, Preview, Write as draft)
            EDIT lib/constants.ts                   '/insights' added to PUBLIC_ROUTES  <-- see below
          database: none. Uses the existing seo_pages table (kind = 'daily'); reads news_headlines and
                    cases (read-only).
breaking: no. C4 (routes) — additive: three new backend routes, one public path. No table, column or
          existing route changes. Reuses the existing `seo_writer` / `seo_critique` AI features, so the
          admin's provider toggles apply and every call is logged to ai_usage_log.
```

## IMPORTANT: /insights was not public (fixed here, please confirm)
`/insights/**` has been in the sitemap since the Growth Agent shipped, but it was missing from
`PUBLIC_ROUTES`, so every logged-out reader and every crawler got a 307 to /login — no article could
ever be indexed, and the sitemap advertised redirects (the same bug the comment in lib/constants.ts
describes for /testimonials). Fixed by adding `'/insights'` (published rows only reach the page: RLS +
status filter). It is a one-line, separate commit so it is easy to review or revert.

## How it works (services/growth/daily_blog.py)
1. **Topic.** news_headlines from the last 72 h in business / macro / micro / tech / jobs / policy.
   Never: political, tragic, criminal or divisive terms (blocklist with word boundaries: "price war"
   is fine, "trade war" is not; "Hindustan Unilever" and "RBI Governor" are fine), stories already
   written, or titles too close to the last 45 days of posts. Ranked by the classifier's
   GD-worthiness + MBA relevance (strategy, marketing, finance, operations, tech/product, economy,
   careers) + freshness, minus one-stock noise, minus a domain used two of the last three days. A cheap
   "editor" call (`seo_critique` feature) picks the broadest of the top five and frames the angle one
   level up ("Why food delivery apps keep raising fees", not the headline). Nothing qualifies → an
   evergreen topic (24 in the list), rotated.
2. **Research.** Gemini with Google Search grounding (`GEMINI_API_KEY`, the key GD briefs and news classification already use) asks
   for 8–12 dated facts with numbers. A fact survives only if the grounding metadata ties it to a web
   page; Google's redirect links are resolved to the real URL. Fewer than 3 sourced facts → next topic;
   none → no post that day (and a Telegram note).
3. **Write.** `seo_writer` (gpt-4o by default) from those facts only, citing each [F#], 800–1,100
   words, question-shaped headings, answer-first summary, house style that bans the usual machine tells
   (delve, landscape, crucial, em dashes, exclamation marks …).
4. **Checks (deterministic).** Length 650–1,300 words; every number traceable to a fact (practice prompt
   and interview questions may use estimation numbers); citations valid; ≥ 3 facts cited; banned phrases;
   ≤ 3 em dashes; no blocked terms; title ≤ 70, meta ≤ 160; required parts present. One repair round
   with the exact problems; still failing → draft with the problems in quality_notes.
5. **Critic.** `seo_critique` scores 0–100 (usefulness, grounding, human voice, fit, structure).
6. **Save.** seo_pages kind='daily', with numbered sources, the closest case + guesstimate from the India
   bank (word overlap, US bank never), and agent_meta (date, domain, reasons, checks, critic). Published
   only when DAILY_BLOG_AUTOPUBLISH is on AND no check failed AND score ≥ DAILY_BLOG_MIN_SCORE (75);
   otherwise a draft in /admin/growth. One post per IST day (a retry or second run is a no-op); a
   Telegram ping either way (if TELEGRAM_* is set).

## Switches (Render env; all default OFF)
| Env | Effect |
|---|---|
| `DAILY_BLOG_ENABLED=1` | the 07:00 IST cron writes a post (otherwise /cron/daily-blog returns "skipped") |
| `DAILY_BLOG_AUTOPUBLISH=1` | a post that passes every check and scores ≥ the minimum publishes itself |
| `DAILY_BLOG_MIN_SCORE` | default 75 |
| `DAILY_BLOG_RESEARCH_MODEL` | optional; default GEMINI_MODEL / gemini-2.5-flash |

Suggested rollout: week 1 — ENABLED on, AUTOPUBLISH off: read each morning's draft in /admin/growth and
publish by hand. Week 2 — if the drafts are consistently good, AUTOPUBLISH on. Admin → Growth → Daily
post → "Preview (not saved)" runs the whole pipeline without saving, any time.

## Timing
News fetch 06:00 IST → blog 07:00 IST → pages revalidate hourly (ISR), so a published post is live by
08:00 IST. GitHub's scheduled runs can start up to ~15 minutes late; still before 08:00.

## Cost (per day, estimate)
Research (Gemini flash, grounded) ≈ free tier / a few cents; writer gpt-4o ≈ 4–8k tokens ≈ $0.03–0.06
(×2 if repaired); editor + critic on Groq ≈ ~0. Well under $0.20/day; counted by the daily budget.

## Risks and how they are handled
- **Google "scaled content abuse"**: one post a day, each built on sourced facts with visible
  citations, an interview angle no news site has, and a human publish gate until trust is earned.
- **Invented facts**: number check + citation check + critic; anything failing stays a draft.
- **AI disclosure**: each article ends with "Researched and drafted with AI, then checked against the
  sources above." Remove the sentence in app/insights/[slug]/page.tsx if the owner prefers.

## Gates (2026-10-04)
`python -m tests.test_daily_blog` 32/32; py_compile of routes/cron.py, routes/seo.py, daily_blog.py;
other backend suites unchanged (test_interviewer_mode / test_session_signals fail identically on the
untouched tree — pre-existing); `tsc --noEmit` EXIT 0; `next build` OK (copy); browser: a sample daily
post at /insights/<slug> on desktop + phone (no sideways scroll, Article + FAQPage JSON-LD, citations
link to sources), /insights reachable logged-out (200, was 307). **Not verified: a run with the real
models** (no keys in the build session) — use Preview in Admin → Growth after deploy.

## After merging
Set the env vars on Render when ready (nothing happens before). `git push` in both repos, then
`node .brain\sync.mjs` in consilio. The workflow needs the existing `API_BASE_URL` and `CRON_SECRET`
GitHub secrets (already used by daily-news.yml).

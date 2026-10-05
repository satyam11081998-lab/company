# ANTIGRAVITY_HANDOFF — daily-blog (Growth Agent: one sourced article a day on /insights)

**Author:** Claude (cloud session, Project "project"). **Dates:** 2026-10-04 (v1), 2026-10-06 (v2: fix + Telegram review).
**Owner asks:**
- 2026-10-04: a daily morning post on a trending, non-controversial business topic for the MBA audience, with
  facts and figures, not machine-sounding, with practice that brings readers to MECE.
- 2026-10-06: "it is not publishing — it says three sources can't be verified. Fix it properly; I want quality
  people refer to, like a Times of India or McKinsey article, useful to MBA aspirants too. If it can't find a good
  article, keep running until it does. Send it to me on Telegram for review; when I reply publish there, publish it."
**Branch:** `main` in both repos. Still OFF until `DAILY_BLOG_ENABLED` is set on Render.

```
touches:  consilio-backend
            EDIT services/growth/daily_blog.py      v2: research rebuilt, writer v2 (format 'daily-2'), keeps trying
            NEW  services/growth/telegram_review.py  draft to Telegram; publish / another / reject replies
            EDIT routes/cron.py                      /cron/daily-blog: rotates topics per run, late runs report failure
            EDIT routes/seo.py                       + POST /seo/telegram/webhook (Telegram, secret token),
                                                      + POST /seo/telegram/setup, + POST /seo/daily/send/{id} (admin)
            EDIT .github/workflows/daily-blog.yml    every 30 min 07:00–11:30 IST (no-op once today's post exists)
            EDIT tests/test_daily_blog.py            46 checks, stdlib only
          consilio
            EDIT lib/seo-pages.ts, app/insights/[slug]/page.tsx   renders 'daily-2' (key points, lede, what to watch,
                                                      "For MBA aspirants: GD, PI and WAT"); 'daily-1' and older pages unchanged
            EDIT app/insights/page.tsx               revalidate 3600 -> 300 (a post published from Telegram shows within minutes)
            EDIT app/(app)/admin/growth/growth-admin-client.tsx  Telegram status, "Connect replies", "Send today's
                                                      draft to Telegram again"
          database: none (seo_pages rows, kind='daily'; review state in agent_meta)
breaking: no. C4 (routes) additive: three new backend routes. No table or column changes.
```

## Why it never published (v1) — root cause
No live model access from the build sessions, so diagnosed from the code and the google-genai SDK types:
1. Facts were read only from lines that literally started with `FACT:`. Gemini usually writes `* **FACT:** …`,
   `1. FACT: …` or `- FACT - …`, so most or all facts were thrown away.
2. A fact was kept only if a Google grounding "support" segment matched its exact text. Segments often cover part
   of a sentence, so even correctly formatted facts were dropped.
3. No fallback when `GEMINI_MODEL` names a model that doesn't support Google Search grounding.
Result: "no topic had at least 3 sourced facts" every time.

## v2 research (services/growth/daily_blog.py)
- Facts parsed however the model formats them; each carries the publisher it names.
- A fact is **linked** to a real page by any of: the grounding supports (normalised text match), the publisher it
  names matched to a search result's domain/title (Economic Times → economictimes.indiatimes.com, RBI → rbi.org.in),
  or its figures found in the text of a page the search read. The news article itself is a linked fact.
- Facts the search returned but that can't be linked are kept as **attributed** (named source, no link), never more
  of them than linked ones; the writer must name the source in the sentence.
- Two searches (facts, then context: players, history, regulators) when the first is thin; research models fall back
  `DAILY_BLOG_RESEARCH_MODEL → GEMINI_MODEL → gemini-2.5-flash → gemini-2.0-flash`. A topic needs ≥ 3 linked facts.
- Checked against real `google-genai` response objects (the SDK's own types), not just fakes.

## v2 writing (the quality bar)
- Brief: stand next to Mint / ET Prime / The Ken explainers and McKinsey/BCG insight pieces. 1,000–1,400 words:
  key points, a news lede, 4–5 analytical sections (how the business works, who wins and loses, the debate), by the
  numbers, a named consulting lens applied to the story, what to watch, **For MBA aspirants: GD topic with both
  sides, PI questions, a WAT prompt, the case angle**, FAQ, numbered sources.
- Every number must come from a fact (only PI/WAT/case prompts may use estimation numbers); citations inline.
- Up to two repair rounds with the exact failed checks; anything still failing is shown to the reviewer.
- Writer: `DAILY_BLOG_WRITER_MODEL` (any OpenAI model name, e.g. a newer GPT) if set, else `seo_writer` (gpt-4o).

## "Keep going until there is an article"
- One run tries up to 8 topics (editor-ordered news first, then evergreen) within 8 minutes
  (`DAILY_BLOG_MAX_TOPICS`, `DAILY_BLOG_TIME_BUDGET_S`); a writer failure also moves on.
- The workflow runs every 30 minutes from 07:00 to 11:30 IST; each run starts further down the list; once today's
  post exists every run is a no-op. From 11:00 a failed run says so on Telegram. The reviewer can reply `another`.

## v2.1 (2026-10-06, after the first live run)
The first live run (Admin → Growth) skipped every topic: **both research models are retired on this key**
(`gemini-2.5-flash` → 404 "no longer available to new users", `gemini-2.0-flash` → 404 "no longer available").
`GEMINI_MODEL` isn't set on Render, so the list never reached the model the rest of the backend uses.
- Research models now: `DAILY_BLOG_RESEARCH_MODEL` → `GEMINI_MODEL` → the backend's own default
  (`services/ai_providers._GEMINI_LLM`, gemini-3.6-flash, the one GD briefs run on) → `gemini-flash-latest`
  → whatever the API lists for this key (`client.models.list()`, newest flash first, cached 1 h).
- A model that answers "not found / no longer available" is skipped for 6 hours (one failed call, not one per topic).
- If no Gemini model can search, **OpenAI's web search** (Responses API, `web_search` tool; `gpt-4.1` → `gpt-4o` →
  `gpt-4.1-mini`, or `DAILY_BLOG_OPENAI_SEARCH_MODEL`) does the research; its citations link the facts.
- Errors in the trace are short ("gemini-2.5-flash: not available on this key"); each topic shows the engine used.
- Checked on real google-genai and OpenAI SDK response objects; tests 49/49.
- Note: Prep Copilot's research (`services/copilot/research.py`) also defaults to gemini-2.5-flash; set
  `COPILOT_RESEARCH_MODEL` (or `GEMINI_MODEL`) before Copilot launches.

## Telegram review (services/growth/telegram_review.py)
- Each draft is sent in full to the admin chat (header with score, word count, sources, checks, why this topic;
  then the article; then "Reply publish …").
- Replies: `publish` (or /publish, approve, post it) → published at once and the live link comes back;
  `another` → draft dropped, a new one on a different topic arrives in 3–5 minutes; `reject` → dropped;
  `status`, `help`. A bare "ok" does NOT publish (it gets the help text). Replying to a draft's message acts on that
  draft; otherwise the newest draft waiting for review.
- Only the admin chat is obeyed. The webhook checks a secret token derived from the bot token; it registers itself
  the first time a draft is sent, at `RENDER_EXTERNAL_URL` (Render sets this) or `DAILY_BLOG_PUBLIC_API_URL`.
- If the admin chat is a group with bot privacy mode on, use `/publish` or reply to the draft message.

## Switches (Render env)
| Env | Effect |
|---|---|
| `DAILY_BLOG_ENABLED=1` | the morning runs write a post (otherwise /cron/daily-blog returns "skipped") |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | review on Telegram (same vars the Deck Vault alerts use) |
| `DAILY_BLOG_AUTOPUBLISH=1` | optional: publish without review when every check passes and the score ≥ min |
| `DAILY_BLOG_MIN_SCORE` | default 80 (only for auto-publish) |
| `DAILY_BLOG_WRITER_MODEL` | optional OpenAI model for writing |
| `DAILY_BLOG_RESEARCH_MODEL` | optional Gemini model for research |

## Gates (2026-10-06)
`python -m tests.test_daily_blog` 46/46 (topics, research parsing/linking/fallback, checks, repair, keep-going,
idempotency, Telegram publish/another/reject/duplicate/stranger chat); grounding extraction checked on real
`google-genai` response objects; webhook route checked with FastAPI's test client (no/bad secret → 403);
py_compile; `tsc --noEmit` EXIT 0; `next build` OK (copy); browser: a 'daily-2' sample article on desktop + phone
(Article + FAQPage JSON-LD, citations link to sources, aspirant section).
**Not verified here: a run against the live models and Telegram** (no network to them from the build sessions).
First run after deploy: Admin → Growth → Daily post → "Write today's post as a draft" — it should arrive on Telegram.

## After merging
`git push` in both repos, then `node .brain\sync.mjs` in consilio.

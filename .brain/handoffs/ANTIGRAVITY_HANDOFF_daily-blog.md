# ANTIGRAVITY_HANDOFF — daily-blog (Growth Agent: one sourced article a day on /insights)

**Author:** Claude (cloud session, Project "project"). **Dates:** 2026-10-04 (v1), 2026-10-06 (v2: fix + Telegram review; v3: essay-magazine design + Gemini pictures; v4: real photos, deeper essays, rewriting old posts).
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

## v3 (2026-10-06): essay-magazine design + Gemini pictures
**Owner ask:** "make it like Aeon essays visually … equal or better. Add photos and all, everything." and
"if image generation is needed, use Gemini only".

```
touches:  consilio-backend
            NEW  services/growth/images.py          Gemini-only image generation (no other provider), Pillow -> WebP
                                                     + 1200 px JPEG link preview, public Supabase Storage bucket `insights`
            EDIT services/growth/daily_blog.py      writer also returns topic, pull_quote and art direction (hero + 2 inline);
                                                     pictures made before the draft is saved; add_images() for older posts
            EDIT services/growth/telegram_review.py the draft arrives on Telegram with its hero picture first
            EDIT routes/seo.py                       + POST /seo/daily/images/{id} (admin, rate-limited, budget-checked)
            EDIT tests/test_daily_blog.py            59 checks
          consilio
            NEW  components/insights/parts.tsx, components/insights/ReadingChrome.tsx
            EDIT app/insights/[slug]/page.tsx, app/insights/page.tsx   the new reading experience (below)
            EDIT lib/seo-pages.ts                    SeoContent + hero, images, topic_label, pull_quote (all optional)
            EDIT app/og/route.tsx                    + kind=insight badge ("MECE Insights") for posts without a picture
            EDIT components/mobile-desktop-banner.tsx  not shown on /insights (articles are read on phones)
            EDIT app/(app)/admin/growth/growth-admin-client.tsx  "Add or redo pictures (Gemini)", hero thumbnail on a run
          database: none. Storage: bucket `insights` (public), created by the backend on first use.
breaking: no. C4 (routes) additive: one admin route. Content JSON additive; 'daily-1', 'daily-2' without pictures and
          the older news_case pages all still render.
```

### The design (after studying aeon.co essays)
Aeon: black stage with a large picture and caption, a big serif title and standfirst, one serif reading column,
pull quotes in the topic colour, word count and share row, related essays with pictures. MECE Insights now has all of
that, plus what an MBA reader needs that Aeon doesn't have:
- **Stage:** picture (16:9, capped at 62% of the screen so the title shows on a laptop), caption + "Image generated with
  Gemini" credit, topic label in its colour, Newsreader title, standfirst, byline. No picture → a typographic stage
  with a glow in the topic colour.
- **Meta bar:** date, word count, reading time; share to WhatsApp, LinkedIn, X, copy link. Reading-progress hairline.
- **Column (680 px, Newsreader ~20 px):** "In brief" (numbered key points), drop cap, section heads, pictures that
  break wider than the text (after the section the writer chose), pull quote, stat strip ("By the numbers"), the
  consulting lens as a numbered sidebar, What to watch, a tinted **For MBA aspirants** panel (GD topic, for/against,
  PI questions, WAT prompt, the case), a black "Could you crack this in an interview?" practise block with the related
  case, FAQ, numbered notes (citations are superscripts that jump to them), an author box, "More from MECE Insights"
  (same topic first).
- **Index:** masthead, lead essay large, "Sourced / Explained / Practised" strip, a 3-column grid of the latest nine,
  an archive list, a practise band. Topic colours: Strategy, Marketing, Finance, Operations, Technology, Economy,
  Careers. Posts without a picture get a cover in their topic colour with the MECE mark.
- **Dark mode** throughout (topic colours lifted for contrast). No horizontal scroll on a 390 px phone.
- **SEO:** title no longer doubles up ("X — MECE · MECE" from the root template; now "X | MECE Insights"); og:image is
  the hero's 1200 px JPEG (or a generated /og card); Article (+ image, section, word count), BreadcrumbList and
  FAQPage JSON-LD; CollectionPage + ItemList on the index. Article ISR 10 min (was 1 h) so added pictures show soon.

### Pictures (services/growth/images.py)
- The writer (same call, no extra model call) returns art direction: a hero and two inline scenes, each with alt
  text and a caption. One house style for every picture: documentary editorial photography, India, natural light,
  **no text, logos, brands or recognisable real people**.
- Model: `DAILY_BLOG_IMAGE_MODEL` if set, else the newest `gemini-*image*` model this key lists, else
  `gemini-2.5-flash-image`. Retired models are skipped for 6 h. Three pictures are made in parallel.
- Stored in Supabase Storage, bucket `insights`, public, `{slug}/hero-0-xxxx.webp`, `{slug}/og-xxxx.jpg`,
  `{slug}/inline-n-xxxx.webp` (cache one year; new names when regenerated).
- Never blocks a post: no key, no model or a failed upload means an article without that picture (the errors are kept
  in `agent_meta.image_errors` and shown on the admin run).
- Older posts: Admin → Growth → Daily post → "Add or redo pictures (Gemini)" (plans the art from the article if it
  has none, and fills in the topic label).
- The notes say the pictures are generated and illustrative.
- **Cost:** image calls are not counted in the daily AI budget (`assert_daily_budget` gates the route, but the
  image tokens aren't logged). Three images a day; watch the Gemini bill the first week.

### Gates (v3)
`python -m tests.test_daily_blog` 59/59 (adds: art direction kept out of the page, pictures attached, a dry run
makes none, house style + aspect ratios, WebP + 1200 px OG JPEG, a failed picture never breaks the article,
add_images on an older post + topic label); py_compile; `tsc --noEmit` EXIT 0; `next build` OK (copy); browser
(Playwright, sample data with placeholder pictures): article + index, desktop 1440 and phone 390, light and dark, no
horizontal overflow, og:image 1200×675, JSON-LD Article/BreadcrumbList/FAQPage.
**Not verified here:** a live Gemini image call and the Storage upload (no network to them from the build sessions).
First check after deploy: Admin → Growth → "Write today's post as a draft" → the Telegram draft should start with
the picture; or "Add or redo pictures" on today's post.

## v3.1 (2026-10-06): a way in — nav link and breadcrumbs
**Owner ask:** Insights had no way in from the site. "Move Case Competitions to More, and add an Insights button on
the navigation bar at the top instead."

```
touches:  consilio
            EDIT components/app-nav.tsx          bar: Dashboard | Practice▾ | GD Briefs▾ | Industry Primers▾ | Insights | More▾
                                                  (Case Competitions now leads the More menu; India accounts only, as before)
            EDIT components/mobile-bottom-nav.tsx More sheet: Insights first, then Case Competitions
            EDIT components/insights/parts.tsx    + Crumbs (visible breadcrumb)
            EDIT app/insights/[slug]/page.tsx     MECE › Insights › title on the stage (matches the BreadcrumbList JSON-LD)
            EDIT app/insights/page.tsx            MECE › Insights, + BreadcrumbList JSON-LD
breaking: no. No CONTRACTS surface (the nav isn't in CONTRACTS.md).
```
Gates: `tsc --noEmit` EXIT 0; `next build` OK (copy); browser: breadcrumbs on article and index, desktop and phone
(title truncates on a phone, no horizontal overflow). The logged-in nav wasn't rendered in the build copy (it needs a
signed-in user); the change is two list entries in the existing render code.
Not changed: the landing page header (`components/home/home-header.tsx`, logged-out visitors) has no Insights link yet.

## v4 (2026-10-06): real photos, deeper essays, rewriting the old posts
**Owner ask (after the v3 deploy):** "no photos are being generated, and the insights are very shallow, not much
information, looking AI. Make it better" and "or take open source photos strictly related to the topic".
What the live site showed: every post had the grey fallback cover (all were written before v3, and the old
"Generate a draft" path never made pictures), and most posts were the old one-shot `news_case` breakdowns
(headline-only, ~600 words, colon titles, "Learn to analyze…" deks).

```
touches:  consilio-backend
            EDIT services/growth/images.py          + real photos: Wikimedia Commons + Openverse search (CC0, public
                                                     domain, CC BY, CC BY-SA only; no logos/maps/small files), a Gemini
                                                     vision judge (strict: must show the subject), credit + licence links;
                                                     Gemini generation only for slots no photo fits; + diagnose()
            EDIT services/growth/daily_blog.py      research: 3rd pass (trend, financials, unit economics, comparison,
                                                     attributed statements), up to 24 linked facts, needs 6 to write;
                                                     writer v3 (thesis-led essay, 1,600-2,000 words, title/dek/heading
                                                     rules, before/after voice examples); + line-edit pass; stricter checks
                                                     (colon titles, "Learn to" deks, label headings, thin sections, adverb
                                                     openers, more stock phrases, cite >= 10 facts); writer = newest Gemini
                                                     Pro on the key (DAILY_BLOG_WRITER_MODEL overrides; gpt-4o last);
                                                     critic on Gemini; + compose/illustrate, write_on, rewrite_page,
                                                     drop_rewrite, backfill_images; publish_page applies a pending rewrite
            EDIT services/growth/telegram_review.py rewrites of live posts are reviewed like drafts ('reject' drops only
                                                     the rewrite); old never-sent drafts are no longer 'publish' targets
            EDIT routes/seo.py                       /seo/generate now runs the essay pipeline (def, not async);
                                                     + POST /seo/daily/images/test, /seo/daily/images/backfill,
                                                     /seo/daily/rewrite/{id}, /seo/daily/apply/{id}, /seo/daily/drop-rewrite/{id}
            EDIT .github/workflows/daily-blog.yml    curl --max-time 1500, job timeout 30 min (essays take longer)
            EDIT tests/test_daily_blog.py            89 checks
          consilio
            EDIT lib/seo-pages.ts                    SeoImage: source, creator, site, credit_url, license, license_url;
                                                     SeoPage.agent_meta (admin only, never in the public select)
            EDIT components/insights/parts.tsx       + Credit (photographer, source link, licence link); topic inferred
                                                     from title/keywords for posts without a label (colour covers)
            EDIT app/insights/[slug]/page.tsx        credits under pictures; notes say which pictures are photos/generated
            EDIT app/(app)/admin/growth/page.tsx, growth-admin-client.tsx
                                                     per post: "Rewrite as a full essay", "Add/Redo pictures", a waiting
                                                     rewrite with "Put the rewrite live" / "Drop it"; Daily panel: "Test
                                                     pictures" (photo search, Gemini models, a test image, storage) and
                                                     "Add pictures to older posts" (3 per click); copy updated
          database: none (agent_meta keys: pending_rewrite, previous_version, rewritten_at, edited)
breaking: no. C4 (routes) additive; /seo/generate keeps its request and response shape (returns the saved page) but
          takes minutes now and writes the essay format.
```

### Pictures, in order (DAILY_BLOG_PICTURES, default `photos,gemini`)
1. **Real photo**: the writer names the subject and 2-3 Wikimedia Commons queries per slot (proper names: "Bombay
   House Mumbai"). Candidates from Commons (`filetype:bitmap`) and Openverse (`license_type=commercial,modification`,
   photographs). A Gemini vision model sees up to 8 thumbnails with the article title and the subject and picks one
   only if it shows that subject (logos, maps, charts, screenshots, text, close-up portraits rejected; "none" is a
   valid answer). Downloaded, resized, re-hosted in the `insights` bucket. Credit: "Photo: creator / site, licence"
   with links to the file page and the licence. Two slots never share a photo.
2. **Gemini** for any slot still empty (house style, credited as generated). Tries `["IMAGE"]`, then `["TEXT","IMAGE"]`
   modalities. Errors per model are kept in `agent_meta.image_errors` and shown in Admin.
- Older posts: Admin → Growth → "Add pictures to older posts" (3 per click) or per post "Add pictures". Plans the
  photo search from the article if the post has none.
- **Not verified from the build sessions:** live calls to Commons, Openverse, Gemini image/vision models and Storage
  (no network to them). Admin → Growth → "Test pictures" reports each one in a click — run it first after deploy.

### Rewriting the old posts
- Per post "Rewrite as a full essay": re-researches the post's own topic/headline, writes the essay, line-edits,
  checks, adds photos. Same slug (links keep working).
- A **live** post keeps its current version; the rewrite waits in `agent_meta.pending_rewrite`, goes to Telegram
  ("rewrite of a live post"), and goes live on `publish` there or "Put the rewrite live" in Admin. The date stays; the
  old version is kept in `agent_meta.previous_version` for rollback. `reject`/`another` on a rewrite drops only the rewrite.
- A **draft** is rewritten in place and sent for review.
- If the research finds fewer than 6 linked facts the post is left exactly as it was.

### Gates (v4)
`python -m tests.test_daily_blog` 89/89 (adds: title/dek/heading/thin-section/adverb checks, whole-word stock-phrase
matching, the line edit kept or thrown away, writer model order, Commons + Openverse parsing and licence filter, the
strict photo judge with Gemini fallback, no duplicate photos, rewrite of live/draft posts, apply keeps link and date,
nothing changes without facts, "Generate a draft" through the pipeline, picture backfill, Telegram rewrite review);
py_compile; route order checked (`/daily/images/test` before `/daily/images/{id}`); `tsc --noEmit` EXIT 0;
`next build` OK (copy); browser: photo credit with links, notes wording, topic colours on unlabelled posts.

## After merging
`git push` in both repos, then `node .brain\sync.mjs` in consilio.

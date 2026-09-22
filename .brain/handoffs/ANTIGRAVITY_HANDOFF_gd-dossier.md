# ANTIGRAVITY_HANDOFF — gd-dossier (Cowork brain, 2026-09-22) — 2 REPOS

**Feature:** GD Briefs → **GD Dossiers**. Replace the 10-headline / one-page-brief
surface with a clustered *story* pipeline, a transparent per-domain score, a
source-backed fact table and a multi-section dossier that ends in a scored
rehearsal.

**touches:** backend `services/{news_fetcher,news_pipeline,headline_classifier,brief_generator,ai_providers}.py`
(+8 new service modules), `routes/news.py` (additive endpoints), `scripts/gd_feed_probe.py` (new),
`.github/workflows/daily-news.yml`; frontend `app/(app)/gd-briefs/*`, `lib/{api,types}.ts`,
`supabase/migrations/0064_gd_dossier.sql` (new, additive only).

**breaking:** **no** — nothing existing is removed or renamed. Two contract
surfaces are *touched additively* and need your yes before Phase 6 lands:
**C4** (new routes under `/news/*`) and **C1** (`news_headlines` gains one
nullable column `story_id`; the table's shape that `cases.source_brief_id` and
`daily_schedule.brief_headline_id` depend on is untouched). `gd_briefs` is left
exactly as it is and keeps being written, so the **GD Cheat Sheet stays a valid
reader of `data_points`** (LEDGER line 28) with zero changes.

**Design target:** the worked dossier page (Tata Sons, 17 Sep 2026 board vote)
published alongside this handoff. Build to that, not to a description of it.

---

## 0. Adversarial findings on the current pipeline — read first

These are verified, not assumed. Several of them mean the feature is not
currently doing what the product page says it does.

### F1 · NewsAPI's free plan forbids exactly what we use it for, and is 24h stale
newsapi.org/pricing, Developer plan, verbatim: *"100 requests per day"*,
*"Articles have a 24 hour delay"*, and it *"may be used for development and
testing in a development environment only, and cannot be used in a staging or
production environment (including internally)."*
Consilio takes money through Razorpay — this is a production commercial service.
So: (a) licence exposure, and (b) **"today's most debate-worthy stories" is
structurally yesterday's news**, because `sortBy=publishedAt` on a feed that is
delayed a day can only ever return day-old articles. **Action: remove NewsAPI.**

### F2 · GNews free caps at 10 articles per request — our code asks for 25
gnews.io/pricing, Free plan: *"100 requests per day"*, *"Up to 10 articles
returned per request"*, *"30 days historical data"*, *"For development and
testing purposes"*.
`news_fetcher.fetch_from_gnews` passes `max = max_results // len(GNEWS_TOPICS)`
= `50 // 2` = **25**, which the plan silently truncates to 10. Two topics → 20
articles per page-loop iteration, before dedup. That single line explains most
of why the page shows ~10 headlines. Pagination beyond page 1 is not a free-plan
capability either, so `page += 1` in `news_pipeline.run_news_refresh` mostly
re-requests the same 10 items and burns quota against the 100/day cap.
**Action: remove GNews too.** Neither key is worth a paid tier — see F3.

### F3 · Neither key is in the backend `.env` on this machine
`consilio-backend/.env` contains `GEMINI_API_KEY`, `OPENAI_API_KEY`, Supabase and
Drive keys — and **no `GNEWS_API_KEY`, no `NEWSAPI_KEY`**. If Render's env is the
same, `fetch_all_headlines()` logs two warnings, returns `[]`, and the
self-heal path in `ensure_fresh_headlines()` has been re-running a fetch that
can never succeed. **Verify on Render before anything else** — if the keys are
absent there too, the news surface has been living on whatever rows were
inserted the last time a key existed.

### F4 · The briefs invite the model to make numbers up
`brief_generator.BRIEF_SYSTEM_PROMPT`, verbatim: *"If unsure of exact figure,
give a defensible ballpark with the source."* We then render those strings under
the heading **"Data points to cite — concrete numbers with attribution, drop
these to sound credible"**, and let the student save them to a cheat sheet they
carry into a placement GD.
This is the single largest risk in the product. A candidate who quotes a
plausible-but-wrong figure at an IIM panel and gets challenged does not blame
the model. Fixing it is not a prompt tweak — it is Phase 4 + Phase 5's validator
below, and it is also the strongest thing we can put on a pricing page.

### F5 · Deduplication cannot see the same story twice
`deduplicate_headlines()` matches on exact `source_url`; `list_headlines()`
additionally matches on lowercased exact title. Five outlets reporting one board
vote produce five different URLs and five different titles, so all five survive
as separate "headlines" — which both wastes the 10 visible slots and throws away
the most valuable signal we have (*how many independent outlets picked this up*).
Clustering is not a nice-to-have; it is the thing that converts more volume into
more quality instead of more noise.

### F6 · Generation in the request path will not survive a deeper brief
`POST /news/briefs/{id}` generates synchronously; the frontend allows 90s
(`lib/api.ts`). One gpt-4o call at `max_tokens: 1600` fits. A ten-section dossier
does not — and the first user to click would eat the entire latency. Dossiers
must be generated by the cron and *read* by the request path.

### F7 · Gemini free tier cannot be the only path
Google no longer publishes fixed free-tier numbers — `ai.google.dev/gemini-api/docs/rate-limits`
now says limits *"depend on a variety of factors (such as your usage tier)"* and
sends you to AI Studio to see your own. Our own `deck_ai_gemini.py` already
throttles to ~13 req/min to dodge 429s, and already auto-discovers the model name
because Google retired `gemini-2.0-flash` under us. So: Gemini is the right
**default** for bulk work and a fine default for dossier prose, but it needs
(a) the existing `chat_with_fallback` chain extended to three providers, and
(b) a **buffer** — yesterday's dossiers stay live — so a 6 a.m. quota wall never
produces an empty page.

### F8 · Smaller ones, worth fixing while we are in here
- `check_brief_access` free-tier branch does read → insert → re-read → delete on
  race. Two concurrent requests can both delete. Use a single
  `insert … on conflict do nothing` plus a count check, or an advisory lock.
- `routes/news.py` `BriefResponse` cache-hit branch:
  `b.get("opening_lines") or [b.get("how_to_open")] if b.get("how_to_open") else []`
  — Python parses this as `(A or B) if C else []`, so when `how_to_open` is empty
  the stored `opening_lines` are **dropped**. The GET branch lower down has the
  brackets right. Fix the POST branch.
- `filter_top_headlines(classified, top_n=50, min_score=75)` is called with
  `top_n=50` then the caller re-trims to 20 — the 10 in the docstring, the 50 and
  the 20 disagree; pick one.
- Scraping article *bodies* from ET/Mint/Moneycontrol is off the table: ToS,
  and Render's egress IP gets blocked within days. RSS summary + link-out only.

---

## 1. What we are building instead — the shape

**One pool, many lenses.** Ingest wide from free publisher RSS and primary
sources; cluster into stories; score each story on measured signals plus a
judged rubric; score it again *per domain*; generate one dossier per story,
shared by all users; end every dossier in a scored 60-second rehearsal.

Why this earns money where a longer brief would not:

1. **Volume without cost.** RSS is free and uncapped. 25 feeds × ~25 items is
   500–600 items/day against today's ~20, and clustering turns that into ~40
   distinct stories instead of 600 lines of noise.
2. **Trust as the feature.** Every number carries its outlet and date, and a
   confidence mark earned by corroboration, not by tone. A student can say *"the
   board vote was 4:1, Business Standard, 17 September"* and mean it. Nothing
   else in this market does that.
3. **Depth that survives an interview.** Second-order consequences, steelmanned
   positions attributed to who actually argues them, frameworks *worked* rather
   than named, precedent, and the trap everyone else will walk into.
4. **Practice, not reading.** The rehearsal goes through the scoring engine we
   already have. Reading is not measurable; a score is. That is the thing people
   renew for.

**The aha, stated precisely:** *open one story and in eight minutes hold your own
against someone who has read five newspapers for a month* — and the moment lands
when they hover a figure and a real source is behind it, then speak for sixty
seconds and get told which two of the five citable numbers they failed to use.

---

## 2. Data model — migration `0064_gd_dossier.sql` (additive, idempotent)

```
news_sources        registry, not a constant. id, name, kind('rss'|'primary'|'api'),
                    url, homepage, weight numeric default 1.0, domain_hints text[],
                    enabled bool default true, consecutive_failures int default 0,
                    last_ok_at timestamptz, last_error text
news_items          raw ingest. id, source_id fk, title, summary, url unique,
                    image_url, published_at, fetched_at, lang, raw jsonb,
                    story_id fk null, content_hash text
gd_stories          id, slug unique, title, standfirst, gd_type,
                    first_seen_at, last_seen_at, status('active'|'cold'|'suppressed'),
                    composite_score int, score_breakdown jsonb, domain_scores jsonb,
                    entities text[], outlet_count int, item_count int,
                    primary_doc_count int
gd_story_items      story_id, item_id, is_primary bool, similarity numeric  (pk pair)
gd_facts            id, story_id fk, figure_text, value_norm numeric null, unit text,
                    what_it_is text, confidence('verified'|'single'|'claim'),
                    source_item_id fk, source_name, source_url, reported_at,
                    corroborating_item_ids uuid[]
gd_dossiers         id, story_id fk, version int, depth('L1'|'L2'|'L3'),
                    sections jsonb, model text, prompt_version text,
                    validator_report jsonb, generated_at
                    unique(story_id, version)
gd_drills           story_id fk, questions jsonb, rehearse_prompt text
gd_story_events     user_id, story_id, section, action, created_at   -- analytics + streaks
news_headlines      + story_id uuid null references gd_stories(id)   -- ONLY change
```

Rules that keep this non-breaking:
- `news_headlines`, `gd_briefs`, `gd_brief_unlocks`, `abstract_briefs`: **no
  column dropped, renamed or retyped.** `cases.source_brief_id` and
  `daily_schedule.brief_headline_id` (C1) keep resolving.
- After each dossier is generated, write a **compatibility `gd_briefs` row** for
  the story's lead headline: `data_points` = the `gd_facts` rows rendered as
  "figure — what it is (source, date)". The cheat sheet keeps working untouched,
  and every saved point is now a sourced one.
- RLS: `news_sources` and `gd_story_events` are service-role write only.
  `gd_stories`, `gd_facts`, `gd_dossiers` select-only for signed-in users; tier
  gating stays in the route layer, as it is today.

---

## 3. Phases and gates

Each phase lands on its own and is independently verifiable. Do not start a
phase until the previous phase's gate is green.

### Phase 0 — find out what actually works from Render's IP
Neither the Cowork sandbox nor the desktop bridge can reach news hosts, so the
source roster could not be settled from here. `scripts/gd_feed_probe.py` (shipped
with this handoff) does it empirically: it fetches every candidate feed, reports
HTTP status, item count, whether items carry summaries, median item age and
whether the feed advertises full text, then prints a ready-to-paste
`news_sources` seed INSERT for the ones that pass.

Run it **on Render** (`render shell` or a one-off job), not locally — the point
is what that IP can reach.

Candidate roster to probe (feeds verified reachable from this session are
marked ✓; the rest are unverified from here and exist to be probed, not trusted):

| Kind | Source | Note |
|---|---|---|
| primary | RBI press releases — `rbi.org.in/pressreleases_rss.xml` | ✓ valid RSS, 10 items, same-day |
| primary | SEBI — `sebi.gov.in/sebirss.xml` | ✓ valid RSS, 31 items (heavy on recovery notices — weight low, filter by type) |
| primary | PIB, PRS Legislative, MoSPI, TRAI, CCI orders | probe |
| press | Business Standard — economy-policy, companies, markets, opinion | ✓ 30–35 items/feed, with summaries |
| press | The Hindu BusinessLine, The Hindu business, Financial Express, Mint, Moneycontrol, NDTV Profit, Economic Times | probe each; several are blocked from *this* session's tooling, which says nothing about Render |
| global | Reuters India, World Bank blogs, IMF blogs, BIS speeches | probe — these carry the "India in the world" framing panels like |

Weighting: primary 1.5, national business daily 1.0, aggregator 0.6. A source with
`consecutive_failures >= 3` auto-disables and posts to the existing Telegram
notifier. **The roster lives in the DB, not in a Python constant** — the current
hardcoded `INDIAN_DOMAINS` string is exactly the thing that cannot be fixed
without a deploy.

**Gate 0:** probe output shows ≥ 12 sources returning ≥ 10 items each with
summaries present, and ≥ 3 of them primary. Paste the seed INSERT into the
migration. If fewer than 12 pass, stop and tell me before Phase 1 — the whole
design assumes breadth.

### Phase 1 — ingest (no AI at all)
`services/news_ingest.py`. Parse each enabled feed with `feedparser` (add to
requirements), normalise to `news_items`, dedupe on `url` and on a
`content_hash` of `normalise(title)`. Records every attempt in
`news_refresh_log` as today. Runs from the existing `/cron/fetch-news` route so
the GitHub Action does not change yet.
- Respect `<lastBuildDate>` / ETag where offered; never re-download unchanged feeds.
- Store title + summary + URL only. **No article body.** (F8)
- Hard cap 1,500 items/day as a runaway guard.

**Gate 1:** one manual run inserts ≥ 300 items from ≥ 12 sources, zero AI calls,
zero cost, `py_compile` EXIT 0. Log the per-source counts.

### Phase 2 — cluster into stories (still no AI)
`services/story_cluster.py`. Within a rolling 96-hour window: TF-IDF over title +
summary with an Indian-business stopword list, cosine similarity, plus a shared
named-entity bonus (capitalised multi-word tokens, ticker names, a curated
company/regulator list). Single-link agglomeration at a tuned threshold; a new
item joins the best cluster above threshold or starts its own.
- Story title = the highest-weighted source's headline; standfirst = generated
  later in Phase 5.
- `outlet_count` = distinct sources, not items. This is the number that matters.
- A story stays `active` while it gains items; goes `cold` after 96h idle.
  **A cold story that gains a new item reopens** — that is what makes running
  stories, and running stories are what bring people back.

**Gate 2:** on a real day's ingest, ≥ 300 items collapse to 30–60 stories; spot
check 10 clusters by hand and report precision. Unit test: a fixture of 6
hand-written variants of one story must land in exactly one cluster, and 2
unrelated items must not join it.

### Phase 3 — scoring, transparent and per-domain
`services/story_score.py`. Composite out of 100 = **measured 50 + judged 50**.

Measured (deterministic, free, reproducible):
- source breadth /20 — distinct outlets, log-scaled, weighted by source weight
- recency /10 — decay on `last_seen_at`, with a bump for a story still moving
- citable-number density /10 — count of extractable figures per Phase 4
- primary-document backing /10 — is a primary source in the cluster

Judged (one batched LLM call per ~20 cluster heads, cheap provider):
five axes 0–5 — *two defensible sides*, *stakeholder spread*, *maps to a B-school
concept*, *a panel would actually ask it*, *still relevant in 3 months*.

Then **domain scores**: the same story scored 0–100 for each of the eight
`lib/cheat-domains.ts` ids (`finance`, `marketing`, `strategy`, `operations`,
`economy`, `technology`, `people`, `general`) — reuse that taxonomy exactly, do
not invent a parallel one. Add `sustainability` and `geopolitics` only if you
also add them to `cheat-domains.ts` in the same commit, so the cheat sheet and
the briefs never disagree about what a domain is.

The breakdown is **stored and shown to the user** (see the design target's score
panel). A visible weak signal is a feature: it is what makes the strong ones
believable.

**Gate 3:** score 40 real stories; the top 10 by composite are all plausibly
GD-worthy on a human read, and the bottom 10 are all plausibly not. Per-domain
top-5 lists differ materially from each other — if Finance and Marketing return
the same five stories, the domain scoring is not doing anything and needs
re-weighting before Phase 4.

### Phase 4 — facts, extracted then corroborated (this is the trust layer)
`services/fact_extract.py`. **No model invents a number at any point.**
1. Regex + unit pass over the *fetched text we actually hold* (title + summary
   of every item in the cluster): percentages, ₹/Rs with lakh/crore, $ with
   mn/bn/tn, bare dates, ratios (`4:1`), basis points, multiples.
2. Normalise to a comparable value where possible (₹25,000 crore → 2.5e11).
3. A model is used for exactly one thing: writing the `what_it_is` label for an
   already-extracted figure. It is never shown the task of producing figures.
4. Confidence:
   - `verified` — the normalised value appears in items from ≥ 2 distinct sources,
     or in a primary-source item
   - `single` — one source
   - `claim` — the sentence attributes it to a named person or is future-tense
     ("will reach", "projected", "targets"). Projections are never `verified`,
     however many outlets repeat them.
5. Every row keeps `source_url` and `reported_at`. Rows with no usable source are
   dropped, not downgraded.

**Gate 4:** on 10 stories, hand-check every extracted fact against its source
URL. Required: **zero facts whose figure does not appear in the linked source**.
Not "few" — zero. This gate is the product.

### Phase 5 — dossier generation, in the cron, with a validator
`services/dossier_generator.py`. Ten sections, generated as separate calls so one
failure does not lose the dossier, then assembled into `gd_dossiers.sections`:

`hook` (L1, free) · `story_and_timeline` · `numbers` (rendered from `gd_facts`,
**not generated**) · `stakeholders_and_chain` · `both_sides` · `frameworks` ·
`precedent` · `speak_kit` · `pi_angles` · `glossary` · `drill`

Routing by section, through `ai_providers.FEATURES` (add a `gd_dossier` feature
with `providers: ["gemini","groq","openai"]`, default `gemini`):
- mechanical sections (glossary, timeline, drill, pi_angles) → cheap/free tier
- prose sections (both_sides, frameworks, speak_kit) → best available
- `numbers` → **no model call at all**

Extend `chat_with_fallback` to walk a chain rather than a single fallback:
`gemini → groq → openai`, logging which one served. `deck_ai_gemini.py` already
has the throttle and the model auto-discovery — lift both rather than rewriting
them.

**The validator — `services/gd_fact_guard.py`, the gate on everything generated.**
After each section returns, extract every numeric token from the prose and
require a match in that story's `gd_facts`. Unmatched → regenerate the section
once, naming the offending figures; still unmatched → strip the offending
sentence and record it in `validator_report`. Ordinals, section numbering and
figures quoted inside an attributed claim are whitelisted.

**Gate 5:**
- unit test `test_fact_guard.py`: a fixture dossier with a planted fabricated
  figure **must fail** the guard; the same fixture with the figure present in
  `gd_facts` must pass. This test is the one I would not ship without.
- 12 dossiers generated end-to-end in a single cron run inside Render's timeout,
  with per-section latency and provider logged.
- `validator_report.unverified_count == 0` on all 12.
- measured cost per dossier recorded, and the daily total checked against
  `assert_daily_budget()`.

### Phase 6 — API and frontend
Backend, additive to `routes/news.py` (C4 note, additive):
```
GET  /news/stories?domain=&limit=       list, domain-ranked, L1 always readable
GET  /news/stories/{slug}               dossier; sections gated by tier
GET  /news/stories/{slug}/facts         the fact table (Lite+)
POST /news/stories/{slug}/rehearse      returns a scored rehearsal (Pro)
GET  /news/headlines                    UNCHANGED — keep it serving the old shape
```
Keep `/news/headlines`, `POST|GET /news/briefs/{id}` and `/news/abstract-brief`
working exactly as they do. Nothing that reads them may break during rollout.

Frontend:
- `/gd-briefs` becomes a story list with a **domain rail** (the eight
  `CHEAT_DOMAINS`, user's own domain preselected from their profile), each row a
  L1 card showing outlet count, score and the one number.
- `/gd-briefs/[slug]` is the dossier, tabbed exactly as the design target.
  Deep-link with a bare `#tab` token.
- Free tier: all L1 cards readable, one full dossier lifetime (the existing
  `gd_brief_unlocks` ladder carries over unchanged). `source_url` blanking for
  free stays as it is, but **outlet name and count still show** — the
  credibility signal is the hook, and hiding it hides the reason to upgrade.
- Fact rows keep the existing `AddToCheatSheetButton`, now saving a sourced string.

**Gate 6:** `tsc --noEmit` EXIT 0, `npm run build` completes **on the real tree**
(it exceeds the sandbox timeout — same limit noted for certificates and
voice-interview in STATE), `py_compile` EXIT 0, and the old `/gd-briefs` route
still renders from `gd_briefs` for a story that has no dossier yet.

### Phase 7 — the loop that creates the habit
- **Rehearse**: the 60-second spoken answer goes through the existing interview
  scoring path. Rubric: structure, evidence used (*how many of this story's
  `gd_facts` did you actually cite* — computable, and the line that makes people
  come back), counter handled, position committed, filler.
- **Evidence locker**: the cheat sheet, grouped by domain, showing how many
  sourced facts you hold per domain and where you are thin.
- **Running stories**: a story you have opened that gains a new item surfaces
  again with what changed.
- **Three-minute daily**: three L1 cards and one drill question. Streak.

**Gate 7:** rehearsal returns a score for 10 recorded attempts with the
evidence-used count matching a hand count.

### Phase 8 — metering and guard rails
Free: all L1 + 1 lifetime dossier (unchanged). Lite: 3 dossiers/day + drills.
Pro: unlimited + rehearsal scoring + weekly prep pack.
Dossiers are per-story and shared, so **cost scales with the news, not with
users** — the metering exists for conversion, not for cost control. Keep
`assert_daily_budget()` in front of every generation path, and keep yesterday's
dossiers live as the buffer if a provider chain fails.

---

## 4. What I could not settle from here, and who has to

1. **Whether GNews/NewsAPI keys exist in Render's env.** (F3) Check before
   anything; it changes whether the current surface has been live at all.
2. **Which feeds Render's IP can actually reach.** Both environments available to
   this session are egress-restricted; `gd_feed_probe.py` exists precisely
   because I refuse to hand you a hardcoded source list I could not test.
3. **This account's real Gemini free-tier quota.** Google publishes it per-account
   in AI Studio now, not in the docs. Read it off AI Studio, then set
   `GEMINI_MIN_INTERVAL_SEC` from the actual RPM rather than the 4.5s guess
   inherited from the deck pipeline.
4. **Whether to add `sustainability` and `geopolitics` to `CHEAT_DOMAINS`.** Your
   call — it is a cheap change but it touches a shared constant that the cheat
   sheet reads.

---

## 5. Build order, shortest path to something you can look at

Phase 0 → 1 → 2 gives you a real clustered story list with zero AI spend and
answers the only question that matters early: *does this actually produce 40 good
stories a day?* If it does not, nothing downstream is worth building. Phase 4 +
the Gate 5 fact-guard test is the second decision point — if we cannot hold
"zero unsourced numbers", we should not put a fact table in front of a paying
student at all, and the feature should stay a brief.

`git pull` before starting; `git push` + `node .brain\sync.mjs` when done. I have
not touched STATE.md, CHANGELOG.md, LEDGER.md or CONTRACTS.md — the C1 and C4
notes above are proposed, and need your yes.

---

## 6. What is already in the tree (landed 2026-09-22, frontend only)

Topic Radar ships as a curated-content route in the same shape as the Abstract GD
track: typed data in `lib/`, pages that render it, backend swapped in later
without the UI changing. Nothing existing was removed.

**New**
- `lib/gd-topics.ts` — types + the seeded bank. 8 propositions on the board, one
  (`upi-merchant-fee`) carrying a complete brief: the month-long trail, the
  what-changed panel, 13 sourced facts, five steelmanned positions, three worked
  frameworks, the speak kit, four drills, glossary.
- `app/(app)/gd-briefs/radar/page.tsx` — the board. Domain filter off
  `CHEAT_DOMAINS`, "moving now" vs "comes up every season", updates-this-week,
  and an honest empty state for a filtered-out domain.
- `app/(app)/gd-briefs/radar/[slug]/page.tsx` — the brief. Eight tabs; tab 2
  (**What's moved**) is the evidence layer: since-you-last-looked, the phase
  strip, the dated trail with pinned anchors, the open-questions ledger with one
  answered and struck through, who-hasn't-spoken, and bridges to other topics.
  Free tier gets tab 1; the rest is Lite+.

**Changed (additive)**
- `components/app-nav.tsx` — `GD_LINKS` gains `Topic Radar` **between** News
  briefs and Abstract GD, with an explicit `active` (`/gd-briefs` is a prefix of
  `/gd-briefs/radar`, so without it the wrong item lights up).
- `app/(app)/gd-briefs/page.tsx` — a primary entry point to the radar beside the
  existing abstract link. The existing page is otherwise untouched.

**Gates**: `npx tsc --noEmit` **EXIT 0** after every change. `npm run build` was
started on the real tree but exceeds the tool timeout on the mounted filesystem —
the same limit recorded in STATE for certificates and voice-interview. Check
`consilio/build.log`, or run it yourself, before deploying.

### The one rule that governs every string on those pages
**The reader never sees how topics are chosen.** No score, no rubric, no axis, no
cluster, no confidence taxonomy. It is all translated:

| Internal | What the reader sees |
|---|---|
| composite / axis scores | nothing — running order, plus one human line: *why it's here* |
| live vs evergreen tier | "Moving now" / "Comes up every season" |
| `verified` / `single` / `claim` | "Safe to quote" / "One report" / "Name the source", each with a one-line hint |
| lifecycle phase | "Just announced -> Objections in -> Facts firming up -> Decision due -> Playing out", each showing the question a panel asks in that phase |
| evidence attached to a topic | "Everything that moved this argument" |
| unattached / low-confidence topic | "Brief in preparation — we open one once both sides have been argued on the record by someone we can name" |

Keep that table in front of you when the backend lands: it is easy to leak
pipeline vocabulary into a UI string, and the moment it leaks the page stops
feeling like a product and starts feeling like a dashboard.

### What the backend has to do to replace the seed
`GD_TOPICS` is the contract. Phases 2-6 fill exactly these fields — `trail`,
`changed`, `openQuestions`, `facts`, `silent`, `bridges`, `phase` — and the pages
need no change. `changed` is computed per reader from their last visit
(`gd_topic_events`), which is the only field the seed cannot fake; until then it
is authored.

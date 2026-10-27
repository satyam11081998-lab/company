# ANTIGRAVITY_HANDOFF — insights-pictures-and-seo

**Author:** Claude (Cowork session, device-linked to `D:\dev\mece`). **Date:** 2026-10-27.
**Owner ask:** "in the daily insights that I publish, no photo gets generated … fix the previous already generated
insights, put the photos, and in the new ones there should be the relevant photos" + "see whether this is SEO
friendly or not, whether it is findable or not" + "adversarial check everything".
**Branch:** `main` in both repos. Not pushed — owner pushes.

```
touches:  consilio-backend
            EDIT services/growth/images.py      picture_order() defaults to "photos" (no paid image generation);
                                                diagnose() skips image models when generation is off;
                                                softer two-tier photo judge; heuristic_pick() (precise path) and
                                                fallback_pick() (widened path) so a judge failure no longer throws
                                                away a good candidate set; widen_queries() sector fallbacks;
                                                _BAD_TITLE now rejects portraits/officials/events; _landscape()
                                                shape filter; recent_photo_urls() cross-article photo dedupe;
                                                image-model name match now catches the Nano Banana line
            EDIT services/growth/daily_blog.py  _stamp_image_attempt() on EVERY exit of add_images();
                                                backfill_images() queues never-attempted posts first and survives
                                                one post raising
          consilio
            EDIT app/sitemap.ts                 export const revalidate = 3600
            EDIT lib/seo-pages.ts               SeoImage.source_url (optional, never rendered)
            EDIT app/(app)/admin/growth/growth-admin-client.tsx
                                                copy no longer promises Gemini pictures; the diagnostics panel
                                                renders "generation is off" instead of a red 429
          database: none (agent_meta key `images_attempted_at` and content image key `source_url` are additive)
breaking: no. No CONTRACTS surface. No route, table or column changes.
```

---

## 1. What was actually wrong (measured, not guessed)

Read live from `mece.in` on 2026-10-27 and from Admin → Growth → **Test pictures**.

**State of the 19 published posts:** 1 had a hero image. 3 had a single inline photo. **15 had no picture at all.**
Not one post in the entire archive has ever carried a Gemini-generated image.

The backend's own diagnostics say why:

```
Gemini key: set · image models: gemini-2.5-flash-image
Gemini test picture: gemini-2.5-flash-image: ClientError: 429 RESOURCE_EXHAUSTED.
  "You exceeded your current quota, please check your plan and billing details"
Open-licensed photo search: works (10 found for a test query)
Storage (bucket "insights"): works
```

and the per-post failure notes:

```
Tata Sons:  10 photo(s) found for 'Tata Sons building Mumbai', none showed the subject closely enough;
            no open-licensed photo found for: Tata Sons board meeting, Tata Group boardroom
Blinkit:    no open-licensed photo found for: delivery executive scooter india, urban warehouse delivery india;
            photo judge: RuntimeError: no Gemini vision model answered: ClientError
RBI rates:  1 photo(s) found for 'Reserve Bank of India Mumbai headquarters', none showed the subject closely enough
```

### Root causes, in order of how much damage they did

**R1 — Gemini image generation is not available on this key, and never was.**
Google's own pricing page states image generation is **"Not available"** on the free tier for every current image
model. Every `gemini_image()` call has returned 429 since v3 shipped. The fallback that was supposed to guarantee a
picture has a 0% success rate. *(This is a billing decision, not a code fix — see §3.)*

**R2 — a Gemini judge failure discarded a perfectly good candidate set.**
`find_photo()` caught the judge exception and returned `None`. So when the vision model ran out of quota — the same
free-tier wall as R1 — ten valid, correctly licensed, already-ranked photographs were thrown away and the article
shipped blank.

**R3 — the judge was too strict to ever say yes.**
The prompt demanded "this exact subject … be strict: if none clearly shows the subject, choose none". Wikimedia
Commons has no photograph of a Tata Sons board meeting or an SBI data centre, so the honest answer was always "none",
and the slot stayed empty even when a perfectly good photo of a bank branch was in the set.

**R4 — the writer's queries are too specific and had no fallback.**
Proper-noun queries ("Tata Sons board meeting", "State Bank of India data center") are right to try first and wrong to
try *only*.

**R5 — `backfill_images()` could never reach most of the archive.**
The queue was "every published post with no hero, newest first". A post whose hero could not be filled stayed at the
head of that queue for ever: every click re-ran the same three posts, burned the same API calls, and never reached the
posts below. That is the mechanism by which 15 posts stayed untouched while 3 accumulated inline-only photos.

**R6 — the image-model list missed Google's cheapest image model.**
`image_models()` kept names where `"image" in name`. The Nano Banana line (`gemini-nano-banana-2.1`, ~$0.034 per 1K
image) has no "image" in its id and was silently filtered out.

---

## 2. What changed

> **These changes were red-teamed by a second agent that had not written them, and it found four real defects in
> the first draft** (portraits of named officials reaching the hero slot; the queue stamp skipped on the one failure
> path that mattered; a circular relevance guard that sent a crude-oil story to a solar farm; substring matching
> that sent a healthcare story to a car plant). All four are fixed below and each has a regression check. The
> review's verdict on the first draft was "do not ship items 1–3 as they stand" — what follows is the corrected
> version.

### `services/growth/images.py`

- **`_JUDGE` prompt** — two-tier instead of pass/fail. First preference is still the exact subject; second is an
  honest editorial photograph of the same setting or sector, which is what a magazine actually runs. The reject list
  is unchanged and still absolute: logos, wordmarks, maps, flags, charts, diagrams, screenshots, documents, text-heavy
  images, watermarks, close-up portraits of identifiable people, anything sad/violent/political. `null` is now
  reserved for "every candidate is a reject or is about a different topic".
- **`_BAD_TITLE`** — now also rejects `portrait|headshot|governor|minister|chairman|ceo|president|secretary|press
  conference|speaking|award|ceremony|summit|visit|protest|rally|…`. **This is load-bearing.** The judge's "no
  close-up portraits of an identifiable person" rule was enforced only by the model, and the model is exactly what
  is unavailable while the key is quota-exhausted. Commons is full of PIB portraits of RBI governors and finance
  ministers; without this an RBI story would take "Sanjay Malhotra, Governor of the Reserve Bank of India" as its
  hero *and* its link preview, which is both off-brand and politically loaded.
- **`_landscape(c)`** (new) — a close-up of a person is almost always taller than wide, so a 1.2–2.6 aspect band is
  a cheap second portrait filter on the judge-free path.
- **`heuristic_pick(cands, want)`** (new) — for the **precise** path only. Scores title overlap against the slot's
  subject, and deliberately **not** against the search queries: scoring against the queries is circular, because
  the candidates were retrieved by those queries. (Concretely: a Saudi crude-oil pipeline story was picking a
  Rajasthan solar farm, because the generic energy query contributed more matching tokens than the actual subject.)
  Landscape only; must share a real word with the subject, or it returns `None`.
- **`fallback_pick(cands, slug)`** (new) — for the **widened** path, where title overlap means nothing. `widen_queries`
  is a pure function of sector keywords, so four banking articles generate byte-identical query lists and a
  top-of-list pick would put one photograph on every banking story on the site. The slug picks the offset instead:
  stable for one post (a re-run is idempotent), spread across the set, still ordered by the most on-topic query first.
- **`recent_photo_urls(supabase)`** (new) — seeds `used` with the photos other posts already carry. `used` was
  per-article, which is why the live site already shows one IDBI branch photo turning up repeatedly.
- **`widen_queries(item, title)`** (new) — 13 sector buckets (banking, payments, ports/trade, markets, semiconductors
  /AI, telecom, retail, energy, autos, pharma, agriculture, policy, infrastructure) mapping to broad scenes that do
  exist on Commons, plus a Mumbai-business-district default. Matched on **whole words**: bare substrings matched
  inside unrelated words — `car` in "healthcare" and "scarce", `power` in "empowerment", `trade` in "tradeoff" — and
  sent a healthcare story to a car assembly line. Tried only after the precise queries come back empty.
- **`find_photo()`** — rewired: precise queries → widen if empty → judge → on judge exception *or* judge-null, fall
  through to `heuristic_pick` (precise) or `fallback_pick` (widened) → `None` if nothing is usable. Each outcome
  writes a distinct line into `agent_meta.image_errors`, so Admin → Growth says which of the four happened.
- **`image_models()`** — name match is now `image|banana|imagen`.

### `services/growth/daily_blog.py`

- **`_stamp_image_attempt()`** (new) — writes `agent_meta.images_attempted_at` and is called on **every** exit of
  `add_images`, including the failures. The first draft stamped only on the success path, and `images.art_plan`
  swallows every exception and returns `{}` while running on the same quota-exhausted model chain — so the posts
  most likely to fail planning were never stamped, stayed pinned to the head of the queue, and the "same three posts
  for ever" bug came straight back for exactly those posts.
- **`add_images()`** also wraps `art_plan` and `make_images` so a raise becomes a reason, not a traceback.
- **`backfill_images()`** sorts never-attempted posts first (newest-first inside the group), then least-recently
  attempted; returns `never_attempted` alongside `remaining`; and wraps each `add_images` call so one bad row no
  longer abandons the rest of the batch.

### `consilio/app/sitemap.ts`

- **`export const revalidate = 3600`.** Without it Next treats the route as fully static and generates it once at
  build time. On 2026-10-27 the three newest insight posts were live and linked on `/insights` but **absent from
  `sitemap.xml`**, and would have stayed absent until an unrelated deploy happened to rebuild it.
  Verified, not assumed: `package.json` pins `next@14.2.3`, and `revalidate` in `sitemap.ts` is honoured from
  14.2.3 onward (it was not on earlier 14.x, which is why older advice online says to use `force-dynamic`).
  Caveat: this is ISR, so the first request after the hour expires still serves the stale sitemap and triggers the
  rebuild — freshness is "about an hour plus one request", not instant.

---

## 3. Owner decision, 2026-10-27: no paid image API

> "i dont want to use paid api for image generation. if it is not paid tokens being used then its good"

**`DAILY_BLOG_PICTURES` now defaults to `photos`** in code, so AI image generation never runs and no call in this
pipeline can spend money. Nothing needs setting on Render. To reverse it later, set
`DAILY_BLOG_PICTURES=photos,gemini` — but only once the Gemini key is on a paid plan, or it is 429s again.

What remains in the chain, and why each is free:

| Step | Cost |
|---|---|
| Wikimedia Commons search | free, no key |
| Openverse search | free, no key |
| Gemini vision judge | free tier — a flash text/vision model, the same family the writer already runs on. When its free rate limit bites, `heuristic_pick`/`fallback_pick` take over, so a throttle costs a picture's quality, never the picture. |
| Pillow resize + Supabase Storage | free |
| ~~Gemini image generation~~ | **off** — paid-only, 0% success rate on this key |

`diagnose()` no longer lists or calls image models when generation is off, so Admin → **Test pictures** stops
reporting a 429 as though it were a fault. The admin copy no longer promises Gemini pictures.

**Consequence to accept:** with generation off, a post gets a picture only if Commons or Openverse has a usable one.
The sector fallbacks in `widen_queries` plus `fallback_pick` mean that is now almost always true, but it is not a
guarantee. A post with no photo still renders its topic-colour cover and still gets a generated `/og` card for link
previews, so nothing looks broken.

**Still an editorial decision, not a code change:** the cannibalisation in §4.

---

## 4. SEO audit — `/insights`

**The foundations are genuinely good.** Not flattery; measured:

| Check | Result |
|---|---|
| Content server-rendered for crawlers | ✅ 2,733 words of real HTML on a sample article |
| Canonical | ✅ self-referencing, `www` consistent |
| Indexable | ✅ `index, follow`; `googlebot: max-image-preview:large, max-snippet:-1` |
| Structured data | ✅ Article + BreadcrumbList + FAQPage + Organization/WebSite graph |
| Titles / descriptions | ✅ 72 chars, unique, non-boilerplate |
| Heading structure | ✅ one `h1`, 11 `h2` |
| Outbound citations | ✅ Reuters, Mint, rbi.org.in — real E-E-A-T signal |
| Public access (no login) | ✅ |
| Crawl path from the homepage | ✅ `/insights` is in the home footer |
| `robots.txt` + AI crawlers | ✅ 18 AI crawlers explicitly allowed |

### Defects found

**S1 — sitemap was stale. HIGH. Fixed above.** 3 of 19 live posts missing.

**S2 — keyword cannibalisation. HIGH. Editorial, not code.**
Four published posts target the same RBI rate-decision query:
`why-the-reserve-bank-raised-rates-without-wanting-a-fight`, `why-the-central-bank-hiked-rates-while-raising-growth-targets`,
`why-the-central-bank-is-prioritizing-price-stability-over-growth`, plus the draft
`why-broadening-inflation-forced-the-rbi-to-raise-rates-again`.
Four more target UPI/MDR: `upi-s-pricing-evolution…`, `how-new-upi-mdr-charges…`, `upi-s-mdr-windfall…`,
`barriers-to-investment-why-upi-users…`, plus the draft `who-pays-for-india-s-free-digital-payments`.
Google will pick one per cluster and suppress the rest; none becomes authoritative.
*Fix:* before writing, the topic picker should check published slugs/keywords for an existing post on the same story
and **update that post** (same slug, new date) instead of writing a fourth one. Short term: 301 the weaker duplicates
into the strongest, or consolidate each cluster into one evergreen explainer that the daily post links to.

**S3 — no images → no social CTR and no Google Discover. HIGH.**
18 of 19 posts fall back to the generated `/og` text card. `max-image-preview:large` is correctly set, so Discover
eligibility is already there technically — the only thing missing is a real 1200px image per post. For a daily
India-business publication, Discover is plausibly the largest single traffic source available. This resolves itself
once §3.1 and the backfill are done.

**S4 — no RSS/Atom feed. MEDIUM.** `/feed.xml`, `/rss.xml`, `/insights/feed.xml` all 404. A daily publication with no
feed cannot be picked up by Feedly, newsletter automations, or aggregators. ~40 lines in `app/insights/feed.xml/route.ts`.

**S5 — no topic hub pages. MEDIUM.** Every post renders a topic label (Strategy, Finance, Economy, Technology,
Business) and none of them links anywhere. `/insights/topic/[topic]` pages would add internal linking depth and
category-level ranking for cheap.

**S6 — author is an Organization. MEDIUM.** `Article.author` is `{"@type":"Organization","name":"MECE Editorial"}`.
For finance-adjacent content Google's quality guidance leans on a named human author with a bio and a stable author
page. A named byline + `/about` link would strengthen E-E-A-T.

**S7 — "Business" is not a known topic colour. LOW.** Two posts use it; the palette covers Strategy, Marketing,
Finance, Operations, Technology, Economy, Careers, so those posts fall to a default.

**Not verifiable from here:** actual index coverage. Check Search Console → Pages for `/insights/*` and submit the
sitemap; `site:` queries through a search tool are not reliable evidence.

---

## 5. Gates

- `python -m py_compile services/growth/images.py services/growth/daily_blog.py` — OK.
- **10 image checks**, each pinned to a defect the red-team found or to behaviour that must not regress: portrait and
  official/event titles rejected (6 real Commons-style titles); portrait *aspect ratio* rejected even when the title
  is clean; `heuristic_pick` scores against the subject only (Saudi pipeline → refinery, never the solar farm);
  `fallback_pick` spreads across ≥3 distinct photos for 6 slugs and is stable per slug; the five verified substring
  leaks (healthcare/scarce/empowerment/tradeoff/carbon → car plant, refinery, port) are gone while real matches
  still work; judge-raises → rescue on the precise path; widened path logs "used a sector photo"; the precise path
  still refuses an unrelated photo; `recent_photo_urls` works and fails soft on a dead DB; licence filter still
  rejects NC/ND/all-rights. **All pass.**
- **4 daily_blog checks** against a Supabase double: the art-planner failure path now stamps; a raising
  `make_images` is caught and stamped; one raising post no longer aborts the batch (all three posts attempted); the
  queue serves never-attempted first with correct `remaining`/`never_attempted`. **All pass.**
- The red-team replayed the four at-risk assertions in `tests/test_daily_blog.py` against the new code using the
  repo's own `COMMONS` fixture and all four still pass, including `"the judge is strict: no photo shows the subject
  -> Gemini makes that picture"`. The backfill test also still holds (`remaining` is still `4 - 3 == 1`;
  `never_attempted` is additive).
- **Photos-only default proven:** `picture_order()` returns `["photos"]` with no env var, honours an explicit
  `photos,gemini`, and falls back safely on junk input; and `make_images` with the default order never invokes the
  generator (asserted with a generator that raises if called), so no paid call is reachable.
- **Still run the full `python -m tests.test_daily_blog` (89 checks) before pushing** — only four of them were
  replayed here, and this session has no network to Commons, Openverse, Gemini or Storage. One test is known to
  depend on the old default: `"the judge is strict: no photo shows the subject -> Gemini makes that picture"`
  exercises the `gemini` step, which the new default disables. If it fails, pass
  `order=["photos", "gemini"]` to `make_images` in that test rather than changing the default back.
- **Not run here:** `npx tsc --noEmit` and `next build` for the three frontend edits.
- **Not run here:** `tsc --noEmit` / `next build` for the sitemap change.
- **Not verified here:** live Commons/Openverse/Gemini calls (no network to them from this session).

## 6. Pushing and verifying

This session had no shell on the owner's machine (the device bridge exposed file tools only), so **nothing here is
committed to git** — the files are written into the working tree and nothing else. The brain's own rule for shells
that cannot delete files applies anyway: they must not run git write commands, because a left-behind
`.git/index.lock` blocks the owner's next command.

```bat
cd /d D:\dev\mece\consilio-backend
python -m tests.test_daily_blog
git add services/growth/images.py services/growth/daily_blog.py
git commit -m "feat(insights): photos without a paid image API; stop story cannibalisation at the topic picker"
git push

cd /d D:\dev\mece\consilio
npx tsc --noEmit
git add app/sitemap.ts app/insights/page.tsx "app/insights/feed.xml/route.ts" "app/insights/topic/[topic]/page.tsx" lib/insights/topics.ts lib/seo-pages.ts components/insights/parts.tsx "app/(app)/admin/growth/growth-admin-client.tsx" .brain/handoffs/ANTIGRAVITY_HANDOFF_insights-pictures-and-seo.md
git commit -m "feat(seo): RSS feed, topic hubs, hourly sitemap revalidation"
git push

node .brain\sync.mjs
```

Then, once Render and Vercel have redeployed:

1. Admin → Growth → **Test pictures**. Expect photo search ✅, storage ✅, and image generation reported as *off*
   (not as a red 429).
2. Admin → Growth → **Add pictures to older posts**, repeatedly. It now advances three posts per click instead of
   retrying the same three — 15 posts without a hero is about five clicks. Watch the per-post "last attempt" line:
   it now says which of the four outcomes happened.
3. Re-read `/sitemap.xml` and confirm all live posts are listed (allow an hour plus one request).
4. Spot-check three backfilled posts for a wrong or embarrassing photo. The judge-free path is new; the guards are
   tested but the live photo corpus is not something this session could see.

---

## 7. Round two (same session, after the first deploy)

The first deploy went out and the backfill was run from Admin. It produced **nothing in twelve minutes**. The admin
log said why, and it was not the judge:

```
search_openverse('Yes Bank Mumbai headquarters'): ReadTimeout
search_openverse('Yes Bank corporate office'):    ReadTimeout
search_openverse('rural India vehicles'):         ReadTimeout
```

`api.openverse.org` read-times-out from Render routinely. At the old 12-second timeout that is 144 seconds of pure
waiting per picture slot once the widened second search is included — three slots per article, three articles per
click. The run was not failing, it was crawling. Fixed:

- **`_HTTP_TIMEOUT` 12s → 7s.** Commons answers in well under a second when it answers at all.
- **Circuit breaker.** A source that times out or refuses a connection is skipped for ten minutes
  (`_source_dead`) instead of being retried for every single query.
- **`PHOTO_BUDGET_S = 45`.** A whole-article ceiling on photo search. Whatever has been found when the budget
  expires is used; a shorter candidate list still yields a picture, waiting yields nothing.

**New photo source: Pexels (`search_pexels`).** Commons and Openverse are genuinely thin on Indian business
subjects — the log is full of `no open-licensed photo found for: delivery executive scooter india` and
`8 photo(s) found for 'Navi Mumbai data centre', none showed the subject closely enough`. Pexels has thousands of
usable editorial business photographs and its licence permits commercial use and modification.
**The API key is free — there is nothing to pay.** Set `PEXELS_API_KEY` on Render (pexels.com/api, about a minute).
With no key the function returns `[]` and the chain behaves exactly as before, so this is safe to deploy either way.
Search order is `commons → pexels → openverse`, by reliability rather than preference. Attribution is not required
by the Pexels licence; the photographer is credited anyway.

**Cannibalisation guard (`STORY_CLUSTERS`, `clusters_of`, `recent_clusters` in `daily_blog.py`).**
A dedupe already existed — Jaccard ≥ 0.30 on title tokens against 45 days of posts — and four RBI essays and four
UPI essays walked straight past it, for two reasons:
- the same subject has names that share no tokens at all ("Reserve Bank" / "central bank" / "RBI" / "MPC");
- two differently-worded headlines about one event score about **0.27**, just under the threshold.

So: the Jaccard threshold drops to **0.22**, and on top of it twelve named clusters (rbi-policy, upi-pricing,
quick-commerce, india-ai, tata-group, reliance-jio, adani, bank-ma, satellite-telecom, capital-markets-tax,
energy-oil, ev-auto) are matched by regex against the headline and against every recent post's title, topic and
keywords. A cluster covered within **21 days** is refused, with a reason that names the existing post:

```
'rbi-policy' was already covered on 2026-10-26: "Why the Reserve Bank raised rates without wanting a fight"
 — update that post instead of writing a rival to it
```

Twenty-one days is the trade-off: long enough that the archive stops competing with itself, short enough that a
genuine new development in a running story still gets written. Rejected posts do not reserve a cluster. The right
move for a recurring story is `rewrite_page`, which keeps the slug and therefore the link equity.

**RSS feed — `app/insights/feed.xml/route.ts`.** RSS 2.0, 50 most recent, `media:content` for the hero (not
`<enclosure>`, which needs a byte length we do not store, and a wrong length is worse than none), revalidated every
15 minutes. Autodiscovery `<link rel="alternate">` added to the index metadata — without it the feed exists but
nothing looking at the page knows.

**Topic hubs — `app/insights/topic/[topic]/page.tsx`.** One page per subject, with its own copy, CollectionPage and
BreadcrumbList JSON-LD, and cross-links to the other topics. A hub with no essays **404s** rather than shipping an
empty indexable page, and only hubs that have essays go in the sitemap. A "Browse by topic" row on `/insights`
links them with counts — a page reachable only from the sitemap is a page Google has little reason to trust.

**Refactor: `lib/insights/topics.ts`.** `TOPIC_COLORS` / `topicOf` moved out of `components/insights/parts.tsx`
into a leaf module with no React imports, so `app/sitemap.ts` and the hubs can use the taxonomy without pulling
`Link`, `ThemeToggle` and the whole reading-experience tree into a server route. `parts.tsx` re-exports them, so
every existing `from '@/components/insights/parts'` import is unchanged.

### Round-two gates
- `py_compile` clean; the 10 image checks and 4 daily_blog checks from §5 all still pass.
- **3 new latency checks:** a timing-out source is called once and then skipped (not once per query); an expired
  deadline halts the sweep and logs "photo search hit its time budget"; the constants are 7s / 45s.
- **3 new Pexels checks:** no key → clean `[]` no-op; search order is commons, pexels, openverse; credits render as
  `Photo: Jane Doe / Pexels` and `Photo: A B / Wikimedia Commons, CC BY-SA 4.0`.
- **7 new cannibalisation checks**, run against the **real** duplicate titles from the live site: the fourth RBI
  headline is refused naming the existing post; the UPI cluster likewise; the near-duplicate title that slipped
  past 0.30 is now caught; the cluster reopens after the 21-day cooldown; an unrelated story is unaffected; a
  rejected post does not reserve a cluster; cluster matching itself is correct.
- All eight changed TS/TSX files parse clean under esbuild. **`npx tsc --noEmit` and `next build` still have to be
  run on the real tree** — esbuild checks syntax, not types.

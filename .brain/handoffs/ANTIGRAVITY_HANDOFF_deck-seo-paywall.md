# ANTIGRAVITY_HANDOFF — deck-seo-paywall (Cowork brain, 2026-08-16)

Public, indexable pages for every case-competition deck, with a real paywall
after N free pages. Target: someone searching "Flipkart case competition deck"
lands on MECE, reads a genuine summary, sees the first slides, and hits an
upgrade wall for the rest.

touches: `supabase/migrations/0047_deck_seo_paywall.sql` (new), `app/decks/[slug]/page.tsx` (new,
PUBLIC), `app/api/decks/[slug]/page/[n]/route.ts` (new), `lib/constants.ts` (PUBLIC_ROUTES),
`lib/decks.ts` (new), `app/sitemap.ts`, `app/(app)/admin/deck-vault/*`; backend
`routes/decks.py` (new), `services/deck_render.py` (new), `services/deck_ai.py` (new),
`requirements.txt`
breaking: **C8 additive** (page-image storage convention), **C4 additive** (new routes).
C1/C2 untouched.
affects: Deck Vault & DRM, Deck Vault Rewards, Admin, SEO

---

## THE CORRECTION THAT DRIVES THE DESIGN

The owner's instinct was "show 1-2 pages, blur the rest, and stop people
deleting the overlay". **A client-side overlay is not a paywall.**

`app/api/skeletons/file/[deckId]/route.ts` currently streams the ENTIRE PDF to
the browser after its tier check. Once those bytes arrive the content is gone:
the Network tab holds the whole file, JS can be disabled, and deleting an
overlay `div` is the least sophisticated attack available. Watermarking and
blur-on-window-blur are deterrents against casual screenshotting. They are not
access control and must not be described as such.

**The only design that holds: never send the locked pages.**

```
upload ──> backend rasterises EVERY page to WebP
       ──> images land in a PRIVATE bucket
       ──> GET /api/decks/<slug>/page/<n>
             n <= free_pages  -> 200, long cache, no auth  (crawlable)
             n >  free_pages  -> 403                       (bytes never leave)
```

The "blurred slide" a visitor sees is a locally-drawn placeholder. There is
nothing behind it to reveal, so there is nothing to steal by editing the DOM.
The existing PDF viewer stays exactly as it is for the Pro-only full experience.

## THE SECOND PROBLEM: NOTHING IS INDEXED TODAY

`/skeletons` is **not** in `PUBLIC_ROUTES`, so middleware 307s every crawler to
`/login`. Google has never seen a deck. No amount of paywall tuning matters
until there is a public URL with real text on it.

Hence a NEW public route `/decks/[slug]` — server-rendered, no auth — carrying:
title, competition, organizer, year, result, the AI summary, the free page
images with alt text, locked placeholders, and an upgrade CTA. Images do not
rank; the summary is what wins the query. The same text is what AI answer
engines read, so AEO falls out of the same work plus JSON-LD.

`/skeletons` stays as the logged-in library. `/decks/[slug]` is the front door.

---

## Owner decisions (2026-08-16)

1. **Free-page count is PER DECK, set in the admin uploader.**
   Store `free_pages int null`. NULL must not mean zero and must not mean
   everything — it means "not decided", so fall back to a computed default:
   `clamp(ceil(page_count * 0.25), 1, 4)`. A 3-slide deck shows 1, a 12-slide
   shows 3, a 40-slide shows 4. The admin field overrides it. This way a deck
   uploaded in a hurry is never accidentally free or accidentally sealed.
2. **AI summary generated at upload**, 150-250 words, structured as problem →
   approach → recommendation → key numbers.

## The summary must not invent figures

`services/certificate_ai.py` already solves this exact problem and its pattern
should be reused, not reinvented: it extracts every number from the source, and
verifies in PYTHON that the generated text introduces no number absent from the
input. A deck summary that hallucinates "grew revenue 34%" is worse than no
summary — it is a factual claim on a public, indexed page, attributed to a real
competition and a real team.

Same rule here: extract numbers from the PDF text layer, generate, then reject
and retry if the output contains a figure the deck does not.

---

## Schema (migration 0047)

```sql
alter table public.deck_skeletons
  add column if not exists slug text,
  add column if not exists page_count int,
  add column if not exists free_pages int,          -- NULL = use the computed default
  add column if not exists summary text,
  add column if not exists summary_generated_at timestamptz,
  add column if not exists pages_rendered_at timestamptz,
  add column if not exists is_indexable boolean not null default true;

create unique index if not exists deck_skeletons_slug_unique
  on public.deck_skeletons (slug) where (slug is not null);
```

Slug from title + competition + year, deduped with a numeric suffix. It is a
public URL, so it must be stable — once a deck is indexed, changing its slug
throws away the ranking. Never regenerate a slug on edit.

`is_indexable` exists so a deck can be pulled from search without deleting it
(a team objects, a sponsor asks, a result is disputed).

## Rendering (backend, Render)

`services/deck_render.py` using **pypdfium2** (`pip install pypdfium2`).

**DO NOT USE PyMuPDF.** An earlier draft of this handoff recommended it — that
was wrong and would have been expensive. PyMuPDF/MuPDF is **AGPL-3.0**, whose
viral clause triggers when users interact with the software *over a network*.
MECE is exactly that, so using it obliges you to open-source the whole
application or buy a commercial licence from Artifex. Verified 2026-08-16.

pypdfium2 is BSD/Apache-licensed, renders pages to bitmaps, exposes the text
layer via `get_textpage()`, and needs no system poppler — same capability, no
legal exposure. Pin loosely (`pypdfium2>=4,<5`) rather than to an exact patch.

- Render at ~1600px wide, WebP, quality ~80. Big enough to read, small enough
  to serve, and lossy enough that re-assembling a crisp PDF is unattractive.
- Write to a PRIVATE bucket: `deck-pages/<deck_id>/<n>.webp`.
- Store `page_count` and `pages_rendered_at`.
- **Watermark the free pages** with the deck URL, not with a user id — these are
  public and get shared. Locked pages need no watermark; they are never served.

## Public API — `GET /api/decks/[slug]/page/[n]`

```
n <= effective_free_pages : 200 image/webp, Cache-Control public, immutable
n >  effective_free_pages : 403, no body
```

No auth on the allowed branch — crawlers must fetch it. `effective_free_pages`
is computed server-side ONLY; never accept it from a query param.

## Public page — `app/decks/[slug]/page.tsx`

Server component. Add `/decks` to `PUBLIC_ROUTES`. Must include:

- `<h1>` with the real deck title, and the competition/organizer/year/result as
  text, not just badges
- the AI summary in prose
- free pages as `<img>` with descriptive `alt`
- locked pages as placeholders with an upgrade CTA
- `generateMetadata` — title, description from the summary, canonical, OG image
  pointing at page 1
- JSON-LD: `CreativeWork` with `name`, `about`, `datePublished`, `isPartOf`, and
  `isAccessibleForFree: false` + `hasPart` marking the paywalled section. That
  last pair is what tells Google the content is legitimately gated rather than
  cloaked — **without it, serving crawlers content users cannot see is cloaking
  and risks a penalty.**
- add every indexable deck to `app/sitemap.ts`

## Phases and gates

**P1 — migration + slug backfill.** GATE: SQL parses; every existing deck row
has a unique slug; re-running is a no-op.

**P2 — backend render + summary.** `deck_render.py`, `deck_ai.py`,
`routes/decks.py`. GATE: `py_compile` EXIT 0; a real PDF produces N images and a
summary; **a summary containing an invented number is rejected** (test it with a
deliberately number-free deck).

**P3 — public route + image API.** GATE: `tsc --noEmit` + `npm run build` EXIT 0.
`curl` page 1 with no cookie → 200. `curl` page 99 → 403. View source → the
summary is in the HTML, not injected by JS.

**P4 — admin.** `free_pages` field, summary preview + regenerate, `is_indexable`
toggle. GATE: setting free_pages to 1 makes page 2 immediately 403.

**P5 — SEO submission.** Sitemap live, Search Console, spot-check with the
rich-results test.

## THE PAYWALL RULE MUST NOT BE COPIED INTO TYPESCRIPT

A proposed plan added `getEffectiveFreePages()` to `lib/decks.ts` alongside the
SQL `effective_free_pages()`. That is two copies of the same rule, which is the
precise failure mode this design was written to avoid — and the same shape as
the three-way clarification-quota drift that produced the 2026-08-01 P0 (C9).

The image route is the security boundary and MUST derive the number in SQL:

```sql
select id, page_count,
       public.effective_free_pages(free_pages, page_count) as free_pages_effective
from public.deck_skeletons
where slug = $1 and is_active = true
```

The public page can reuse that same selected value for rendering. If a TS mirror
is ever genuinely needed for a non-security surface, it must carry a comment
naming the SQL function as the source of truth AND a test asserting they agree.

## Do not

- Do not use PyMuPDF (AGPL — see the rendering section).
- Do not put the locked page images behind a public URL "protected" by CSS.
- Do not accept a page count, free-page count or tier from the client.
- Do not re-implement the paywall rule in TypeScript.
- Do not let the summary claim a number the deck does not contain.
- Do not change a slug after publication.
- Do not serve the OG image as WebP — several social/AI scrapers still reject
  it. Render one JPEG or PNG for OG, or point OG at a converted variant.

# CHANGE RECORD — Growth Agent: programmatic SEO (Phase 2, slice 1)

**STATUS: APPLIED DIRECTLY by the Cowork brain, 2026-09-12.** Record, not a build request.
Verified here: backend `py_compile` clean (5 files), frontend `esbuild` syntax clean (8 files).
**Gates NOT run here** (device shell down): run `tsc --noEmit` + `npm run build` (frontend) and
`py_compile` (backend) before deploy — a type error fails the Vercel build.

## What this ships
The Growth Agent turns a **real, current, GD-worthy news headline** (from `news_headlines`) into a
**grounded case/GD breakdown**, self-scores it (0–100), and stores it as a **draft**. An admin reviews
in **/admin/growth** and publishes the good ones → they go live at **`/insights/<slug>`** and enter the
sitemap. **Nothing publishes without a human** (the anti-spam guardrail).

Why it clears the 100× bar: one ~$0.02 grounded page is a **durable organic-acquisition asset** that can
rank for months and funnels readers into signup/practice.

## Files
**Migration (run first):** `consilio/supabase/migrations/0063_seo_pages.sql` — `seo_pages` table + RLS
(public reads *published* only; admins read all; writes are service-role only) + updated-at trigger.

**Backend (`consilio-backend`):**
- `services/growth/seo_writer.py` (new) — grounded generator + self-critique; forbids inventing facts.
- `services/growth/__init__.py` (new)
- `routes/seo.py` (new) — admin `POST /seo/generate`, `GET /seo/candidates`. Budget-guarded, rate-limited.
- `main.py` (edit) — registers the `/seo` router.
- `services/ai_providers.py` (edit) — adds `seo_writer` (gpt-4o default) + `seo_critique` (Groq default)
  features, so the cost toggle shows up automatically in **/admin/ai-providers**.

**Frontend (`consilio`):**
- `lib/seo-pages.ts` (new) — anon read layer (published only).
- `app/insights/[slug]/page.tsx` (new) — public ISR page + `generateMetadata` + Article JSON-LD + practice CTA.
- `app/insights/page.tsx` (new) — the `/insights` hub (internal linking).
- `app/sitemap.ts` (edit) — appends `/insights` + each published page.
- `app/(app)/admin/growth/{page.tsx, growth-admin-client.tsx, actions.ts}` (new) — the review + publish gate.
- `components/admin/admin-nav.tsx` (edit) — adds the "Growth (SEO)" nav item.

## Deploy (two repos + a migration)
1. **Supabase:** run `supabase/migrations/0063_seo_pages.sql` (after 0062).
2. **Backend** (`consilio-backend`): `python -m py_compile` the 5 files, commit, push, let it redeploy
   (the host behind `NEXT_PUBLIC_API_URL`). New route needs the backend live before the admin "Generate" works.
3. **Frontend** (`consilio`): `npx tsc --noEmit` && `npm run build`, commit, push (Vercel).
4. **Smoke test:** `/admin/growth` → *Generate a draft* → check the QA score + preview → *Publish* →
   open `/insights/<slug>` (logged out) → confirm it renders and is in `/sitemap.xml`.

## Guardrails already built in
- Human approval required before publish (no auto-publish).
- Self-critique QA score + notes shown on every draft; publish is your call.
- Grounded prompt forbids invented facts; source link shown on the page (`rel="nofollow"`).
- Daily-budget kill switch + rate limit on generation; both model calls logged to `ai_usage_log`.
- Provider-tiered: writer on gpt-4o, critique on Groq — toggle either in /admin/ai-providers.

## Fast-follows (not in this slice)
- Edit-before-publish (tweak title/meta in the admin before going live).
- Scheduled nightly batch generation (a cron that drafts 3–5/day for you to review).
- More page kinds (firm guides, concept explainers) as additional specialist prompts.
- Attribution: tie `/insights/*` landing → signup in the (fixed) analytics to measure ROI per page.

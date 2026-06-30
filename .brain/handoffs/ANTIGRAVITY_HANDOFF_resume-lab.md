# ANTIGRAVITY_HANDOFF — resume-lab (Brain / Cowork, 2026-06-27)

New top-level feature: **Resume Lab** (Pro-gated AI résumé builder, one-page B-school
format, ATS-friendly, print-to-PDF). Plus pricing raise and nav change.

```
touches (frontend / consilio):
  lib/tier.ts                                  (Pro 499->699, Lite 199->299; prepay tiers scaled)
  app/(app)/upgrade/page.tsx                   (Pro benefits: Resume Lab lines; vault -> "coming soon")
  components/app-nav.tsx                        (Resume Lab in primary; Leaderboard moved to More)
  components/mobile-bottom-nav.tsx             (Resume Lab in More sheet + active prefix)
  supabase/migrations/0023_resumes.sql         (NEW: resumes table + owner RLS)
  lib/resume/schema.ts                          (NEW: ResumeData schema, char-fill rules, starter)
  lib/api.ts                                    (NEW: refineBullet / generateBullets / fitBullet clients)
  app/(app)/resume/page.tsx                     (NEW: Pro-gated server page; loads/creates resume)
  components/resume/resume-editor.tsx           (NEW: form editor + live preview + char meters + AI + print)
touches (backend / consilio-backend):
  services/resume_ai.py                         (NEW: refine/generate/fit bullet, GPT-4o)
  routes/resume.py                              (NEW: POST /resume/{refine-bullet,generate-bullets,fit-bullet}, Pro-gated)
  main.py                                        (register resume router)
breaking: no — additive. New table + endpoints + pages.
RUN REQUIRED: apply migration 0023; redeploy backend (new endpoints).
```

## What shipped (v1)
- **Pricing:** monthly Pro ₹699, Lite ₹299 (single source `lib/tier.ts` TIER_PRICING; prepay
  3-month/annual scaled to keep the prior discount ratio). Razorpay order amount derives from
  `priceFor()`, so checkout uses the new prices automatically. Upgrade page lists Resume Lab as a
  headline Pro benefit; "Deck Vault" shown as "coming soon" (it's admin-only/in-dev).
- **Nav:** `Resume Lab` added as a primary top-nav item; `Leaderboard` moved into the "More" menu
  (desktop) and is in the mobile "More" sheet alongside the new Resume Lab entry.
- **Resume Lab (`/resume`, Pro-gated):** form editor for the standard B-school one-pager
  (header, academic table, work, internships, projects, PoR, awards, certifications,
  extracurriculars, additional info). Each bullet is single-line with a live character-fill meter
  (amber = short, green = ideal ~90-115, red = over 120 / risks wrapping). Live preview renders a
  clean single-column ATS-safe page; "Download PDF" uses the browser print engine (print CSS,
  real selectable text = ATS-friendly). Saves to `resumes` (owner-scoped RLS) via the client.
- **AI (Pro-gated, server-side, original MECE prompt):** per bullet "Refine" (3 strong
  metric-first options), "Fit to line" (trim to ≤120 chars keeping impact), and "Generate with AI"
  (Role/Task/Result -> new bullets). All via `/resume/*` on the FastAPI backend (rate-limited,
  `assert_tier_at_least pro`).

## IP note (held the line)
Did NOT copy or "reword to launder" the uploaded Kislaya CV Engine (its system prompt, its 2,000-
bullet repository, or its template). The implemented format/principles are standard, non-proprietary
B-school resume conventions (identical across the two sample resumes from different colleges). All
copy, the AI prompt, and examples are original MECE content.

## NOT in v1 (future phases — architected for, not built)
- College-specific templates (the JSONB `template` column + schema are ready; only `mece-bschool-v1`
  exists). 80-90% shared, per-college overrides later.
- Full-resume AI rebuild (paste rough resume -> AI restructures); v1 is bullet-level.
- Multi-resume management UI (page loads the most recent / creates one).

## Gates done
- Frontend `npx tsc --noEmit` (fresh) -> clean (incl. 525-line editor).
- Backend `python3 -m py_compile main.py routes/resume.py services/resume_ai.py` -> clean.
- NOTE: the Edit tool truncated app-nav/mobile-nav/upgrade mid-session; restored from HEAD and
  re-applied via shell. AGV should still run `npm run build` as the final gate.

## ACTION REQUIRED (you / AGV)
1. Apply migration `supabase/migrations/0023_resumes.sql` on Supabase.
2. Redeploy backend (new `/resume/*` endpoints).
3. Commit + push both repos (see AGV prompt). Clear `.git\index.lock` first if git refuses.
4. Run `npm run build` (frontend) as the final pre-deploy gate.
5. Smoke test: as a Pro/admin user open /resume -> edit a bullet -> Refine -> pick -> Download PDF.
   As a free user, /resume shows the upgrade gate.

### Suggested CHANGELOG line
resume-lab — new Pro Resume Lab: B-school one-pager builder, char-fill meters, AI refine/generate/fit, ATS print-to-PDF (table 0023, /resume/* endpoints); Pro ₹699 / Lite ₹299; Leaderboard moved to More — breaking: no — affects: nav, pricing, payments

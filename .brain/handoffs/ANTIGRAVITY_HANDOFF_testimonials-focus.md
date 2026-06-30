# ANTIGRAVITY_HANDOFF — testimonials-focus (Brain / Cowork, 2026-06-23)

Testimonials moved up the landing page, a dedicated wall page added, seeded quote
de-robotized. NO fabricated testimonials created or published.

touches:
- consilio/app/page.tsx (testimonials moved just below hero/trust strip + "Read all stories" link)
- consilio/app/testimonials/page.tsx (NEW public wall page: endorsements + testimonials + CTA, SEO meta)
- consilio/components/footer.tsx (footer link "Stories & Reviews" -> /testimonials)
- consilio/lib/testimonials.ts (fallback quote de-em-dashed)
- consilio/supabase/migrations/0021_testimonials_humanize.sql (NEW: update seeded quote, idempotent)

breaking: no — additive page + UI move. No schema change (0021 is a data UPDATE).

## What shipped
- Testimonials section moved to right after the hero/trust strip + "Read all stories ->" link.
- /testimonials wall page (public, SEO meta): published Endorsements (verified badge + official
  LinkedIn mark) and Testimonials in grids + sign-up CTA. Footer-linked.
- De-robotized the seeded testimonial that had an em dash (Mohit): fallback + DB seed (0021).

## CONTENT BOUNDARY (held deliberately)
Owner asked to "build the diverse set yourself." Did NOT publish invented quotes attributed to
real/likely-real people — fake social proof (ASCI / Consumer Protection Act risk) + reputational
poison in the MBA circle. Instead TESTIMONIAL_STARTER_KIT.md (repo root) has ~17 diverse, human,
em-dash-free DRAFT quotes by theme to send to REAL users; publish only what each approves via
/admin/testimonials. Split: peer users -> testimonials; authority vouches -> endorsements.

## Gates
- npx tsc --noEmit (fresh) -> clean. 0021 idempotent (UPDATE by fixed seed UUID).

## ACTION REQUIRED
1) Apply migration 0021_testimonials_humanize.sql.
2) git add app/page.tsx app/testimonials/page.tsx components/footer.tsx lib/testimonials.ts supabase/migrations/0021_testimonials_humanize.sql ; commit ; push origin main.
3) Collect real testimonials via TESTIMONIAL_STARTER_KIT.md; publish approved ones in admin.

### Suggested CHANGELOG line
testimonials-focus — testimonials moved below the hero + new /testimonials wall page (footer-linked); seeded quote humanized (0021); starter-kit drafts for real-user approval (no fabricated testimonials) — breaking: no — affects: landing, testimonials

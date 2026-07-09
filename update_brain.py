import os
import re

# Update CHANGELOG.md
changelog_path = r"C:\Users\satya\Videos\company\consilio\.brain\CHANGELOG.md"
with open(changelog_path, 'r', encoding='utf-8') as f:
    content = f.read()

changelog_add = """
## 2026-06-27 — resume-full-rebuild — pending
resume-full-rebuild — Resume Lab can rebuild a whole résumé from pasted text into the MECE format via AI (POST /resume/rebuild, Pro)
touches: services/resume_ai.py, routes/resume.py, lib/api.ts, components/resume/resume-editor.tsx
breaking: no   affects: Resume Lab

## 2026-06-27 — resume-lab — pending
resume-lab — new Pro Resume Lab: B-school one-pager builder, char-fill meters, AI refine/generate/fit, ATS print-to-PDF (table 0023, /resume/* endpoints); Pro ₹699 / Lite ₹299; Leaderboard moved to More
touches: lib/tier.ts, app/(app)/upgrade/page.tsx, components/app-nav.tsx, components/mobile-bottom-nav.tsx, supabase/migrations/0023_resumes.sql, lib/resume/schema.ts, lib/api.ts, app/(app)/resume/page.tsx, components/resume/resume-editor.tsx, services/resume_ai.py, routes/resume.py, main.py
breaking: no   affects: nav, pricing, payments

## 2026-06-27 — endorsements-edit — pending
endorsements-edit — admin can edit existing endorsements inline (text, LinkedIn, credential, verified, ordering, photo) via updateEndorsement
touches: app/(app)/admin/endorsements/endorsements-admin-client.tsx
breaking: no   affects: admin endorsements

## 2026-06-27 — testimonials-edit — pending
testimonials-edit — admin can edit existing testimonials inline (text, LinkedIn, ordering, photo upload/URL) via updateTestimonial
touches: app/(app)/admin/testimonials/testimonials-admin-client.tsx
breaking: no   affects: admin testimonials

## 2026-06-27 — testimonials-batch1 — pending
testimonials-batch1 — staged 3 real-profile testimonials (Mitiksha/Srijita/Advika) as pending drafts pending each person's sign-off (0022)
touches: supabase/migrations/0022_testimonials_pending_batch1.sql
breaking: no   affects: testimonials

## 2026-06-26 — admin-status-page — 7befa92
admin-status-page — new /admin/status: live backend /health (latency + env flags), today's daily content, and headline count, with re-check + wake-backend buttons
touches: app/(app)/admin/status/page.tsx, components/admin/admin-nav.tsx
breaking: no   affects: admin

## 2026-06-26 — linkedin-logo-and-vault-copy — 8070936
linkedin-logo-and-vault-copy — leaderboard uses the official LinkedIn mark; Deck Vault shows an 'in development' message instead of Upgrade to Pro
touches: components/leaderboard/leaderboard-client.tsx, components/skeleton-library.tsx
breaking: no   affects: leaderboard, deck vault

## 2026-06-26 — gd-domains-and-colleges — 4ce4074
gd-domains-and-colleges — GD topics now span Abstract + all domains (HR/business/tech/economy/society); colleges refreshed via 0020 (official names, +77 colleges, research-based tiers, no deletions)
touches: lib/abstract-gd.ts, app/(app)/gd-briefs/abstract/page.tsx, services/abstract_gd_generator.py, supabase/migrations/0020_colleges_refresh.sql
breaking: no   affects: GD Topics, onboarding, leaderboard

## 2026-06-26 — abstract-gd — ec3bf32
abstract-gd — Abstract GD track: taught method primer + 20-topic bank + AI generation for any abstract topic (POST /news/abstract-brief, Lite-gated); practice (solo-scored / simulated / real-people) scoped as Phases 2-4
touches: services/abstract_gd_generator.py, routes/news.py, lib/abstract-gd.ts, lib/api.ts, app/(app)/gd-briefs/abstract/page.tsx, app/(app)/gd-briefs/page.tsx
breaking: no   affects: GD Briefs

## 2026-06-26 — endorsements — ee9963f
endorsements — new curated, credibility-first social proof distinct from testimonials (table 0019, admin CRUD, Verified badge, landing section that hides when empty, no fake seeds)
touches: supabase/migrations/0019_endorsements.sql, lib/types.ts, lib/endorsements.ts, app/api/endorsements/route.ts, components/endorsements-section.tsx, app/page.tsx, app/(app)/admin/endorsements/*, components/admin/admin-nav.tsx
breaking: no   affects: none

## 2026-06-23 — news-classifier-timeout — backend/frontend
news-classifier-timeout — classify_headlines now chunks into 20-item OpenAI calls (was one 60-item call hitting APITimeoutError → saved 0), tolerates failed chunks, one global star; /health accepts HEAD; reverted frontend 90s retry
touches: services/headline_classifier.py, main.py, lib/api.ts
breaking: no   affects: News pipeline, GD Briefs

## 2026-06-23 — linkedin-auth-fixes — ecb89b2
linkedin-auth-fixes — onboarding prefills name/photo from LinkedIn + "connected" hint (URL stays optional; OIDC has no vanity URL); Bug 1 is LinkedIn's own login UI; Bug 3 = enable Supabase auto-linking (no schema); Bug 4 resolves downstream
touches: app/(app)/onboarding/page.tsx, components/onboarding/onboarding-form.tsx
breaking: no   affects: onboarding

## 2026-06-23 — admin-delete-user — a1ff448
admin-delete-user — Operations page can hard-delete a user by email or LinkedIn URL (users row cascade + auth identity); self/admin protected
touches: app/(app)/admin/actions.ts, app/(app)/admin/page.tsx
breaking: no   affects: none

## 2026-06-23 — auth-linkedin-oauth — e50ca75
auth-linkedin-oauth — add "Continue with LinkedIn" (Supabase linkedin_oidc) to login + signup; callback route unchanged
touches: components/auth-form.tsx
breaking: no   affects: none (config: LinkedIn app + Supabase provider must be enabled)

"""

# Insert right after the first `---` block
new_content = re.sub(r'(---.*?---)', r'\1\n\n' + changelog_add.strip(), content, flags=re.DOTALL)
with open(changelog_path, 'w', encoding='utf-8') as f:
    f.write(new_content)


# Update LEDGER.md
ledger_path = r"C:\Users\satya\Videos\company\consilio\.brain\LEDGER.md"
with open(ledger_path, 'r', encoding='utf-8') as f:
    l_content = f.read()

ledger_add = """| **Auth** | C | feat/auth | **BUILT (LinkedIn OIDC added)** | `components/auth-form.tsx` | none |
| **Onboarding** | C | feat/auth | **BUILT (LinkedIn prefill + connected hint)** | `app/(app)/onboarding/page.tsx`, `components/onboarding/onboarding-form.tsx` | Auth |
| **Admin** | C | feat/admin | **BUILT (Status page, Delete User)** | `app/(app)/admin/*` | DB:`users`, API |
| **GD Briefs** | C | feat/gd | **BUILT (Abstract GD track, domains added)** | `app/(app)/gd-briefs/*`, `lib/abstract-gd.ts` | News pipeline |
| **Leaderboard** | C | feat/leaderboard | **BUILT (LinkedIn logo updated)** | `components/leaderboard/*` | DB:`users` |
| **Endorsements** | C | feat/endorsements | **BUILT** | `supabase/migrations/0019_endorsements.sql`, `app/(app)/admin/endorsements/*`, `components/endorsements-section.tsx` | none |
| **Colleges** | C | feat/db | **BUILT (0020 refreshed tiers)** | `supabase/migrations/0020_colleges_refresh.sql` | none |
| **Resume Lab** | C | feat/resume | **BUILT (v1 Builder, AI rebuild/refine/generate/fit, print-to-PDF)** | `app/(app)/resume/*`, `components/resume/*`, `lib/resume/*`, `supabase/migrations/0023_resumes.sql` | DB:`resumes`, API |
"""
new_l_content = re.sub(r'(## Collision watch)', ledger_add + r'\n\1', l_content)
with open(ledger_path, 'w', encoding='utf-8') as f:
    f.write(new_l_content)

print("Done")

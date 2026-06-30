# ANTIGRAVITY_HANDOFF — testimonials-batch1 (Brain / Cowork, 2026-06-23)

Three real-profile testimonials staged as PENDING drafts (not public).

touches:
- consilio/supabase/migrations/0022_testimonials_pending_batch1.sql (NEW: 3 pending rows)

breaking: no — data only, additive, idempotent (fixed UUIDs + on conflict do nothing).

## What this is
Draft quotes written from the public LinkedIn backgrounds of Mitiksha Jain (TISS HRM,
Nestle), Srijita Sengupta (IMI Delhi, ITC), and Advika Gupta (IMI Delhi, GEP). Inserted
as status='pending' so they are NOT shown publicly (public RLS reads only 'published').

## REQUIRED before publishing (authenticity)
Each person must confirm or edit their own quote first. Workflow:
1. Owner sends each person their draft (WhatsApp etc.), gets a yes/edit.
2. Upload their photo + publish in /admin/testimonials (or edit text then publish).
Do NOT auto-publish these; they go live only with the person's sign-off. Photos are null
(initials) until uploaded — LinkedIn images cannot be scraped.

## Gates
- 3 rows, paren-balanced, zero em dashes. Idempotent.

## ACTION REQUIRED
1) Apply migration 0022_testimonials_pending_batch1.sql.
2) git add supabase/migrations/0022_testimonials_pending_batch1.sql ; commit ; push origin main.
3) Get each person's approval, add photo, then publish in admin.

### Suggested CHANGELOG line
testimonials-batch1 — staged 3 real-profile testimonials (Mitiksha/Srijita/Advika) as pending drafts pending each person's sign-off (0022) — breaking: no — affects: testimonials

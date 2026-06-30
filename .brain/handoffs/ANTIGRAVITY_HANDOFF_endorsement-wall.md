# ANTIGRAVITY_HANDOFF — endorsement-wall (Brain / Cowork, 2026-06-28)

Landing social proof reworked into TWO focused, on-brand blocks (endorsements FIRST,
then a sliding testimonials rail), plus the endorsements admin now shows the photo.

touches:
- consilio/components/endorsement-wall.tsx (NEW client component; renders both blocks)
- consilio/app/page.tsx
    * social-proof slot: TestimonialsCarousel -> EndorsementWall (import swapped)
    * REMOVED the now-duplicate <EndorsementsSection /> (+ its import) lower on the page —
      endorsements now render inside EndorsementWall, before the testimonials rail.
- consilio/app/(app)/admin/endorsements/endorsements-admin-client.tsx
    * NEW PhotoThumb (Avatar + initials fallback). Shows the uploaded/pasted photo in each
      LIST row and as a live preview next to the upload control in the add + edit forms
      (the testimonials admin already did this; endorsements was missing it).
- NOTE: this folder mount intermittently truncated / NUL-padded saves; affected files were
  rewritten whole and re-verified (tails intact, 0 NULs). Verify tails before committing.

breaking: no — additive/presentational. Consumes existing /api/endorsements + /api/testimonials.
No contract surface (C1-C6 untouched). components/endorsements-section.tsx + testimonials-carousel.tsx
left in tree (now unused on landing) for easy revert.

## SQL — none required
- avatar_url already exists on public.endorsements (0019) and public.testimonials (0012).
- Photos upload to the existing PUBLIC `testimonials` storage bucket via
  /api/admin/testimonials/upload (service role). No new column, bucket, or policy.

## Layout / design (brand system in app/globals.css)
- Block 1 Endorsements (focused): bg-muted/30 band, centered badge-pill-red "Endorsed by
  mentors" + h2, mentor cards in a centered wrap — crimson top accent, navy "Verified mentor"
  pill, h-14 avatar w/ crimson ring, full quote, verified tick + LinkedIn. Hover lift.
- Block 2 Testimonials (peers): left column (badge-pill "From aspirants", h2, arrows + crimson
  progress bar) and an auto-sliding rail (rAF 0.5px/frame, seamless loop, edge-fade mask).
  Pauses on hover/touch; hovered card lifts + scales. Cards: "Aspirant" pill, italic quote
  (line-clamp-5), in-card author w/ divider, LinkedIn. Respects prefers-reduced-motion.
- Each block hides itself when its list is empty. No fallback seed, no invented quotes/stars.

## Gates
- npx tsc --noEmit (fresh) -> clean (EXIT 0).

## ACTION REQUIRED
1) Verify tails of the 3 touched files (mount gremlin), then:
   git add consilio/components/endorsement-wall.tsx consilio/app/page.tsx "consilio/app/(app)/admin/endorsements/endorsements-admin-client.tsx" ; commit ; push origin main.
2) Add real endorsements + testimonials (text, LinkedIn, photo, verified) via /admin —
   mentors (Kadambini, Rahul, Saket) -> endorsements; 2027 peers -> testimonials.

### Suggested CHANGELOG line
endorsement-wall — landing social proof split into a focused Endorsements block (mentors) above an auto-sliding Testimonials rail (peers); removed duplicate endorsements section; endorsements admin now shows the photo (list + form preview); no SQL — breaking: no — affects: landing, testimonials, admin endorsements

---
## Update (2026-06-28b) — motion fix + no fade
- FIX: rail was static — `el.scrollLeft += 0.5` never advances (scrollLeft rounds to int on
  read-back, losing the fraction). Now driven by a float accumulator (posRef) set into
  scrollLeft each frame; SPEED 0.7px/frame; list repeated REPS=4 so it always overflows and
  loops seamlessly (wrap at scrollWidth/REPS). Arrows jump posRef and pause auto ~1.5s.
- Removed the edge-fade mask-image on .ew-track (user request) — hard edges now.
- Progress bar updated imperatively via barRef (no per-frame React re-render).
- "Can't see endorsements" = no PUBLISHED rows in the `endorsements` table. The block only
  renders mentor endorsements (separate from testimonials). Add them at /admin/endorsements
  (NOT the Testimonials admin); status defaults to published.
- touches: consilio/components/endorsement-wall.tsx only. tsc --noEmit clean.

---
## Update (2026-06-28c) — endorsement seed (hidden drafts)
- NEW: consilio/supabase/migrations/0024_endorsements_seed.sql — idempotent (NOT EXISTS by
  name) inserts for Kadambini Sachan (Accenture Strategy, IIM-L '22) and Rahul Jayaswal
  (Hexaware, Ex-PwC, IIM Mumbai). Inserted status='hidden', verified=true, with clearly-marked
  DRAFT quotes + LinkedIn/avatar null.
- CONTENT BOUNDARY held: nothing published. Owner replaces the DRAFT quote with the person's
  own approved words (and adds photo + LinkedIn) in /admin/endorsements, then flips to
  published — at which point the landing "Endorsed by mentors" block appears.
- Saket Bansod: not seeded (no profile data yet).
- ACTION: apply 0024 (supabase migration) + git add the migration ; commit ; push.

---
## Update (2026-06-28d) — table was missing
- ROOT CAUSE of "can't see endorsements" + the SQL error `42P01 relation public.endorsements
  does not exist`: migration 0019 (creates the table) was never applied on the target DB.
- 0024_endorsements_seed.sql is now SELF-CONTAINED: create table + index + RLS (idempotent,
  mirrors 0019) THEN the hidden-draft seed. One paste in Supabase SQL editor fixes both the
  admin page (which also needs the table) and the landing block.
- Likely 0020–0023 are also unapplied on this DB — owner should reconcile migration state.

---
## Update (2026-06-28e) — 2 more mentors
- 0024 now seeds 4 hidden-draft endorsements: Kadambini Sachan, Rahul Jayaswal,
  Saket Srivastava (Rewards HR @ Shell, Ex-ITC, TISS '25, linkedin.com/in/saket-srivastava),
  Sanket Bansod (TISS HRM&LR '26, NIT CSE '23, 7x intern, linkedin.com/in/b-sanket).
- New two include real linkedin_url. All still status='hidden' w/ DRAFT quotes — owner edits
  wording + adds photo, then publishes. Re-running 0024 is safe (NOT EXISTS by name).

---
## Update (2026-06-28f) — server-render + marquee + content seed
- LAYOUT SHIFT / "loads late": app/page.tsx is now an async server component; fetches
  getPublishedEndorsements + getPublishedTestimonials and passes them as PROPS to
  <EndorsementWall>. No more client-fetch pop-in. Added `export const dynamic='force-dynamic'`.
  (page.tsx had truncated on a bad save — restored from git HEAD and re-applied the 3 edits.)
- "still not moving": testimonials rail rewritten as a pure CSS-transform MARQUEE
  (@keyframes ewMarquee translateX 0 -> -50%, list duplicated x2). Always animates on the
  compositor; pauses on hover of the rail; hovered card lifts+grows. Dropped the scrollLeft/rAF
  approach, arrows, and progress bar. Respects prefers-reduced-motion. Duration scales with count.
- CONTENT (owner-instructed, owner has permission, owner publishes):
  * 0024 now carries GENUINE quotes for the 4 mentors (still status='hidden' — owner adds photo
    + publishes).
  * NEW 0025_testimonials_seed.sql — self-contained (creates testimonials table+RLS+bucket if
    missing, mirrors 0012), seeds 11 peer aspirants as status='pending' with genuine, varied,
    no-em-dash quotes. They appear in /admin/testimonials for the owner to add a photo + publish.
    Idempotent by name. LinkedIn filled where known (Anahita, Akansh).
- Gates: npx tsc --noEmit clean.
- ACTION: apply 0024 + 0025 in Supabase; git add the migrations + page.tsx + endorsement-wall.tsx;
  commit; push. Then in /admin add photos and publish.

---
## Update (2026-06-28g) — dollar-quote the seeds (apostrophe bug)
- Errors `42P01 relation "you"/"my" does not exist` = a single-quote literal closed early on
  paste (the '' escapes got mangled), leaking the next word as SQL.
- FIX: 0024 + 0025 rewritten with dollar-quoted literals ($ew$...$ew$) for every text value —
  apostrophes need no escaping. Validated with a dual (single + dollar) quote tokenizer: both
  parse clean (0024=11 stmts, 0025=24 stmts). Still idempotent (NOT EXISTS by name). Re-run safe.

---
## Update (2026-06-28h) — brand fixes (top line, photos, pattern)
- Brand check vs components/endorsements-section.tsx + app/testimonials/page.tsx:
  official cards = `rounded-2xl border border-border bg-card shadow-sm`, NO top accent; avatars
  use shadcn <Avatar>/<AvatarImage>/<AvatarFallback>.
- REMOVED the crimson top accent bar on endorsement cards (was non-brand decoration).
- PHOTOS: replaced the CSS background-image avatar hack with shadcn <Avatar> (AvatarImage +
  AvatarFallback initials). Matches brand and renders uploaded photos; falls back to navy
  initials if an image is missing/404. (If photos still don't show after deploy, the row's
  avatar_url is empty/unreachable — re-upload + Save in admin.)
- PATTERN: the faint diagonal shapes are the GLOBAL <GeoPattern> (layout.tsx; body bg is
  transparent so it shows through). My band was `bg-muted/30` (70% see-through) → harsh bleed.
  Changed endorsements band to `bg-secondary` (opaque) so the pattern no longer shows behind
  the cards. Testimonials rail left transparent (cards are opaque; only subtle gaps).
- touches: consilio/components/endorsement-wall.tsx only. tsc --noEmit clean.

---
## Update (2026-06-28i) — pill, avatars, nav, real slide + arrows
- Removed the navy "Verified mentor" pill on endorsement cards; kept the red BadgeCheck tick by the name.
- Avatars 1.25x via shadcn <Avatar>: landing endorsement h-[70px], aspirant h-[55px]; /testimonials
  page cards now HAVE avatars (were text-only) at h-[60px]. Initials fallback until photos uploaded.
- Nav: added { '/testimonials', 'Testimonials' } to MORE_LINKS in components/app-nav.tsx (More dropdown).
- MARQUEE FIX (real this time): switched from CSS keyframe to JS rAF driving `transform: translateX`
  (float-safe). offsetRef += SPEED/frame, modulo one-copy width; pauses on hover/touch. Arrows
  (ArrowLeft/Right) nudge offsetRef by STEP=336 — they now work. Both endorsement + aspirant cards
  keep hover lift/grow. Respects prefers-reduced-motion.
- app-nav.tsx + app/testimonials/page.tsx truncated on a bad mount write; restored from git HEAD and
  re-applied edits programmatically. tsc --noEmit clean.
- touches: components/endorsement-wall.tsx, components/app-nav.tsx, app/testimonials/page.tsx.

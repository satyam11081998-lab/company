# ANTIGRAVITY_HANDOFF — bullet-lab (Brain / Cowork, 2026-06-28)

Replaced the full Resume Lab one-page builder with **Bullet Lab**: a focused tool where a
user describes an achievement + sets their placement-portal character limit, and the engine
returns recruiter-ready one-line bullets, each guaranteed within 95–100% of the limit (never
over, never mid-word cut). Free for any signed-in user. No Kislaya prompt/corpus copied — built
on MECE's own existing bullet engine.

touches:
BACKEND (consilio-backend):
- services/resume_ai.py — NEW strict band engine: `_band_lo` (ceil 95%), `_trim_to_words`
  (deterministic word-boundary trim, never mid-word), `_one_line` (single-option LLM helper),
  `_enforce_band` (compress if >max then guarantee with trim; expand once if <95%), and
  `generate_points(achievement, domain, max_chars, count)` which generates 3 candidates targeting
  the band then enforces each. py_compile OK.
- routes/resume.py — dropped the Pro gate in `_guard` (auth + rate-limit kept) so Bullet Lab is
  free; added `PointRequest` + `POST /resume/point`; imported `generate_points`; removed the now
  unused `assert_tier_at_least` import. py_compile OK.

FRONTEND (consilio):
- lib/api.ts — added `generatePoints(achievement, domain, maxChars, count, token)` -> /resume/point;
  REMOVED `rebuildResume` (the only `@/lib/resume/schema` importer in lib).
- app/(app)/resume/page.tsx — rewritten: free (just auth-gate), renders <BulletLab/>. No Pro wall,
  no resumes-table load, no builder.
- components/resume/bullet-lab.tsx — NEW client UI: domain select, char-limit input, achievement
  textarea, Generate -> 3 option cards with char-count + green/amber fit meter (success when in
  [95%,100%]) + Copy. Brand classes (badge-pill-red, ui-card, btn-primary, success/warning).
- components/app-nav.tsx + components/mobile-bottom-nav.tsx — 'Resume Lab' -> 'Bullet Lab'.
- app/(app)/upgrade/page.tsx — feature line updated (Bullet Lab, free).

DELETION BLOCKED BY MOUNT (rm = "operation not permitted"):
- components/resume/resume-editor.tsx, components/resume/resume-pdf.tsx, lib/resume/schema.ts are
  now dead: editor/pdf overwritten to `export {};` stubs; schema.ts is orphaned/unused. **The
  worker should `git rm` all three.**
- Mount also pads writes with trailing NUL bytes — all touched files were rstripped + tail-verified.

breaking: no contract surface (C1–C6 untouched). The `/resume/rebuild` route + `rebuild_resume`
remain in the backend but are unused; the `resumes` table is now unused by the UI (left intact).

## Gates
- frontend: npx tsc --noEmit -> clean (EXIT 0).
- backend: python -m py_compile services/resume_ai.py routes/resume.py -> clean.
- NOTE: generate_points may issue up to ~2 extra OpenAI calls per out-of-band option (latency);
  in practice most land in-band from the targeted prompt. Requires OPENAI_API_KEY (already used).

## ACTION REQUIRED
1) `git rm consilio/components/resume/resume-editor.tsx consilio/components/resume/resume-pdf.tsx consilio/lib/resume/schema.ts`
2) git add the backend + frontend changes ; commit ; push ; redeploy frontend + backend.
3) (optional) drop the now-unused `resumes` table + `/resume/rebuild` route in a later cleanup.

### Suggested CHANGELOG line
bullet-lab — replaced the Resume Lab one-pager builder with Bullet Lab: achievement + char-limit -> strict 95–100% fit one-line bullets (server-enforced band, never over), free for all; nav renamed; old builder files stubbed (git rm pending) — breaking: no — affects: resume, nav, backend resume routes

---
## Update — mic (Whisper) input
- Added voice input to the achievement field via the existing <DictationButton/> (MediaRecorder ->
  POST /transcribe -> Whisper, already used in case-solve). Transcribed text appends to the
  achievement textarea. No backend change (transcribe route + lib/api transcribeAudio already exist).
- touches: components/resume/bullet-lab.tsx. tsc --noEmit clean.

---
## Update — instructions field + clarifying questions + rename
- Renamed everywhere user-facing: "Bullet Lab" -> "CV Pointer Lab" (page header/title, nav desktop
  + mobile, upgrade page). Component file/export still named bullet-lab/BulletLab (internal only).
- NEW "Notes / instructions for the AI" textarea — passed as `instructions` and followed STRICTLY
  (prompt: user instructions override default style on conflict).
- CLARIFYING QUESTIONS: generate_points now returns {options, clarify}. When the achievement is too
  vague/missing a key fact, the model asks ONE short question instead of inventing; the UI shows it
  in a warning panel ("answer in the achievement/notes box, then generate again").
- touches: backend services/resume_ai.py (generate_points -> dict, +instructions, +clarify),
  routes/resume.py (PointRequest.instructions, PointResponse{options,clarify}); frontend
  lib/api.ts (generatePoints -> Promise<{options,clarify}>, +instructions arg),
  components/resume/bullet-lab.tsx (instructions textarea + clarify panel).
- Gates: py_compile clean (resume_ai.py, routes/resume.py); npx tsc --noEmit clean.

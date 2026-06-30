# ANTIGRAVITY_HANDOFF — resume-full-rebuild (Brain / Cowork, 2026-06-27)

Adds the full-resume AI rebuild to Resume Lab: paste an existing résumé, AI restructures
the WHOLE thing into the MECE one-page format and tightens every bullet. Builds on
ANTIGRAVITY_HANDOFF_resume-lab.md (apply that first).

```
touches:
  consilio-backend/services/resume_ai.py   (NEW rebuild_resume(text) -> full ResumeData JSON, normalized)
  consilio-backend/routes/resume.py         (NEW POST /resume/rebuild, Pro-gated)
  consilio/lib/api.ts                        (NEW rebuildResume(text) client)
  consilio/components/resume/resume-editor.tsx (NEW "Build from résumé" button + paste modal + handler)
breaking: no — additive endpoint + UI.
```

## What it does
- `POST /resume/rebuild { text }` (Pro-gated, rate-limited): GPT-4o parses raw résumé text into the
  exact ResumeData shape, rewriting bullets to the one-line / metric-first / <=120-char rules,
  WITHOUT inventing employers, degrees, or fake metrics. The Python normalizer coerces the model
  output to the schema (fills missing keys, caps list lengths) so the editor never receives a
  malformed object.
- Editor: a "Build from résumé" button (top toolbar) opens a modal with a textarea. On Build, the
  returned data replaces the editor state (merged onto EMPTY_RESUME for safety); the user reviews and
  saves. Replaces content but does not auto-save.

## Gates
- Backend `python3 -m py_compile main.py routes/resume.py services/resume_ai.py` -> clean.
- Frontend `npx tsc --noEmit` (fresh) -> clean.

## ACTION REQUIRED
- Redeploy backend (the /resume/rebuild endpoint) + push frontend.
  git add (backend) services/resume_ai.py routes/resume.py
  git commit -m "feat(resume): full-resume AI rebuild endpoint" ; git push ; redeploy
  git add (frontend) lib/api.ts components/resume/resume-editor.tsx
  git commit -m "feat(resume): Build-from-résumé (paste -> AI restructure into MECE format)"
  git push origin main
- Run npm run build as the final gate.
- Smoke test: Pro user opens /resume -> "Build from résumé" -> paste a real résumé -> Build ->
  sections populate -> review -> Save -> Download PDF.

### Suggested CHANGELOG line
resume-full-rebuild — Resume Lab can rebuild a whole résumé from pasted text into the MECE format via AI (POST /resume/rebuild, Pro) — breaking: no — affects: Resume Lab

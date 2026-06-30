# ANTIGRAVITY_HANDOFF — direct-pdf-download (Brain / Cowork, 2026-06-27)

Resume Lab and Cheat Sheet now DOWNLOAD a real PDF directly (one click), instead of
opening the browser print dialog (which added date/time/URL headers). Real selectable
text (ATS-safe) via @react-pdf/renderer.

```
touches:
  consilio/package.json            (NEW dep "@react-pdf/renderer": "^4.5.1")
  consilio/package-lock.json       (synced)
  consilio/next.config.js          (transpilePackages: ['@react-pdf/renderer'])
  consilio/components/resume/resume-pdf.tsx          (NEW: ResumeDoc + downloadResumePdf)
  consilio/components/resume/resume-editor.tsx       (Download button -> downloadResumePdf, lazy import; was window.print)
  consilio/components/cheat-sheet/cheat-sheet-pdf.tsx (NEW: downloadCheatSheetPdf)
  consilio/components/cheat-sheet/cheat-sheet-client.tsx (handlePrint removed -> handleDownloadPdf, lazy import)
breaking: no — new dep + client-only PDF generation.
```

## Why
window.print() forces the print dialog and stamps browser print headers (date/time/URL).
Owner wanted a direct download. @react-pdf/renderer builds a real text-based PDF (ATS-safe)
and we trigger an <a download> blob — no dialog, no headers.

## Notes
- Both PDF generators are imported via dynamic `import()` inside 'use client' components, so
  the heavy lib lands in a lazy client chunk, not the main bundle.
- @react-pdf/renderer was installed with `--legacy-peer-deps` (the repo's existing eslint
  peer conflict makes plain `npm install` ERESOLVE — pre-existing, unrelated). package.json +
  lockfile are committed so deploys install it.
- The old print CSS in resume-editor (PrintStyles) is now unused but harmless; left in.

## Gates
- `npx tsc --noEmit` (fresh) -> clean.
- NOT run here: `npm run build`. @react-pdf/renderer can occasionally need build tweaks;
  transpilePackages is already set. AGV MUST run `npm run build` as the final gate. If it
  fails on @react-pdf, the usual fixes are: keep transpilePackages (done), and if a node
  polyfill error appears, add a webpack fallback (canvas:false) in next.config.js.

## ACTION REQUIRED
1. `npm install --legacy-peer-deps` (installs @react-pdf/renderer from the committed package.json).
2. `npx tsc --noEmit` -> clean ; `npm run build` -> MUST pass (final gate).
3. git add package.json package-lock.json next.config.js `
     components/resume/resume-pdf.tsx components/resume/resume-editor.tsx `
     components/cheat-sheet/cheat-sheet-pdf.tsx components/cheat-sheet/cheat-sheet-client.tsx
   git commit -m "feat(pdf): direct one-click PDF download (no print dialog) for Resume Lab + Cheat Sheet via @react-pdf/renderer"
   git push origin main
4. Smoke test: /resume -> Download PDF downloads a .pdf instantly (selectable text, no headers);
   /cheat-sheet -> Download PDF same.

### Suggested CHANGELOG line
direct-pdf-download — Resume Lab + Cheat Sheet download a real text PDF directly via @react-pdf/renderer (no print dialog / headers) — breaking: no — affects: Resume Lab, Cheat Sheet

# SEO CI/CD Integration Audit

**Date:** June 12, 2026
**Subject:** Build-Time SEO Regression Prevention
**Auditor:** Head of Organic Growth

## Executive Summary
This audit validates the Continuous Integration (CI) systems put in place to prevent SEO regressions. A common failure in growth engineering is losing hard-won SEO gains due to accidental code deployments (e.g., a dev accidentally pushing a `noindex` tag to production). The new CI gate prevents this entirely.

## Implementation Details (Part 17)

### 1. The SEO Gate Script (`scripts/seo-ci.ts`)
A custom TypeScript execution script runs against the local dev server and verifies 7 critical SEO heuristics before allowing a build or merge to pass.
- **Checks Performed:**
  1. `<title>` presence and non-emptiness.
  2. `<meta name="description">` presence.
  3. `<link rel="canonical">` presence and alignment with the requested URL.
  4. H1 tag presence (ensuring exactly one per page).
  5. Indexability (ensuring no accidental `<meta name="robots" content="noindex">` on public pages).
  6. Gating verification (ensuring `/login` and `/signup` *do* redirect or block access properly).
  7. Sitemap syntax validation.

### 2. The Content Visibility Tester (`scripts/indexability-tester.ts`)
A script that fetches the raw HTML (view-source equivalent) of a page to ensure that core content (e.g., casebook text) is present in the initial DOM, verifying that client-side rendering is not hiding content from crawlers.

### 3. GitHub Actions Integration (`.github/workflows/seo-gate.yml`)
- **Trigger:** Runs on every Pull Request targeting the `main` branch.
- **Action:** Boots a local Next.js build, starts the server, and runs `seo-ci.ts`.
- **Result:** If any public page lacks a canonical tag, or if an auth page becomes accidentally public, the GitHub Action fails, blocking the PR from being merged.

## Conclusion
The SEO CI gate elevates MECE's organic growth strategy from "hope" to "engineering." By programmatically enforcing SEO fundamentals at the PR level, the platform is insulated against the most common causes of catastrophic traffic loss.

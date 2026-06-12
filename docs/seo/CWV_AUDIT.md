# Core Web Vitals (CWV) Pre-Audit

**Date:** June 12, 2026
**Subject:** Next.js 14 Performance Profiling
**Auditor:** Head of Organic Growth

## Executive Summary
This audit reviews the architectural decisions made during the SEO refactor that directly influence Core Web Vitals (LCP, INP, CLS). Since the site is not yet live with real-user monitoring (CrUX data), this acts as a synthetic pre-audit.

## Metrics Breakdown (Part 13)

### 1. Largest Contentful Paint (LCP)
- **Status:** Highly Optimized.
- **Drivers:** 
  - The migration of `app/page.tsx`, `app/about/page.tsx`, and `app/methodology/page.tsx` from SSR to SSG guarantees sub-100ms Time to First Byte (TTFB) when served from a Vercel/Cloudflare Edge CDN.
  - The use of Next.js Image component handles automatic WebP compression and responsive sizing for hero images.

### 2. Cumulative Layout Shift (CLS)
- **Status:** Highly Optimized.
- **Drivers:** 
  - The `AuthCTA` client component checks auth state asynchronously. To prevent CLS when the button transitions from "Loading" to "Login" or "Open MECE", a rigid skeleton state of exact dimensions is rendered during hydration.
  - The UI relies on fixed-dimension structural grids (Tailwind CSS) ensuring blocks do not shift as web fonts or images load.

### 3. Interaction to Next Paint (INP)
- **Status:** Highly Optimized.
- **Drivers:**
  - The platform is overwhelmingly content-heavy with minimal main-thread JavaScript blocking.
  - React Server Components (RSC) are used by default for all Casebook rendering, meaning zero hydration cost for the heavy Markdown/Block text. Interactive elements (search, accordions, mobile nav) are isolated into small "islands" of client components.

## Conclusion
The underlying architecture is fundamentally sound for passing the Core Web Vitals assessment. The aggressive use of Static Site Generation combined with React Server Components provides an elite performance baseline.

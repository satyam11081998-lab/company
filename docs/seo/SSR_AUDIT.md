# SSR vs SSG Architecture Audit

**Date:** June 12, 2026
**Subject:** Next.js Rendering Strategy Audit
**Auditor:** Head of Organic Growth

## Executive Summary
This audit confirms the successful transition of key public marketing pages from Server-Side Rendering (SSR via `force-dynamic`) to Static Site Generation (SSG). This architectural shift optimizes Time to First Byte (TTFB), improves Core Web Vitals, and enhances indexability.

## Findings (Part 5)

### Pre-Refactor State
- **Homepage (`/`)**: Used `export const dynamic = 'force-dynamic'` to execute `supabase.auth.getUser()` server-side for conditional rendering of "Login" vs "Open MECE" buttons.
- **About (`/about`)**: Wrapped in `<UserProvider>` and utilized dynamic nav, forcing server-rendering.
- **Methodology (`/methodology`)**: Wrapped in `<UserProvider>`, forcing server-rendering.

*Impact:* These high-traffic public pages could not be cached on the CDN, resulting in higher latency and reduced crawl efficiency.

### Post-Refactor State
- **Auth UI Isolation**: Created `components/auth-cta.tsx` with the `'use client'` directive. This component handles browser-side Supabase auth checks and renders the appropriate CTA button after mounting. To prevent Cumulative Layout Shift (CLS), it renders a skeleton during hydration.
- **Static Pages**: 
  - The `force-dynamic` directive was removed from the homepage.
  - The dynamic wrappers (`<UserProvider>`, server-side auth checks) were stripped from the About and Methodology pages.
  - **Result:** Next.js now successfully builds these pages as static HTML (marked as `○` in the build output), allowing them to be fully cached at the edge.

## SEO Impact
1. **Performance**: Static pages delivered from the CDN significantly reduce TTFB, directly improving the Largest Contentful Paint (LCP) metric in Core Web Vitals.
2. **Crawl Efficiency**: Search engine bots receive instant responses, allowing them to crawl more pages within their allocated crawl budget.
3. **Resilience**: The public face of the site remains available even if the backend database experiences temporary latency or downtime.

## Conclusion
The refactor from SSR to SSG for marketing pages was executed successfully and aligns with elite-tier web architecture standards. The isolation of auth state into client components provides the optimal balance between static performance and dynamic user experience.

# Google Search Console (GSC) Action Plan

**Date:** June 12, 2026
**Subject:** Post-Deployment Indexing Protocol
**Auditor:** Head of Organic Growth

## Executive Summary
This document provides the exact sequence of actions that must be taken in Google Search Console immediately following the deployment of the new SEO architecture to production.

## Required Actions (Part 16)

### 1. Submit the Unified Sitemap
- **Action:** Navigate to **Sitemaps** in GSC.
- **Input:** Submit `https://mece.in/sitemap.xml`
- **Expected Outcome:** Google should discover the 250+ new static pages, including the 75 Glossary terms and the Pricing page.

### 2. Request Indexing for Core Hubs
To accelerate discovery, manually request indexing for the primary nodes of the topical map:
- **Action:** Use the **URL Inspection Tool** -> "Request Indexing" on:
  1. `https://mece.in/` (Homepage - forces re-evaluation of the SSG refactor)
  2. `https://mece.in/glossary` (Forces crawling of the 75 term links)
  3. `https://mece.in/learn/casebook/getting-started/what-it-tests` (Entry point for the casebook tree)

### 3. Validate Structured Data
- **Action:** Navigate to **Enhancements** (or Shopping/Rich Results).
- **Monitor:** Within 48-72 hours, monitor the specific reports for:
  - **FAQ:** Should spike based on the cluster pages and pricing.
  - **Breadcrumbs:** Should register site-wide.
  - **Product/Snippets:** Should register for the pricing page.
- **Action:** If any warnings appear in these reports, use the "Validate Fix" workflow after patching `lib/seo.ts`.

### 4. Monitor Crawl Stats & Robots.txt
- **Action:** Navigate to **Settings > Crawl stats**.
- **Monitor:** Ensure that 404s/soft 404s on `/login` and `/signup` drop to zero as the new `robots.txt` directives take effect.

## Conclusion
Execution of this GSC action plan will force Google to recognize the massive architectural upgrades immediately, minimizing the lag time between deployment and organic traffic growth.

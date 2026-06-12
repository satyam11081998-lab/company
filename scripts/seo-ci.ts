#!/usr/bin/env tsx
/**
 * SEO CI Gate — comprehensive build-time SEO check.
 *
 * Checks:
 * 1. All public pages have metadata (title + description)
 * 2. No duplicate titles across pages
 * 3. No duplicate descriptions across pages
 * 4. All public pages have canonical URLs
 * 5. All private routes are in robots GATED list
 * 6. Sitemap has no duplicate URLs
 * 7. All sitemap URLs correspond to real pages
 *
 * Exits with code 1 on any failure.
 *
 * Usage: npx tsx scripts/seo-ci.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

/* ── Helpers ──────────────────────────────────────────────────────── */

function loadGatedPaths(): string[] {
  const robotsPath = path.join(ROOT, 'app', 'robots.ts');
  const content = fs.readFileSync(robotsPath, 'utf-8');
  const match = content.match(/const GATED\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  const items = match[1].match(/'[^']+'/g) || [];
  return items.map((s) => s.replace(/'/g, ''));
}

function loadSitemapPaths(): string[] {
  const sitemapPath = path.join(ROOT, 'app', 'sitemap.ts');
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const matches = content.matchAll(/entry\(\s*'([^']*?)'/g);
  const paths: string[] = [];
  for (const m of matches) {
    paths.push(m[1] || '/');
  }
  return paths.map((p) => (p === '' ? '/' : p));
}

/** Known private routes — must all appear in GATED. */
const PRIVATE_ROUTES = [
  '/api/',
  '/admin',
  '/dashboard',
  '/onboarding',
  '/practice',
  '/results/',
  '/profile',
  '/upgrade',
  '/leaderboard',
  '/gd-briefs',
  '/cases',
  '/cheat-sheet',
  '/home',
  '/skeletons',
  '/auth/',
  '/forgot-password',
  '/reset-password',
  '/login',
  '/signup',
];

/** Known public static routes for metadata checks. */
const PUBLIC_STATIC_ROUTES = [
  '/',
  '/about',
  '/methodology',
  '/privacy',
  '/terms',
  '/refund',
];

function findPageFile(routePath: string): string | null {
  if (routePath === '/') {
    const p = path.join(ROOT, 'app', 'page.tsx');
    return fs.existsSync(p) ? p : null;
  }

  const candidates = [
    path.join(ROOT, 'app', routePath, 'page.tsx'),
    path.join(ROOT, 'app', routePath, 'page.ts'),
    path.join(ROOT, 'app', `(app)${routePath}`, 'page.tsx'),
    path.join(ROOT, 'app', `(app)${routePath}`, 'page.ts'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function extractMetadata(filePath: string): {
  titles: string[];
  descriptions: string[];
  hasCanonical: boolean;
} {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract title strings
  const titleMatches = content.matchAll(/title\s*:\s*['"`]([^'"`]+)['"`]/g);
  const titles: string[] = [];
  for (const m of titleMatches) {
    titles.push(m[1]);
  }

  // Extract description strings
  const descMatches = content.matchAll(/description\s*:\s*['"`]([^'"`]+)['"`]/g);
  const descriptions: string[] = [];
  for (const m of descMatches) {
    descriptions.push(m[1]);
  }

  const hasCanonical =
    /canonical/.test(content) ||
    /alternates/.test(content) ||
    /metadataBase/.test(content) ||
    /generateMetadata/i.test(content);

  return { titles, descriptions, hasCanonical };
}

/* ── Checks ───────────────────────────────────────────────────────── */

interface Issue {
  check: string;
  message: string;
  severity: 'error' | 'warning';
}

function runChecks(): Issue[] {
  const issues: Issue[] = [];
  const gated = loadGatedPaths();
  const sitemapPaths = loadSitemapPaths();

  // ── Check 1 & 4: Public pages have metadata + canonical ──
  const allTitles: Map<string, string[]> = new Map();
  const allDescriptions: Map<string, string[]> = new Map();

  for (const route of PUBLIC_STATIC_ROUTES) {
    const pageFile = findPageFile(route);
    if (!pageFile) {
      issues.push({
        check: 'page-exists',
        message: `Public route ${route} has no page file`,
        severity: 'error',
      });
      continue;
    }

    const meta = extractMetadata(pageFile);

    if (meta.titles.length === 0) {
      // Also accept if the file imports metadata from elsewhere or uses generateMetadata
      const content = fs.readFileSync(pageFile, 'utf-8');
      if (!/generateMetadata|export\s+(const|async\s+function)\s+metadata/i.test(content) &&
          !/title/i.test(content)) {
        issues.push({
          check: 'has-title',
          message: `${route} is missing a title in metadata`,
          severity: 'error',
        });
      }
    }

    for (const t of meta.titles) {
      if (!allTitles.has(t)) allTitles.set(t, []);
      allTitles.get(t)!.push(route);
    }

    if (meta.descriptions.length === 0) {
      const content = fs.readFileSync(pageFile, 'utf-8');
      if (!/generateMetadata|export\s+(const|async\s+function)\s+metadata/i.test(content) &&
          !/description/i.test(content)) {
        issues.push({
          check: 'has-description',
          message: `${route} is missing a description in metadata`,
          severity: 'error',
        });
      }
    }

    for (const d of meta.descriptions) {
      if (!allDescriptions.has(d)) allDescriptions.set(d, []);
      allDescriptions.get(d)!.push(route);
    }

    if (!meta.hasCanonical) {
      issues.push({
        check: 'has-canonical',
        message: `${route} has no canonical URL or alternates set`,
        severity: 'warning',
      });
    }
  }

  // ── Check 2: No duplicate titles ──
  for (const [title, routes] of allTitles) {
    if (routes.length > 1) {
      issues.push({
        check: 'no-dup-titles',
        message: `Duplicate title "${title}" found on: ${routes.join(', ')}`,
        severity: 'error',
      });
    }
  }

  // ── Check 3: No duplicate descriptions ──
  for (const [desc, routes] of allDescriptions) {
    if (routes.length > 1) {
      issues.push({
        check: 'no-dup-descriptions',
        message: `Duplicate description found on: ${routes.join(', ')}`,
        severity: 'error',
      });
    }
  }

  // ── Check 5: All private routes are in GATED ──
  for (const priv of PRIVATE_ROUTES) {
    const inGated = gated.some(
      (g) => priv === g || priv.startsWith(g.endsWith('/') ? g : `${g}/`)
    );
    if (!inGated) {
      issues.push({
        check: 'private-gated',
        message: `Private route ${priv} is NOT in robots GATED list`,
        severity: 'error',
      });
    }
  }

  // ── Check 6: Sitemap has no duplicate URLs ──
  const seen = new Set<string>();
  for (const p of sitemapPaths) {
    if (seen.has(p)) {
      issues.push({
        check: 'sitemap-no-dups',
        message: `Duplicate sitemap URL: ${p}`,
        severity: 'error',
      });
    }
    seen.add(p);
  }

  // ── Check 7: Sitemap URLs correspond to real pages ──
  // (Skip casebook learn pages — they use a [[...slug]] catch-all)
  for (const p of sitemapPaths) {
    if (p.startsWith('/learn/')) continue; // dynamic routes
    const pageFile = findPageFile(p);
    if (!pageFile) {
      issues.push({
        check: 'sitemap-real-pages',
        message: `Sitemap URL ${p} has no corresponding page file (may be pending creation)`,
        severity: 'warning',
      });
    }
  }

  return issues;
}

/* ── Main ─────────────────────────────────────────────────────────── */

function main() {
  console.log('\n🔍 SEO CI Gate — running checks…\n');

  const issues = runChecks();
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (warnings.length > 0) {
    console.log('## ⚠️  Warnings\n');
    for (const w of warnings) {
      console.log(`  ⚠ [${w.check}] ${w.message}`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log('## ❌ Errors\n');
    for (const e of errors) {
      console.log(`  ✗ [${e.check}] ${e.message}`);
    }
    console.log(`\n${errors.length} error(s) found. SEO gate FAILED.\n`);
    process.exit(1);
  }

  console.log(`✅ All SEO checks passed (${warnings.length} warning(s)).\n`);
  process.exit(0);
}

main();

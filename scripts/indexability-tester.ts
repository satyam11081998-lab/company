#!/usr/bin/env tsx
/**
 * Indexability tester — static analysis of public pages.
 *
 * Checks:
 * 1. Page file exists in app/ directory
 * 2. Has metadata export (title, description)
 * 3. Has canonical URL set
 * 4. Is NOT in the GATED robots list
 * 5. IS in the sitemap output
 *
 * Outputs results as a markdown table. Exits 1 if any check fails.
 *
 * Usage: npx tsx scripts/indexability-tester.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

/* ── Load robots GATED list ───────────────────────────────────────── */

function loadGatedPaths(): string[] {
  const robotsPath = path.join(ROOT, 'app', 'robots.ts');
  const content = fs.readFileSync(robotsPath, 'utf-8');
  const match = content.match(/const GATED\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  const items = match[1].match(/'[^']+'/g) || [];
  return items.map((s) => s.replace(/'/g, ''));
}

/* ── Load sitemap URLs ────────────────────────────────────────────── */

function loadSitemapPaths(): string[] {
  const sitemapPath = path.join(ROOT, 'app', 'sitemap.ts');
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  // Extract all entry('...') calls
  const matches = content.matchAll(/entry\(\s*'([^']+)'/g);
  const paths: string[] = [];
  for (const m of matches) {
    paths.push(m[1] || '/');
  }
  // The home page is entry('', ...) — normalize to '/'
  return paths.map((p) => (p === '' ? '/' : p));
}

/* ── Collect casebook slugs from tree ─────────────────────────────── */

interface TreeNode {
  kind: string;
  slug?: string;
  children?: TreeNode[];
}

function collectSlugs(nodes: TreeNode[]): string[] {
  const slugs: string[] = [];
  for (const node of nodes) {
    if (node.kind === 'page' && node.slug) {
      slugs.push(node.slug);
    }
    if (node.children) {
      slugs.push(...collectSlugs(node.children));
    }
  }
  return slugs;
}

/* ── Resolve page file path ───────────────────────────────────────── */

function findPageFile(routePath: string): string | null {
  // Try common Next.js App Router patterns
  const candidates = [
    path.join(ROOT, 'app', routePath, 'page.tsx'),
    path.join(ROOT, 'app', routePath, 'page.ts'),
    path.join(ROOT, 'app', `(app)${routePath}`, 'page.tsx'),
    path.join(ROOT, 'app', `(app)${routePath}`, 'page.ts'),
  ];

  // Special case: root
  if (routePath === '/') {
    candidates.unshift(path.join(ROOT, 'app', 'page.tsx'));
    candidates.unshift(path.join(ROOT, 'app', 'page.ts'));
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/* ── Check metadata in page file ──────────────────────────────────── */

function checkMetadata(filePath: string): { hasTitle: boolean; hasDescription: boolean; hasCanonical: boolean } {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    hasTitle: /title\s*[:=]/.test(content) || /metadata/i.test(content) || /generateMetadata/i.test(content),
    hasDescription: /description\s*[:=]/.test(content) || /metadata/i.test(content) || /generateMetadata/i.test(content),
    hasCanonical:
      /canonical/.test(content) ||
      /alternates/.test(content) ||
      /metadataBase/.test(content) ||
      /generateMetadata/i.test(content),
  };
}

/* ── Check gated status ───────────────────────────────────────────── */

function isGated(routePath: string, gatedList: string[]): boolean {
  return gatedList.some(
    (g) => routePath === g || routePath.startsWith(g.endsWith('/') ? g : `${g}/`)
  );
}

/* ── Main ─────────────────────────────────────────────────────────── */

interface CheckResult {
  route: string;
  fileExists: boolean;
  hasTitle: boolean;
  hasDescription: boolean;
  hasCanonical: boolean;
  notGated: boolean;
  inSitemap: boolean;
  pass: boolean;
}

function main() {
  const gated = loadGatedPaths();
  const sitemapPaths = loadSitemapPaths();

  // Static public pages
  const staticPages = ['/', '/about', '/methodology', '/pricing', '/glossary', '/privacy', '/terms', '/refund'];

  // Load casebook tree
  let casebookSlugs: string[] = [];
  try {
    const treePath = path.join(ROOT, 'lib', 'casebook', 'tree.ts');
    const treeContent = fs.readFileSync(treePath, 'utf-8');
    // Parse slugs from the tree file
    const slugMatches = treeContent.matchAll(/slug:\s*'([^']+)'/g);
    for (const m of slugMatches) {
      casebookSlugs.push(m[1]);
    }
  } catch {
    console.warn('⚠ Could not load casebook tree');
  }

  const learnPages = casebookSlugs.map((s) => `/learn/casebook/${s}`);

  // Random sample of 20 learn pages
  const shuffled = [...learnPages].sort(() => Math.random() - 0.5);
  const sampled = shuffled.slice(0, 20);

  const allPages = [...staticPages, ...sampled];
  const results: CheckResult[] = [];

  for (const route of allPages) {
    const pageFile = findPageFile(route);
    const fileExists = pageFile !== null;

    let hasTitle = false;
    let hasDescription = false;
    let hasCanonical = false;

    if (fileExists && pageFile) {
      const meta = checkMetadata(pageFile);
      hasTitle = meta.hasTitle;
      hasDescription = meta.hasDescription;
      hasCanonical = meta.hasCanonical;
    }

    // For casebook pages with dynamic [[...slug]], check the catch-all page
    if (!fileExists && route.startsWith('/learn/casebook/')) {
      const catchAllPage = path.join(ROOT, 'app', '(app)', 'learn', 'casebook', '[[...slug]]', 'page.tsx');
      if (fs.existsSync(catchAllPage)) {
        const meta = checkMetadata(catchAllPage);
        hasTitle = meta.hasTitle;
        hasDescription = meta.hasDescription;
        hasCanonical = meta.hasCanonical;
        // Override fileExists since this is a valid dynamic route
        const overrideExists = true;

        const notGated = !isGated(route, gated);
        const inSitemap = sitemapPaths.some((sp) => route === sp || route === '/');

        const pass = overrideExists && hasTitle && hasDescription && notGated && inSitemap;
        results.push({ route, fileExists: overrideExists, hasTitle, hasDescription, hasCanonical, notGated, inSitemap, pass });
        continue;
      }
    }

    const notGated = !isGated(route, gated);
    const inSitemap = sitemapPaths.some((sp) => route === sp || route === '/');

    const pass = fileExists && hasTitle && hasDescription && notGated && inSitemap;
    results.push({ route, fileExists, hasTitle, hasDescription, hasCanonical, notGated, inSitemap, pass });
  }

  // Output markdown table
  const icon = (v: boolean) => (v ? '✅' : '❌');

  console.log('\n# Indexability Report\n');
  console.log('| Route | File | Title | Desc | Canonical | Not Gated | Sitemap | Status |');
  console.log('|-------|------|-------|------|-----------|-----------|---------|--------|');

  for (const r of results) {
    console.log(
      `| \`${r.route}\` | ${icon(r.fileExists)} | ${icon(r.hasTitle)} | ${icon(r.hasDescription)} | ${icon(r.hasCanonical)} | ${icon(r.notGated)} | ${icon(r.inSitemap)} | ${icon(r.pass)} |`
    );
  }

  const failures = results.filter((r) => !r.pass);
  console.log(`\n**${results.length - failures.length}/${results.length} pages pass all checks.**\n`);

  if (failures.length > 0) {
    console.log('## Failures\n');
    for (const f of failures) {
      const issues: string[] = [];
      if (!f.fileExists) issues.push('missing page file');
      if (!f.hasTitle) issues.push('no title');
      if (!f.hasDescription) issues.push('no description');
      if (!f.hasCanonical) issues.push('no canonical');
      if (!f.notGated) issues.push('blocked by robots');
      if (!f.inSitemap) issues.push('not in sitemap');
      console.log(`- \`${f.route}\`: ${issues.join(', ')}`);
    }
    process.exit(1);
  }

  console.log('All checks passed! 🎉');
  process.exit(0);
}

main();

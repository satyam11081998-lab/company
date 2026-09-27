import { US_CASES, US_GUESSTIMATES, type UsCase, type UsGuesstimate } from '@/lib/us-market';
import type { LearnBlock, LearnCluster, LearnPage } from './types';
import { FOUNDATIONS } from './content/foundations';
import { FRAMEWORKS } from './content/frameworks';
import { ROLES } from './content/roles';

export type { LearnPage, LearnBlock, LearnCluster, LearnSection, LearnFaq, LearnSource } from './types';

/** Every Learn URL derives from this. */
export const LEARN_BASE = '/us/learn';

export function learnPath(slug: string): string {
  return `${LEARN_BASE}/${slug}`;
}

/** All Learn pages, in hub order. */
export const LEARN_PAGES: LearnPage[] = [...FOUNDATIONS, ...FRAMEWORKS, ...ROLES];

const BY_SLUG = new Map(LEARN_PAGES.map((p) => [p.slug, p]));

export function getLearnPage(slug: string): LearnPage | undefined {
  return BY_SLUG.get(slug);
}

export const LEARN_CLUSTERS: { id: LearnCluster; title: string; blurb: string }[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'The ideas every other page builds on: MECE thinking, the case interview, issue trees, market sizing, business math and how to deliver a recommendation.',
  },
  {
    id: 'frameworks',
    title: 'Case frameworks',
    blurb: 'Structures for the problems businesses actually face: profitability, market entry, pricing, growth, M&A, go-to-market, cost, operations and competition.',
  },
  {
    id: 'roles',
    title: 'Role guides',
    blurb: 'How product, sales, marketing, HR, strategy and operations, and finance interviews use business cases, and how to prepare for each.',
  },
];

export function pagesInCluster(cluster: LearnCluster): LearnPage[] {
  return LEARN_PAGES.filter((p) => p.cluster === cluster);
}

/** Hub metadata. `modified` is the latest page modification. */
export const LEARN_HUB = {
  path: LEARN_BASE,
  title: 'Learn business problem solving: frameworks, case interviews and role guides',
  metaTitle: 'Learn Case Interviews & Business Frameworks (Free Guides)',
  description:
    'Free guides to MECE thinking, case interviews, market sizing and business frameworks, plus role guides for product, sales, marketing, HR, operations and finance.',
  published: '2026-09-27',
  get modified(): string {
    return LEARN_PAGES.map((p) => p.modified).sort().at(-1) ?? '2026-09-27';
  },
};

/* ── Practice links into the US case bank ─────────────────────────────── */

export interface LearnPractice {
  cases: UsCase[];
  sizing: UsGuesstimate[];
}

const CASE_BY_CODE = new Map(US_CASES.map((c) => [c.code, c]));

/** Resolve a page's practice spec against the US bank (codes first, then types). */
export function practiceFor(page: LearnPage, maxCases = 4): LearnPractice {
  const picked: UsCase[] = [];
  for (const code of page.practice.caseCodes ?? []) {
    const c = CASE_BY_CODE.get(code);
    if (c && !picked.includes(c)) picked.push(c);
  }
  for (const type of page.practice.caseTypes ?? []) {
    for (const c of US_CASES) {
      if (picked.length >= maxCases) break;
      if (c.type === type && !picked.includes(c)) picked.push(c);
    }
  }
  const sizing = page.practice.sizing ? US_GUESSTIMATES.slice(0, page.practice.sizing) : [];
  return { cases: picked.slice(0, maxCases), sizing };
}

/* ── Word count / reading time ─────────────────────────────────────────── */

function blockText(b: LearnBlock): string {
  switch (b.t) {
    case 'p':
      return b.md;
    case 'ul':
    case 'ol':
      return b.items.join(' ');
    case 'steps':
      return b.items.map((i) => `${i.title} ${i.md}`).join(' ');
    case 'table':
      return [...b.head, ...b.rows.flat(), b.caption ?? ''].join(' ');
    case 'callout':
      return `${b.title} ${b.md}`;
    case 'tree':
      return [b.root, ...b.branches.flatMap((br) => [br.label, ...(br.leaves ?? [])]), b.caption ?? ''].join(' ');
    case 'math':
      return [b.title ?? '', ...b.lines].join(' ');
    case 'dialogue':
      return b.turns.map((t) => t.md).join(' ');
  }
}

export function pageWordCount(page: LearnPage): number {
  const text = [
    page.answer,
    ...page.takeaways,
    ...page.sections.flatMap((s) => [s.h, ...s.blocks.map(blockText)]),
    ...page.faqs.flatMap((f) => [f.q, f.a]),
  ].join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

export function readMinutes(page: LearnPage): number {
  return Math.max(3, Math.round(pageWordCount(page) / 230));
}

/* ── Integrity checks (run by scripts/check-us-learn.mjs and at build) ─── */

/**
 * Returns a list of problems; empty means the library is consistent. Checked
 * at build time by generateStaticParams so a broken related-link or a case
 * code that no longer exists fails the build instead of shipping a dead link.
 */
export function validateLearnLibrary(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const p of LEARN_PAGES) {
    if (seen.has(p.slug)) problems.push(`duplicate slug: ${p.slug}`);
    seen.add(p.slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) problems.push(`bad slug: ${p.slug}`);
    const words = p.answer.split(/\s+/).filter(Boolean).length;
    if (words < 35 || words > 70) problems.push(`${p.slug}: answer is ${words} words (want 40–60)`);
    if (p.description.length > 160) problems.push(`${p.slug}: description ${p.description.length} chars`);
    if (p.metaTitle.length > 66) problems.push(`${p.slug}: metaTitle ${p.metaTitle.length} chars`);
    const ids = new Set<string>();
    for (const s of p.sections) {
      if (ids.has(s.id)) problems.push(`${p.slug}: duplicate section id ${s.id}`);
      ids.add(s.id);
    }
    for (const r of p.related) if (!BY_SLUG.has(r)) problems.push(`${p.slug}: related slug not found: ${r}`);
    for (const code of p.practice.caseCodes ?? []) if (!CASE_BY_CODE.has(code)) problems.push(`${p.slug}: case code not found: ${code}`);
    for (const type of p.practice.caseTypes ?? []) {
      if (!US_CASES.some((c) => c.type === type)) problems.push(`${p.slug}: no US case of type ${type}`);
    }
    for (const href of linksIn(p)) {
      const problem = checkHref(href);
      if (problem) problems.push(`${p.slug}: ${problem}`);
    }
  }
  return problems;
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Every [text](href) in a page's prose, tables, lists and FAQs. */
export function linksIn(page: LearnPage): string[] {
  const strings: string[] = [
    page.answer,
    ...page.takeaways,
    ...page.sections.flatMap((s) => s.blocks.map(blockText)),
    ...page.faqs.flatMap((f) => [f.q, f.a]),
  ];
  const out: string[] = [];
  for (const s of strings) for (const m of s.matchAll(LINK_RE)) out.push(m[2]);
  return out;
}

const CASE_SLUGS = new Set(US_CASES.map((c) => c.slug));
const SIZING_SLUGS = new Set(US_GUESSTIMATES.map((g) => g.slug));
const HUB_ANCHORS = new Set(['foundations', 'frameworks', 'roles']);
/** Internal pages a Learn page may link to (all public, all US-accessible). */
const ALLOWED_PATHS = new Set(['/us', '/us/pricing', '/us/case-interview-examples', '/us/market-sizing-questions', '/practice', '/signup']);

/** Null when the href is valid for a US Learn page; otherwise the problem. */
export function checkHref(href: string): string | null {
  if (/^https:\/\//.test(href)) return null;
  if (!href.startsWith('/')) return `link is neither absolute https nor a site path: ${href}`;
  const [path, hash] = href.split('#');
  if (path === LEARN_BASE) return !hash || HUB_ANCHORS.has(hash) ? null : `unknown hub anchor: ${href}`;
  if (path.startsWith(`${LEARN_BASE}/`)) {
    return BY_SLUG.has(path.slice(LEARN_BASE.length + 1)) ? null : `unknown Learn page: ${href}`;
  }
  if (path === '/us/case-interview-examples' && hash) return CASE_SLUGS.has(hash) ? null : `unknown case anchor: ${href}`;
  if (path === '/us/market-sizing-questions' && hash) return SIZING_SLUGS.has(hash) ? null : `unknown sizing anchor: ${href}`;
  if (ALLOWED_PATHS.has(path)) return null;
  return `internal link to a path US visitors may be redirected from: ${href}`;
}

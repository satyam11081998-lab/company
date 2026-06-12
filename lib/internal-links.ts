import type { NavNode } from '@/lib/casebook/types';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';

/**
 * Internal Linking Engine
 *
 * Builds a link graph from the CASEBOOK_TREE and computes contextual links
 * for each page. Every educational page should have 3–7 contextual links
 * to reduce orphan pages and improve crawl depth.
 *
 * Link types:
 *   - Parent:   the section/group this page belongs to
 *   - Siblings: other pages at the same tree level (max 3)
 *   - Children: sub-pages if any
 *   - Related:  cross-cluster pages sharing tags/keywords (max 3)
 */

export interface InternalLink {
  title: string;
  slug: string;
  kind: 'parent' | 'sibling' | 'child' | 'related';
  /** Clean title without section prefix (e.g. "A · Getting Started" → "Getting Started") */
  cleanTitle: string;
}

export interface ContextualLinks {
  parent: InternalLink | null;
  siblings: InternalLink[];
  children: InternalLink[];
  related: InternalLink[];
  /** All links combined, capped at 7 */
  all: InternalLink[];
}

/** Strip section letter prefix: "A · Getting Started" → "Getting Started" */
function cleanNavTitle(title: string): string {
  return title.replace(/^[A-Z]\d? · /, '').replace(/^\d+ · /, '');
}

/** Flatten all page nodes from the tree. */
function flattenPages(nodes: NavNode[]): NavNode[] {
  const pages: NavNode[] = [];
  for (const node of nodes) {
    if (node.kind === 'page' && node.slug) pages.push(node);
    if (node.children) pages.push(...flattenPages(node.children));
  }
  return pages;
}

/** Find the parent section/group node for a given slug. */
function findParent(
  slug: string,
  nodes: NavNode[] = CASEBOOK_TREE,
  parent: NavNode | null = null
): NavNode | null {
  for (const node of nodes) {
    if (node.slug === slug) return parent;
    if (node.children) {
      const found = findParent(slug, node.children, node);
      if (found) return found;
    }
  }
  return null;
}

/** Find sibling pages (same parent, excluding self). */
function findSiblings(slug: string, nodes: NavNode[] = CASEBOOK_TREE): NavNode[] {
  for (const node of nodes) {
    if (node.children) {
      const childSlugs = flattenPages(node.children).map((c) => c.slug);
      if (childSlugs.includes(slug)) {
        return node.children.filter(
          (c) => c.kind === 'page' && c.slug && c.slug !== slug
        );
      }
      // Recurse into nested groups
      const found = findSiblings(slug, node.children);
      if (found.length > 0) return found;
    }
  }
  return [];
}

/** Find direct children of a page node. */
function findChildren(slug: string, nodes: NavNode[] = CASEBOOK_TREE): NavNode[] {
  for (const node of nodes) {
    if (node.slug === slug && node.children) {
      return node.children.filter((c) => c.kind === 'page' && c.slug);
    }
    if (node.children) {
      const found = findChildren(slug, node.children);
      if (found.length > 0) return found;
    }
  }
  return [];
}

/**
 * Find related pages from other sections. Uses slug-segment overlap
 * as a lightweight relevance signal (e.g. "profitability" appears in
 * both core-frameworks and cases).
 */
function findRelated(slug: string): NavNode[] {
  const allPages = flattenPages(CASEBOOK_TREE);
  const segments = new Set(slug.split('/').flatMap((s) => s.split('-')));
  const parentNode = findParent(slug);
  const parentTitle = parentNode ? cleanNavTitle(parentNode.title).toLowerCase() : '';

  // Score each page by segment overlap + section diversity
  const scored = allPages
    .filter((p) => p.slug && p.slug !== slug)
    .map((p) => {
      const pSegments = p.slug!.split('/').flatMap((s) => s.split('-'));
      let score = 0;
      for (const seg of pSegments) {
        if (segments.has(seg) && seg.length > 3) score += 1;
      }
      // Bonus for different section (cross-cluster links are more valuable)
      const pParent = findParent(p.slug!);
      if (pParent && cleanNavTitle(pParent.title).toLowerCase() !== parentTitle) {
        score += 0.5;
      }
      return { node: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.node);
}

function toLink(node: NavNode, kind: InternalLink['kind']): InternalLink {
  return {
    title: node.title,
    slug: node.slug || '',
    kind,
    cleanTitle: cleanNavTitle(node.title),
  };
}

/**
 * Get contextual internal links for a casebook page.
 *
 * Returns 3–7 links: parent + up to 3 siblings + children + up to 3 related.
 */
export function getContextualLinks(slug: string): ContextualLinks {
  const parent = findParent(slug);
  const siblings = findSiblings(slug).slice(0, 3);
  const children = findChildren(slug);
  const related = findRelated(slug);

  const parentLink = parent && parent.slug
    ? toLink(parent, 'parent')
    : null;

  const siblingLinks = siblings.map((s) => toLink(s, 'sibling'));
  const childLinks = children.map((c) => toLink(c, 'child'));
  const relatedLinks = related.map((r) => toLink(r, 'related'));

  // Combine all, cap at 7
  const all = [
    ...(parentLink ? [parentLink] : []),
    ...childLinks,
    ...siblingLinks,
    ...relatedLinks,
  ].slice(0, 7);

  return { parent: parentLink, siblings: siblingLinks, children: childLinks, related: relatedLinks, all };
}

/* ── Link graph metrics (for audit reports) ────────────────────────── */

export interface LinkGraphMetrics {
  totalPages: number;
  orphanPages: string[];
  avgInternalLinks: number;
  maxCrawlDepth: number;
}

/** Compute link graph health metrics for the INTERNAL_LINK_AUDIT report. */
export function computeLinkGraphMetrics(): LinkGraphMetrics {
  const allPages = flattenPages(CASEBOOK_TREE);
  let totalLinks = 0;
  const orphans: string[] = [];

  for (const page of allPages) {
    if (!page.slug) continue;
    const links = getContextualLinks(page.slug);
    if (links.all.length === 0) orphans.push(page.slug);
    totalLinks += links.all.length;
  }

  // Max crawl depth: deepest nesting in the tree
  function maxDepth(nodes: NavNode[], depth: number): number {
    let max = depth;
    for (const node of nodes) {
      if (node.children) max = Math.max(max, maxDepth(node.children, depth + 1));
    }
    return max;
  }

  return {
    totalPages: allPages.length,
    orphanPages: orphans,
    avgInternalLinks: allPages.length > 0 ? Math.round((totalLinks / allPages.length) * 10) / 10 : 0,
    maxCrawlDepth: maxDepth(CASEBOOK_TREE, 1),
  };
}

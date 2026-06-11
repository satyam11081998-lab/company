import type { Block, NavNode, Page } from '@/lib/casebook/types';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';

/**
 * Central SEO module — single source of truth for site identity, canonical
 * URLs, descriptions, and JSON-LD builders. Every public route's metadata
 * derives from here so search engines and AI crawlers see one consistent
 * entity graph.
 */

export const SITE_URL = 'https://mece.in';
export const SITE_NAME = 'MECE';
export const SITE_TITLE = 'MECE — Placement interview prep for Indian MBA students';
export const SITE_DESC =
  'Cases, frameworks, GD briefs, and structured feedback for MBA & PGDM placement interviews — consulting, finance, marketing, product, ops.';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Strip restricted inline markdown (**bold**, *italic*, `code`, [text](url)) to plain text. */
export function stripInlineMd(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clamp to a search-snippet-friendly length on a word boundary. */
export function clampText(s: string, max = 160): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** First meaningful prose in a page's blocks (recursing into sections). */
function firstProse(blocks: Block[]): string | null {
  for (const block of blocks) {
    if (block.type === 'prose' || block.type === 'hook') {
      const text = stripInlineMd(block.md);
      if (text) return text;
    }
    if (block.type === 'caseSection' || block.type === 'reveal') {
      const found = firstProse(block.blocks);
      if (found) return found;
    }
    if (block.type === 'columns') {
      for (const col of block.columns) {
        const found = firstProse(col);
        if (found) return found;
      }
    }
  }
  return null;
}

/** Meta description for a casebook page: subtitle first, else first prose. */
export function extractPageDescription(page: Page): string {
  const base = page.subtitle ? stripInlineMd(page.subtitle) : firstProse(page.blocks);
  return clampText(base || SITE_DESC);
}

/** Path of nav nodes from the tree root down to the page with this slug. */
export function findTrail(slug: string, nodes: NavNode[] = CASEBOOK_TREE, current: NavNode[] = []): NavNode[] | null {
  for (const node of nodes) {
    const path = [...current, node];
    if (node.slug === slug) return path;
    if (node.children) {
      const found = findTrail(slug, node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function cleanNavTitle(title: string): string {
  return title.replace(/^[A-Z] · /, '');
}

const KIND_TO_RESOURCE_TYPE: Record<Page['kind'], string> = {
  concept: 'Concept explainer',
  framework: 'Framework guide',
  toolkit: 'Interview toolkit',
  case: 'Worked case interview',
  guesstimate: 'Worked guesstimate',
  primer: 'Industry primer',
  landing: 'Guide',
};

/* ── JSON-LD builders ──────────────────────────────────────────────── */

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd() {
  return {
    '@type': 'EducationalOrganization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    description: SITE_DESC,
    areaServed: 'IN',
    knowsAbout: [
      'case interviews',
      'guesstimates',
      'group discussions',
      'MBA placements',
      'consulting interview preparation',
      'business frameworks',
    ],
  };
}

export function webSiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-IN',
  };
}

/** Root structured-data graph rendered once in the root layout. */
export function siteGraphJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(), webSiteJsonLd()],
  };
}

/** BreadcrumbList for a casebook page, mirroring the visible breadcrumbs. */
export function casebookBreadcrumbJsonLd(slug: string): object | null {
  const trail = findTrail(slug);
  if (!trail) return null;
  const items = [
    { name: 'The MECE Casebook', url: absoluteUrl('/learn/casebook') },
    ...trail.map((node) => ({
      name: cleanNavTitle(node.title),
      url: node.slug ? absoluteUrl(`/learn/casebook/${node.slug}`) : undefined,
    })),
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/** Article + LearningResource node for a casebook page. */
export function casebookArticleJsonLd(page: Page) {
  const url = absoluteUrl(`/learn/casebook/${page.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'LearningResource'],
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: page.title,
    description: extractPageDescription(page),
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    learningResourceType: KIND_TO_RESOURCE_TYPE[page.kind],
    educationalLevel: 'Postgraduate (MBA/PGDM)',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
    ...(page.meta?.tags?.length ? { keywords: page.meta.tags.join(', ') } : {}),
    ...(page.meta?.readingTimeMin
      ? { timeRequired: `PT${page.meta.readingTimeMin}M` }
      : {}),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}

/* ── Markdown serialization (llms-full.txt) ────────────────────────── */

/** Serialize typed blocks to plain markdown for AI/LLM consumption. */
export function blocksToMarkdown(blocks: Block[], depth = 0): string {
  const out: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'hook':
      case 'prose':
        out.push(block.md);
        break;
      case 'heading':
        out.push(`${'#'.repeat(block.level + 1)} ${block.text}`);
        break;
      case 'callout':
        out.push(`> **${block.title || block.variant.toUpperCase()}:** ${block.md}`);
        break;
      case 'keyTakeaways':
        out.push(`**${block.title || 'Key takeaways'}**\n${block.items.map((i) => `- ${i}`).join('\n')}`);
        break;
      case 'steps':
        out.push(
          block.items
            .map((item, i) => {
              const marker = block.ordered ? `${i + 1}.` : '-';
              return `${marker} ${item.title ? `**${item.title}:** ` : ''}${item.md}`;
            })
            .join('\n')
        );
        break;
      case 'table': {
        const header = `| ${block.headers.join(' | ')} |`;
        const sep = `| ${block.headers.map(() => '---').join(' | ')} |`;
        const rows = block.rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
        out.push(`${block.caption ? `${block.caption}\n` : ''}${header}\n${sep}\n${rows}`);
        break;
      }
      case 'mathBox':
        out.push(`**${block.title || 'Math'}:** ${block.md}`);
        break;
      case 'quote':
        out.push(`> ${block.md}${block.attribution ? `\n> — ${block.attribution}` : ''}`);
        break;
      case 'dialogue':
        out.push(
          (block.title ? `**${block.title}**\n` : '') +
            block.turns
              .map((t) => `**${t.speaker[0].toUpperCase()}${t.speaker.slice(1)}:** ${t.md}${t.note ? `\n  _Note: ${t.note}_` : ''}`)
              .join('\n')
        );
        break;
      case 'drill':
        out.push(
          `**Drill — ${block.title}**\n${block.instructions}\n` +
            block.items.map((item, i) => `${i + 1}. Q: ${item.prompt}\n   A: ${item.answer}`).join('\n')
        );
        break;
      case 'comparison':
        out.push(
          `${block.title ? `**${block.title}**\n` : ''}| ${block.headers.join(' | ')} |\n| --- | --- | --- |\n` +
            block.rows.map((r) => `| ${r.label ? `**${r.label}** ` : ''}${r.cells.join(' | ')} |`).join('\n')
        );
        break;
      case 'caseSection':
        out.push(`## ${block.title || block.label[0].toUpperCase() + block.label.slice(1)}`);
        out.push(blocksToMarkdown(block.blocks, depth + 1));
        break;
      case 'reveal':
        out.push(`**${block.summary}**`);
        out.push(blocksToMarkdown(block.blocks, depth + 1));
        break;
      case 'columns':
        for (const col of block.columns) out.push(blocksToMarkdown(col, depth + 1));
        break;
      case 'svg':
      case 'diagram':
        if ('caption' in block && block.caption) out.push(`_Diagram: ${block.caption}_`);
        break;
      case 'divider':
        out.push('---');
        break;
    }
  }
  return out.filter(Boolean).join('\n\n');
}

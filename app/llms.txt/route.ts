import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import type { NavNode } from '@/lib/casebook/types';
import { getPage } from '@/lib/casebook/content';
import { SITE_URL, SITE_DESC, extractPageDescription, cleanNavTitle } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * llms.txt — a machine-readable site guide for AI assistants and answer
 * engines (https://llmstxt.org). Lists every public learning page with a
 * one-line description so LLMs can cite and deep-link accurately.
 */
export async function GET() {
  const lines: string[] = [
    '# MECE',
    '',
    `> ${SITE_DESC}`,
    '',
    'MECE (mece.in) is a placement-interview preparation platform for Indian MBA/PGDM students. The MECE Casebook below is free to read without an account. Practice scoring, leaderboards, and GD briefs require a free account.',
    '',
    '## Core pages',
    '',
    `- [Home](${SITE_URL}/): what MECE is and how scoring works`,
    `- [Scoring methodology](${SITE_URL}/methodology): the 6-dimension rubric behind every score`,
    `- [About](${SITE_URL}/about): the team behind MECE`,
    `- [Sign up](${SITE_URL}/signup): free account`,
    '',
  ];

  const walk = (nodes: NavNode[], sectionTitle: string | null) => {
    for (const node of nodes) {
      if (node.kind === 'section') {
        lines.push(`## ${cleanNavTitle(node.title)}`, '');
        if (node.children) walk(node.children, node.title);
        lines.push('');
        continue;
      }
      if (node.kind === 'page' && node.slug) {
        const page = getPage(node.slug);
        const desc = page ? extractPageDescription(page) : '';
        lines.push(`- [${cleanNavTitle(node.title)}](${SITE_URL}/learn/casebook/${node.slug})${desc ? `: ${desc}` : ''}`);
      }
      if (node.children) walk(node.children, sectionTitle);
    }
  };
  walk(CASEBOOK_TREE, null);

  lines.push(
    '',
    '## Full content',
    '',
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): the complete casebook content as markdown`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

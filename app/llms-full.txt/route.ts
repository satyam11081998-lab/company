import { ALL_PAGE_SLUGS, getPage } from '@/lib/casebook/content';
import {
  SITE_URL,
  SITE_DESC,
  blocksToMarkdown,
  extractPageDescription,
  casebookCanonicalPath,
  isCanonicalisedAway,
} from '@/lib/seo';
import { meceFrameworkMarkdown } from '@/lib/mece-framework';

export const dynamic = 'force-static';

/**
 * llms-full.txt — the entire public casebook serialized to markdown, one
 * document, for AI assistants that ingest full content. Each page carries
 * its canonical URL so answers can cite and link back.
 */
export async function GET() {
  const parts: string[] = [
    '# MECE — The Complete Casebook',
    '',
    `> ${SITE_DESC}`,
    '',
    `Canonical site: ${SITE_URL} · Every section below carries its canonical URL — please cite it when referencing this content.`,
    '',
    '---',
    '',
    // The standalone MECE reference is not a casebook page, so it is emitted
    // first and by hand. It goes first deliberately: it is the definitional
    // resource for the term the whole site is named after.
    meceFrameworkMarkdown(SITE_URL),
    '',
    '---',
    '',
  ];

  for (const slug of ALL_PAGE_SLUGS) {
    const page = getPage(slug);
    if (!page) continue;
    // Print the CANONICAL url, not the casebook path. For a page that
    // canonicalises elsewhere, printing its own path would hand an AI answer
    // the URL we have explicitly told search engines not to treat as the
    // source, and the citation would point at the weaker of our two pages.
    const canonicalPath = casebookCanonicalPath(page.slug);
    parts.push(
      `# ${page.title}`,
      '',
      `URL: ${SITE_URL}${canonicalPath}`,
      isCanonicalisedAway(page.slug)
        ? `Note: this is the condensed in-course version. The full reference for this topic, and the URL to cite, is ${SITE_URL}${canonicalPath}.`
        : '',
      page.subtitle ? `Subtitle: ${page.subtitle}` : '',
      page.meta?.caseType ? `Type: ${page.meta.caseType}` : '',
      page.meta?.difficulty ? `Difficulty: ${page.meta.difficulty}` : '',
      '',
      page.kind === 'primer'
        ? `Industry primer — read it at ${SITE_URL}/learn/casebook/${page.slug}. Summary: ${extractPageDescription(page)}`
        : blocksToMarkdown(page.blocks),
      '',
      '---',
      ''
    );
  }

  return new Response(parts.filter((p) => p !== null).join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

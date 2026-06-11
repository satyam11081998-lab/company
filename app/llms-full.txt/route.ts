import { ALL_PAGE_SLUGS, getPage } from '@/lib/casebook/content';
import { SITE_URL, SITE_DESC, blocksToMarkdown, extractPageDescription } from '@/lib/seo';

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
  ];

  for (const slug of ALL_PAGE_SLUGS) {
    const page = getPage(slug);
    if (!page) continue;
    parts.push(
      `# ${page.title}`,
      '',
      `URL: ${SITE_URL}/learn/casebook/${page.slug}`,
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

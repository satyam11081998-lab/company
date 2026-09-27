import { LEARN_BASE, LEARN_CLUSTERS, LEARN_HUB, LEARN_PAGES, learnPath, pagesInCluster, practiceFor } from './index';
import type { LearnBlock, LearnPage } from './types';
import { US_ENTITY_LINE } from './seo';

/**
 * Plain-markdown views of the US Learn library for llms.txt and
 * llms-full.txt. Answer engines quote plain text; these are generated from
 * the same records the pages render, so the two can never disagree.
 */

/** Site-relative links → absolute, so a quoted passage still points somewhere. */
function absolutize(md: string, siteUrl: string): string {
  return md.replace(/\]\((\/[^)\s]*)\)/g, (_m, p: string) => `](${siteUrl}${p})`);
}

function blockToMd(b: LearnBlock, siteUrl: string): string {
  const a = (s: string) => absolutize(s, siteUrl);
  switch (b.t) {
    case 'p':
      return a(b.md);
    case 'ul':
      return b.items.map((i) => `- ${a(i)}`).join('\n');
    case 'ol':
      return b.items.map((i, n) => `${n + 1}. ${a(i)}`).join('\n');
    case 'steps':
      return b.items.map((i, n) => `${n + 1}. **${i.title}.** ${a(i.md)}`).join('\n');
    case 'table': {
      const head = `| ${b.head.map((h) => h || ' ').join(' | ')} |`;
      const sep = `| ${b.head.map(() => '---').join(' | ')} |`;
      const rows = b.rows.map((r) => `| ${r.map(a).join(' | ')} |`).join('\n');
      return `${b.caption ? `${b.caption}\n\n` : ''}${head}\n${sep}\n${rows}`;
    }
    case 'callout':
      return `> **${b.title}:** ${a(b.md)}`;
    case 'tree':
      return [
        `**Issue tree: ${b.root}**`,
        ...b.branches.map((br) => `- ${br.label}${br.leaves?.length ? `\n${br.leaves.map((l) => `  - ${l}`).join('\n')}` : ''}`),
        b.caption ? `_${b.caption}_` : '',
      ]
        .filter(Boolean)
        .join('\n');
    case 'math':
      return `${b.title ? `**${b.title}**\n` : ''}${b.lines.map((l) => `- ${l}`).join('\n')}`;
    case 'dialogue':
      return b.turns.map((t) => `**${t.who}:** ${a(t.md)}`).join('\n\n');
  }
}

export function learnPageToMarkdown(page: LearnPage, siteUrl: string): string {
  const out: string[] = [
    `## ${page.title}`,
    '',
    `URL: ${siteUrl}${learnPath(page.slug)} · Updated ${page.modified}`,
    '',
    `**Short answer:** ${page.answer}`,
    '',
    '**Key takeaways**',
    ...page.takeaways.map((t) => `- ${absolutize(t, siteUrl)}`),
    '',
  ];
  for (const s of page.sections) {
    out.push(`### ${s.h}`, '');
    for (const b of s.blocks) out.push(blockToMd(b, siteUrl), '');
  }
  if (page.faqs.length) {
    out.push('### Frequently asked questions', '');
    for (const f of page.faqs) out.push(`**${f.q}** ${f.a}`, '');
  }
  const practice = practiceFor(page);
  if (practice.cases.length || practice.sizing.length) {
    out.push('### Practice', '');
    for (const c of practice.cases) out.push(`- ${c.title}: ${siteUrl}/us/case-interview-examples#${c.slug}`);
    for (const g of practice.sizing) out.push(`- ${g.title}: ${siteUrl}/us/market-sizing-questions#${g.slug}`);
    out.push('');
  }
  if (page.sources?.length) {
    out.push('### Sources', '');
    for (const src of page.sources) out.push(`- ${src.label}: ${src.url} (${src.note})`);
    out.push('');
  }
  return out.join('\n');
}

/** The short llms.txt section: one line per page. */
export function learnLlmsSection(siteUrl: string): string[] {
  const lines: string[] = [
    '## MECE Learn (US and Europe): free guides to business problem solving',
    '',
    US_ENTITY_LINE,
    '',
    `- [MECE Learn hub](${siteUrl}${LEARN_BASE}): ${LEARN_HUB.description}`,
  ];
  for (const cluster of LEARN_CLUSTERS) {
    for (const p of pagesInCluster(cluster.id)) {
      lines.push(`- [${p.title}](${siteUrl}${learnPath(p.slug)}): ${p.answer}`);
    }
  }
  lines.push('');
  return lines;
}

/** The llms-full.txt section: every Learn page in full. */
export function learnLlmsFullSection(siteUrl: string): string[] {
  const lines: string[] = ['# MECE Learn (US and Europe), full text', '', US_ENTITY_LINE, ''];
  for (const p of LEARN_PAGES) lines.push(learnPageToMarkdown(p, siteUrl), '---', '');
  return lines;
}

import { ALL_PAGE_SLUGS, getPage } from '@/lib/casebook/content';
import { ogCardInput, renderOgCard } from '@/lib/og-card';

/**
 * Share card for one Casebook page, drawn ONCE at build time (2026-10-07).
 * Same pixels as the /og?title=…&subtitle=…&kind=… URL the page used before
 * (same inputs, same lib/og-card.tsx), but served as a static file, so a
 * crawler hit after a deploy no longer re-draws it on the server.
 * Node runtime on purpose: edge routes cannot be prerendered.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_PAGE_SLUGS.map((slug) => ({ slug: slug.split('/') }));
}

export async function GET(_req: Request, { params }: { params: { slug: string[] } }) {
  const page = getPage(params.slug.join('/'));
  if (!page) return new Response('Not found', { status: 404 });
  return renderOgCard(ogCardInput({ title: page.title, subtitle: page.subtitle, kind: page.kind }));
}

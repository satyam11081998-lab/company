import { ogCardInput, renderOgCard } from '@/lib/og-card';

/**
 * Share card for /learn/mece-framework, drawn once at build time (2026-10-07).
 * Same inputs as the /og URL that page used before, so the same pixels.
 */
export const dynamic = 'force-static';

export async function GET() {
  return renderOgCard(
    ogCardInput({
      title: 'The MECE Framework',
      subtitle: 'Mutually Exclusive, Collectively Exhaustive',
      kind: 'framework',
    }),
  );
}

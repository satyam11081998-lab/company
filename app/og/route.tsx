import type { NextRequest } from 'next/server';
import { ogCardInput, renderOgCard } from '@/lib/og-card';

// Node runtime so local font files can be loaded via fs and shared with prerendered cards.
export const runtime = 'nodejs';

/**
 * Dynamic Open Graph card generator for content pages.
 * /og?title=...&subtitle=...&kind=case
 *
 * The card itself lives in lib/og-card.tsx (shared with the prerendered
 * /og/casebook/<slug> and /og/mece-framework cards). Output is unchanged.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return renderOgCard(
    ogCardInput({
      title: searchParams.get('title'),
      subtitle: searchParams.get('subtitle'),
      kind: searchParams.get('kind'),
    }),
  );
}

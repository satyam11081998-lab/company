import { cache } from 'react';

export interface PublicDeck {
  id: string;
  slug: string;
  title: string;
  source_kind: 'corporate' | 'bschool' | string;
  competition: string;
  organizer: string;
  result: string;
  case_type: string;
  round_type: string;
  file_type: string;
  description: string;
  page_count: number | null;
  free_pages: number | null;
  effective_free_pages: number;
  summary: string | null;
  summary_generated_at: string | null;
  pages_rendered_at: string | null;
  is_indexable: boolean;
  is_active: boolean;
  year: number | null;
  created_at: string;
}

/**
 * Fetch a deck by its permanent public slug.
 *
 * NOTE: effective_free_pages is calculated in SQL (effective_free_pages function)
 * so there is never logic drift between the database and application code.
 */
export const getDeckBySlug = cache(async (slug: string): Promise<PublicDeck | null> => {
  // Cookieless client ON PURPOSE: the deck page is public and byte-identical for
  // every visitor, so it must not read cookies — that is exactly what lets the
  // page be ISR-cached (see `revalidate` in app/decks/[slug]/page.tsx) instead
  // of re-rendering per request. Wrapped in React cache() so generateMetadata
  // and the page body share ONE database call per render.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('[decks] getDeckBySlug: NEXT_PUBLIC_SUPABASE_URL / key missing.');
    return null;
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabase = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Reads through the get_public_deck() SECURITY DEFINER RPC (migration 0049),
  // NOT a direct table select. anon has NO SELECT on deck_skeletons, so the
  // catalogue's internal columns (storage_path = the gdrive id behind the
  // paywall, source_submission_id) are never reachable through the public REST
  // endpoint. The RPC returns only page-safe columns for ACTIVE decks and
  // computes effective_free_pages server-side.
  const { data, error } = await supabase
    .rpc('get_public_deck', { p_slug: slug })
    .maybeSingle();

  // Do NOT swallow this. Discarding the error made a SCHEMA failure look
  // identical to "no such deck": if migration 0047 has not run,
  // `effective_free_pages` does not exist, PostgREST rejects the whole select,
  // data comes back null, and the page 404s with nothing in any log to say why.
  // That cost a full debugging round — the 404 was never about the deck.
  if (error) {
    console.error(
      `[decks] getDeckBySlug("${slug}") failed: ${error.message}. ` +
        'If this mentions get_public_deck, migration 0049 has not been run; ' +
        'if it mentions effective_free_pages, migration 0047 has not been run.',
    );
    return null;
  }

  return (data as PublicDeck | null) || null;
});

export interface RelatedDeck {
  slug: string;
  title: string;
  competition: string;
  organizer: string;
  company: string;
  industry: string;
  case_type: string;
  result: string;
  source_kind: string;
  year: number | null;
}

/**
 * Fetch decks related to a given one, for the "Related winning decks" rail.
 *
 * Reads through the list_related_decks() SECURITY DEFINER RPC (migration 0053) —
 * same reason as getDeckBySlug: anon has no direct SELECT on deck_skeletons, and
 * the RPC returns only page-safe columns for ACTIVE + INDEXABLE decks. The rail is
 * pure internal linking (crawlable <Link>s), which is one of the strongest on-site
 * SEO levers, so it must never link to a held-for-review / no-index deck.
 */
export const getRelatedDecks = cache(async (slug: string, limit = 6): Promise<RelatedDeck[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabase = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.rpc('list_related_decks', { p_slug: slug, p_limit: limit });

    // Don't swallow: an error here silently drops the whole rail. If it mentions
    // list_related_decks, migration 0053 has not been run.
    if (error) {
      console.error(
        `[decks] getRelatedDecks("${slug}") failed: ${error.message}. ` +
          'If this mentions list_related_decks, migration 0053 has not been run.',
      );
      return [];
    }

    return (data as RelatedDeck[] | null) || [];
  } catch (err) {
    console.error('[decks] getRelatedDecks threw:', err);
    return [];
  }
});

/**
 * Fetch all active, indexable decks for sitemap generation.
 */
export async function getIndexableDecks(): Promise<Array<{ slug: string; created_at: string; pages_rendered_at: string | null }>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return [];
  }

  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const client = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Via the list_indexable_decks() SECURITY DEFINER RPC (0049) so this works
    // with the anon key too (no direct table grant to anon); with the service
    // key it works the same — the function is stable and read-only.
    const { data, error } = await client.rpc('list_indexable_decks');

    // A silent [] here means the sitemap quietly ships without a single deck —
    // the feature looks fine and simply never gets indexed. Say so.
    if (error) {
      console.error(`[decks] getIndexableDecks failed: ${error.message} — sitemap will omit all decks.`);
      return [];
    }

    return (data as Array<{ slug: string; created_at: string; pages_rendered_at: string | null }> | null) || [];
  } catch (err) {
    console.error('[decks] getIndexableDecks threw:', err);
    return [];
  }
}

/**
 * The public <h1> for a deck, composed from the fields the admin FILLED IN
 * rather than whatever ended up in `title`.
 *
 * The uploader used to pre-fill `title` from the filename, so decks published
 * with headings like "flipkart wired final v3 compressed" — a pre-filled field
 * looks answered and gets skipped. That string was then the single most
 * important element on an indexed page.
 *
 * Composing from competition + year + result also happens to be the strongest
 * possible H1 for search, because it is exactly the phrase people type:
 * "Flipkart WiRED 8.0 2026 — National Finalist Deck". The admin's own title is
 * appended only when it adds something the composed parts do not already say.
 */
export function deckHeading(deck: {
  title?: string | null;
  competition?: string | null;
  year?: number | null;
  result?: string | null;
}): string {
  const competition = (deck.competition || '').trim();
  const result = (deck.result || '').trim();
  const year = deck.year ? String(deck.year) : '';
  const title = (deck.title || '').trim();

  const lead = [competition, year].filter(Boolean).join(' ');
  const composed = [lead, result && `${result} Deck`].filter(Boolean).join(' — ');

  if (!composed) return title || 'Case competition deck';

  // Only append the admin title when it carries information the composed
  // heading does not — otherwise the H1 repeats itself.
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (title && !norm(composed).includes(norm(title)) && !norm(title).includes(norm(competition))) {
    return `${composed}: ${title}`;
  }
  return composed;
}

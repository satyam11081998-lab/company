import { createClient } from '@/lib/supabase/server';

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
export async function getDeckBySlug(slug: string): Promise<PublicDeck | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('deck_skeletons')
    .select(`
      id, slug, title, source_kind, competition, organizer, result,
      case_type, round_type, file_type, description, page_count,
      free_pages, summary, summary_generated_at, pages_rendered_at,
      is_indexable, is_active, year, created_at,
      effective_free_pages
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  // Do NOT swallow this. Discarding the error made a SCHEMA failure look
  // identical to "no such deck": if migration 0047 has not run,
  // `effective_free_pages` does not exist, PostgREST rejects the whole select,
  // data comes back null, and the page 404s with nothing in any log to say why.
  // That cost a full debugging round — the 404 was never about the deck.
  if (error) {
    console.error(
      `[decks] getDeckBySlug("${slug}") failed: ${error.message}. ` +
        'If this mentions effective_free_pages, migration 0047 has not been run.',
    );
    return null;
  }

  return (data as PublicDeck | null) || null;
}

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

    const { data, error } = await client
      .from('deck_skeletons')
      .select('slug, created_at, pages_rendered_at')
      .eq('is_active', true)
      .eq('is_indexable', true)
      .not('slug', 'is', null)
      .order('created_at', { ascending: false });

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
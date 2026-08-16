import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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
  const { data } = await supabase
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

  return (data as PublicDeck | null) || null;
}

/**
 * Fetch all active, indexable decks for sitemap generation.
 */
export async function getIndexableDecks(): Promise<Array<{ slug: string; created_at: string; pages_rendered_at: string | null }>> {
  const svc = createServiceClient();
  const { data } = await svc
    .from('deck_skeletons')
    .select('slug, created_at, pages_rendered_at')
    .eq('is_active', true)
    .eq('is_indexable', true)
    .not('slug', 'is', null)
    .order('created_at', { ascending: false });

  return (data as Array<{ slug: string; created_at: string; pages_rendered_at: string | null }> | null) || [];
}
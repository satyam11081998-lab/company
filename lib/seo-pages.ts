import { createStaticClient } from '@/lib/supabase/static';

/**
 * Public read layer for Growth-Agent SEO pages (table: seo_pages, migration 0063).
 * Uses the anon static client — RLS `seo_pages_public_read` exposes ONLY rows with
 * status = 'published', so drafts can never leak. Every function is defensive and
 * returns empty on any error (a broken read must never fail the page/sitemap).
 */

export interface SeoSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface SeoContent {
  intro?: string;
  why_it_matters?: string;
  framework?: { heading?: string; steps?: string[] };
  sections?: SeoSection[];
  takeaways?: string[];
  practice_prompt?: string;
}

export interface SeoSourceRef {
  label: string;
  url: string;
}

export interface SeoPage {
  id: string;
  slug: string;
  kind: string;
  title: string;
  meta_description: string;
  dek: string | null;
  content: SeoContent;
  source_refs: SeoSourceRef[];
  topic: string | null;
  keywords: string[];
  status: string;
  quality_score: number | null;
  quality_notes?: string | null;
  model?: string | null;
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

const COLS =
  'id, slug, kind, title, meta_description, dek, content, source_refs, topic, keywords, status, quality_score, published_at, updated_at, created_at';

export async function getPublishedSeoPage(slug: string): Promise<SeoPage | null> {
  try {
    const s = createStaticClient();
    const { data } = await s
      .from('seo_pages')
      .select(COLS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return (data as SeoPage | null) ?? null;
  } catch {
    return null;
  }
}

export async function getPublishedSeoPages(limit = 500): Promise<SeoPage[]> {
  try {
    const s = createStaticClient();
    const { data } = await s
      .from('seo_pages')
      .select(COLS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    return (data as SeoPage[] | null) ?? [];
  } catch {
    return [];
  }
}

import { createServiceClient } from '@/lib/supabase/service';
import type { SeoPage } from '@/lib/seo-pages';
import { GrowthAdminClient } from './growth-admin-client';

export const dynamic = 'force-dynamic';

// Gating: the parent app/(app)/admin/layout.tsx already redirects non-admins.
export default async function AdminGrowthPage() {
  const svc = createServiceClient();
  let pages: SeoPage[] = [];
  try {
    const { data } = await svc
      .from('seo_pages')
      .select('id, slug, kind, title, meta_description, dek, content, source_refs, topic, keywords, status, quality_score, quality_notes, model, published_at, updated_at, created_at, agent_meta')
      .order('created_at', { ascending: false })
      .limit(200);
    pages = (data as SeoPage[] | null) ?? [];
  } catch {
    pages = [];
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Growth — programmatic SEO</h1>
      <p className="mb-6 max-w-2xl text-muted-foreground">
        The Growth Agent turns business news into sourced, long-form essays with photographs, checks every number,
        scores each draft and sends it to your Telegram. Publish the good ones — they go live at{' '}
        <code>/insights/&lt;slug&gt;</code> and enter the sitemap. Older posts can be rewritten as full essays below.
        Nothing publishes without you.
      </p>
      <GrowthAdminClient initialPages={pages} />
    </div>
  );
}

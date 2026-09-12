'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';

type SeoStatus = 'draft' | 'approved' | 'published' | 'rejected' | 'archived';
const STATUSES: SeoStatus[] = ['draft', 'approved', 'published', 'rejected', 'archived'];

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: userData } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single();
  if (!(userData as Partial<UserRow>)?.is_admin) throw new Error('Forbidden: Admins only');
}

/**
 * Flip an SEO page's status. Publishing stamps published_at (which is what makes
 * it visible via RLS + the sitemap). Admin-gated; the write uses the service
 * client after the is_admin check, mirroring the feedback admin actions.
 */
export async function setSeoStatus(
  id: string,
  slug: string,
  status: SeoStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (!STATUSES.includes(status)) return { success: false, error: 'Invalid status' };

    const svc = createServiceClient();
    const patch: Record<string, unknown> = { status };
    patch.published_at = status === 'published' ? new Date().toISOString() : null;

    const { error } = await svc.from('seo_pages').update(patch).eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/growth');
    revalidatePath('/insights');
    if (slug) revalidatePath(`/insights/${slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

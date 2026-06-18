'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow, FeedbackStatus } from '@/lib/types';

const STATUSES: FeedbackStatus[] = ['new', 'triaged', 'in_progress', 'resolved', 'dismissed'];

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!(userData as Partial<UserRow>)?.is_admin) {
    throw new Error('Forbidden: Admins only');
  }
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (!STATUSES.includes(status)) return { success: false, error: 'Invalid status' };

    // Service client: trusted server-only write after the admin check above.
    const svc = createServiceClient();
    const { error } = await svc
      .from('feedback_reports')
      .update({
        status,
        admin_note: adminNote ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/feedback');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

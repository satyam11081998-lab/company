'use server';

import { createClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/types';

/**
 * Helper to verify caller is admin before doing anything.
 */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (!(userData as Partial<UserRow>)?.is_admin) {
    throw new Error("Forbidden: Admins only");
  }
}

export async function triggerNewsFetch() {
  await requireAdmin();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const cronSecret = process.env.CRON_SECRET || '';

  try {
    const res = await fetch(`${apiUrl}/cron/fetch-news`, {
      method: 'POST',
      headers: {
        'x-cron-secret': cronSecret,
        'Content-Type': 'application/json'
      },
      // Force no cache
      cache: 'no-store'
    });

    if (!res.ok) {
      const txt = await res.text();
      return { success: false, error: `Backend returned ${res.status}: ${txt}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function triggerCaseGeneration() {
  await requireAdmin();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const cronSecret = process.env.CRON_SECRET || '';

  try {
    const res = await fetch(`${apiUrl}/cron/schedule-daily`, {
      method: 'POST',
      headers: {
        'x-cron-secret': cronSecret,
        'Content-Type': 'application/json'
      },
      // Force no cache
      cache: 'no-store'
    });

    if (!res.ok) {
      const txt = await res.text();
      return { success: false, error: `Backend returned ${res.status}: ${txt}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

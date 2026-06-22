'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';

/**
 * Helper to verify caller is admin before doing anything.
 */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
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

const GRANT_TIERS = ['free', 'lite', 'pro'] as const;
type GrantTier = (typeof GRANT_TIERS)[number];
const GRANT_DAYS = new Set([30, 90, 365]);

/**
 * Admin-only: manually set a user's subscription tier without payment
 * (testers / team / comps), or revoke by granting 'free'.
 *
 * `days = null` means permanent (no expiry). The privileged columns are written
 * with the SERVICE-ROLE client because migration 0006's trg_guard_user_cols
 * silently reverts subscription_* for any non-service-role caller — the same
 * trap that broke the Razorpay verify path. Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export async function grantMembership(input: {
  email: string;
  tier: GrantTier;
  days: number | null;
}) {
  await requireAdmin();

  const email = (input.email || '').trim();
  const tier = input.tier;
  const days = input.days;

  if (!email) return { success: false, error: 'Enter a user email.' };
  if (!GRANT_TIERS.includes(tier)) return { success: false, error: 'Invalid tier.' };
  if (tier !== 'free' && days !== null && !GRANT_DAYS.has(days)) {
    return { success: false, error: 'Invalid duration.' };
  }

  const db = createServiceClient();

  // Case-insensitive exact match on email (ilike with no wildcards).
  const { data: target, error: lookupError } = await db
    .from('users')
    .select('id, email, name')
    .ilike('email', email)
    .maybeSingle();

  if (lookupError) return { success: false, error: `Lookup failed: ${lookupError.message}` };
  if (!target) return { success: false, error: `No user found with email "${email}".` };

  const now = new Date();
  const updates =
    tier === 'free'
      ? { subscription_tier: 'free', subscription_started_at: null, subscription_expires_at: null }
      : {
          subscription_tier: tier,
          subscription_started_at: now.toISOString(),
          subscription_expires_at:
            days === null ? null : new Date(now.getTime() + days * 86_400_000).toISOString(),
        };

  const { data: updatedRows, error: updateError } = await db
    .from('users')
    .update(updates)
    .eq('id', (target as { id: string }).id)
    .select('id, email, subscription_tier, subscription_expires_at');

  if (updateError || !updatedRows || updatedRows.length === 0) {
    return {
      success: false,
      error: updateError ? updateError.message : 'Update did not apply (0 rows changed).',
    };
  }

  const row = updatedRows[0] as {
    email: string;
    subscription_tier: string;
    subscription_expires_at: string | null;
  };
  return {
    success: true,
    data: { email: row.email, tier: row.subscription_tier, expires_at: row.subscription_expires_at },
  };
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


/**
 * Admin-only: HARD-DELETE a user by email or LinkedIn URL. Removes the
 * public.users row (cascades to attempts / payments / badges / etc. via
 * ON DELETE CASCADE) AND the Supabase auth identity. Irreversible.
 * Guards: refuses to delete the caller's own account or another admin.
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export async function deleteUserByIdentifier(input: { identifier: string }) {
  // Inline admin check so we also capture the caller's id (to block self-delete).
  const authClient = createClient();
  const {
    data: { user: caller },
  } = await authClient.auth.getUser();
  if (!caller) return { success: false, error: 'Unauthorized.' };

  const { data: callerRow } = await authClient
    .from('users')
    .select('is_admin')
    .eq('id', caller.id)
    .single();
  if (!(callerRow as Partial<UserRow>)?.is_admin) {
    return { success: false, error: 'Forbidden: Admins only.' };
  }

  const raw = (input.identifier || '').trim();
  if (!raw) return { success: false, error: 'Enter an email or LinkedIn URL.' };

  const db = createServiceClient();
  const isEmail = raw.includes('@');

  type Target = {
    id: string;
    email: string;
    name: string | null;
    linkedin_url: string | null;
    is_admin: boolean;
  };
  let target: Target | null = null;

  if (isEmail) {
    const { data, error } = await db
      .from('users')
      .select('id, email, name, linkedin_url, is_admin')
      .ilike('email', raw)
      .maybeSingle();
    if (error) return { success: false, error: `Lookup failed: ${error.message}` };
    target = (data as Target | null) ?? null;
  } else {
    // Normalise the LinkedIn URL (strip protocol / www / trailing slash) and
    // match the remaining fragment, so a full URL or a bare handle both work.
    const frag = raw
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '');
    const { data, error } = await db
      .from('users')
      .select('id, email, name, linkedin_url, is_admin')
      .ilike('linkedin_url', `%${frag}%`)
      .limit(2);
    if (error) return { success: false, error: `Lookup failed: ${error.message}` };
    const rows = (data as Target[] | null) ?? [];
    if (rows.length > 1) {
      return {
        success: false,
        error: 'Multiple users match that LinkedIn URL — use their email instead.',
      };
    }
    target = rows[0] ?? null;
  }

  if (!target) return { success: false, error: `No user found for "${raw}".` };
  if (target.id === caller.id) {
    return { success: false, error: 'You cannot delete your own account.' };
  }
  if (target.is_admin) {
    return { success: false, error: 'Refusing to delete an admin account.' };
  }

  const summary = { email: target.email, name: target.name, linkedin_url: target.linkedin_url };

  // 1) Delete the profile row — cascades to all child tables.
  const { error: rowErr } = await db.from('users').delete().eq('id', target.id);
  if (rowErr) return { success: false, error: `Failed to delete profile row: ${rowErr.message}` };

  // 2) Delete the auth identity (public.users.id === auth user id; not auto-cascaded).
  const { error: authErr } = await db.auth.admin.deleteUser(target.id);
  if (authErr) {
    return {
      success: false,
      error: `Profile + data deleted, but auth identity removal failed: ${authErr.message}. Remove it manually in Supabase -> Authentication -> Users.`,
    };
  }

  return { success: true, data: summary };
}

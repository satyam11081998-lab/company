/**
 * DPDP erasure blocklist. Only a hash of the email is kept — enough to stop
 * the same person being re-imported, re-synced or emailed after their data
 * was erased, without keeping the address itself.
 *
 * The hash is deliberately NOT keyed by a rotating secret: if it were,
 * rotating CRM_TRACKING_SECRET would silently empty the blocklist and erased
 * people could flow back in. The table is service-role only.
 */
import { createHmac } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export function blocklistHash(email: string): string {
  return createHmac('sha256', 'crm-blocklist').update(String(email).trim().toLowerCase()).digest('hex');
}

/** True if this email belongs to someone whose data was erased. Tolerant of the table not existing yet. */
export async function isBlocked(svc: SupabaseClient, email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const { data, error } = await svc.from('crm_blocklist').select('email_hash').eq('email_hash', blocklistHash(email)).maybeSingle();
  return !error && !!data;
}

/** All hashes (small table) for bulk checks in sync/import. */
export async function blockedHashes(svc: SupabaseClient): Promise<Set<string>> {
  const out = new Set<string>();
  for (let from = 0; from < 200_000; from += 1000) {
    const { data, error } = await svc.from('crm_blocklist').select('email_hash').order('email_hash').range(from, from + 999);
    if (error || !data?.length) break;
    for (const r of data as Array<{ email_hash: string }>) out.add(r.email_hash);
    if (data.length < 1000) break;
  }
  return out;
}

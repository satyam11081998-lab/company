/**
 * Endorsements — curated, credibility-first social proof, distinct from
 * testimonials. DB-backed (`endorsements`). Admin-managed only (no crowd
 * submission). There is intentionally NO fake fallback seed: if there are no
 * real, verified endorsements, the section renders nothing rather than padding
 * the page with bogus quotes.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { EndorsementRow } from '@/lib/types';

export interface Endorsement {
  id: string;
  name: string;
  role: string;
  organization: string;
  credential: string;
  quote: string;
  avatar_url: string | null;
  linkedin_url?: string;
  verified: boolean;
}

export function mapEndorsement(r: EndorsementRow): Endorsement {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    organization: r.organization,
    credential: r.credential,
    quote: r.quote,
    avatar_url: r.avatar_url,
    linkedin_url: r.linkedin_url ?? undefined,
    verified: !!r.verified,
  };
}

/** Published endorsements, ordered. Empty array when there are none (no seed). */
export async function getPublishedEndorsements(supabase: SupabaseClient): Promise<Endorsement[]> {
  const { data } = await supabase
    .from('endorsements')
    .select('*')
    .eq('status', 'published')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  const rows = (data as EndorsementRow[] | null) ?? [];
  return rows.map(mapEndorsement);
}

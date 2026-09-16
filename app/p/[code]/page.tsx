import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Short shareable practice link: /p/<code> -> the live case.
 *
 * Broadcast / WhatsApp links use a short code (mece.in/p/bs7k2q) instead of the
 * long /cases/<uuid> URL — short, with mece.in still visible. This resolves the
 * code to the case id and redirects into the normal /cases/<id> flow (guest
 * preview + solve). Reachable logged-out because /p is a preview route.
 */
export default async function ShortPracticeLink({ params }: { params: { code: string } }) {
  const code = (params.code || '').trim();
  if (!code) notFound();

  const supabase = createClient();
  const { data } = await supabase.from('cases').select('id').eq('code', code).maybeSingle();
  const id = (data as { id?: string } | null)?.id;
  if (!id) notFound();

  redirect(`/cases/${id}`);
}

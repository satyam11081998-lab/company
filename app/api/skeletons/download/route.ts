import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Exchange selected deck ids for download URLs. URLs point at our own
 * per-file proxy route (/api/skeletons/file/:id), which re-checks
 * entitlement and serves the bytes — the storage backend is never exposed.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Entitlement check (buyer or admin).
    const [{ data: access }, { data: userRow }] = await Promise.all([
      supabase.from('skeleton_access').select('user_id').eq('user_id', user.id).maybeSingle(),
      supabase.from('users').select('is_admin').eq('id', user.id).single(),
    ]);
    if (!access && !userRow?.is_admin) {
      return NextResponse.json({ error: 'Deck Vault access required' }, { status: 403 });
    }

    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.slice(0, 50) : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No decks selected' }, { status: 400 });
    }

    const { data: decks, error } = await supabase
      .from('deck_skeletons')
      .select('id, title')
      .in('id', ids)
      .eq('is_active', true);

    if (error || !decks || decks.length === 0) {
      return NextResponse.json({ error: 'Decks not found' }, { status: 404 });
    }

    const files = decks.map((d) => ({
      id: d.id,
      title: d.title,
      url: `/api/skeletons/file/${d.id}`,
    }));

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error('Vault download error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Exchange selected skeleton ids for short-lived signed URLs.
 * Files live in the PRIVATE 'skeletons' bucket — this route is the only door,
 * and it opens only for users with a skeleton_access row.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Entitlement check
    const { data: access } = await supabase
      .from('skeleton_access').select('user_id').eq('user_id', user.id).maybeSingle();
    if (!access) {
      return NextResponse.json({ error: 'Skeleton Library access required' }, { status: 403 });
    }

    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.slice(0, 50) : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No skeletons selected' }, { status: 400 });
    }

    const { data: skeletons, error } = await supabase
      .from('deck_skeletons')
      .select('id, title, storage_path')
      .in('id', ids)
      .eq('is_active', true);

    if (error || !skeletons || skeletons.length === 0) {
      return NextResponse.json({ error: 'Skeletons not found' }, { status: 404 });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('skeletons')
      .createSignedUrls(skeletons.map((s) => s.storage_path), 120); // 2-minute expiry

    if (signError || !signed) {
      console.error('Signed URL error:', signError);
      return NextResponse.json({ error: 'Could not generate download links' }, { status: 500 });
    }

    const files = skeletons.map((s, i) => ({
      id: s.id,
      title: s.title,
      url: signed[i]?.signedUrl ?? null,
    })).filter((f) => f.url);

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error('Skeleton download error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

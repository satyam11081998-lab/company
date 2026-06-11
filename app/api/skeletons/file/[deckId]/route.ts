import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchFileStream, isDrivePath, driveFileId } from '@/lib/google-drive';
import { effectiveTier } from '@/lib/tier';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/**
 * The single download door for vault files. Checks entitlement, then either
 * streams the file from the storage backend through our own domain (Drive)
 * or redirects to a short-lived signed URL (legacy Supabase bucket files).
 * The storage provider is never visible to the user.
 */
export async function GET(
  _req: Request,
  { params }: { params: { deckId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Entitlement: buyer or admin.
    const { data: userRow } = await supabase.from('users').select('subscription_tier, subscription_expires_at, is_admin').eq('id', user.id).single();
    if (effectiveTier(userRow as any) !== 'pro' && !userRow?.is_admin) {
      return NextResponse.json({ error: 'Deck Vault access required' }, { status: 403 });
    }

    const { data: deck } = await supabase
      .from('deck_skeletons')
      .select('id, title, file_type, storage_path, is_active')
      .eq('id', params.deckId)
      .maybeSingle();
    if (!deck || (!deck.is_active && !userRow?.is_admin)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ext = (deck.file_type || 'pdf').toLowerCase();
    const safeName = `${deck.title.replace(/[^\w\s.-]/g, '').trim().slice(0, 80) || 'deck'}.${ext}`;

    if (isDrivePath(deck.storage_path)) {
      // Stream from the backend through our domain.
      const upstream = await fetchFileStream(driveFileId(deck.storage_path));
      const headers = new Headers({
        'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      const len = upstream.headers.get('content-length');
      if (len) headers.set('Content-Length', len);
      return new Response(upstream.body, { status: 200, headers });
    }

    // Legacy: file lives in the Supabase bucket → short-lived signed URL.
    const { data: signed, error: signError } = await supabase.storage
      .from('skeletons')
      .createSignedUrl(deck.storage_path, 120);
    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not prepare download' }, { status: 500 });
    }
    return NextResponse.redirect(signed.signedUrl, 307);
  } catch (err: any) {
    console.error('Vault file error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

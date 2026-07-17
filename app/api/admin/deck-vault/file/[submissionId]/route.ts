import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { fetchFileStream, isDrivePath, driveFileId } from '@/lib/google-drive';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Admin-only door for Deck Vault Rewards submission files.
 * GET /api/admin/deck-vault/file/<submissionId>?kind=deck|cert
 *
 * Mirrors /api/skeletons/file: Drive-backed paths (gdrive:<id>) stream through
 * our domain; legacy Supabase-bucket paths redirect to a short-lived signed URL.
 * The storage provider is never visible to the reviewer.
 */
export async function GET(
  req: Request,
  { params }: { params: { submissionId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userRow } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (!userRow?.is_admin) {
      return NextResponse.json({ error: 'Admins only' }, { status: 403 });
    }

    const kind = new URL(req.url).searchParams.get('kind') === 'cert' ? 'cert' : 'deck';

    const svc = createServiceClient();
    const { data: sub } = await svc
      .from('deck_submissions')
      .select('id, competition_name, deck_path, certificate_path')
      .eq('id', params.submissionId)
      .maybeSingle();
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const path: string = kind === 'cert' ? sub.certificate_path : sub.deck_path;
    const ext = (path.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
    const base = String(sub.competition_name || 'submission').replace(/[^\w\s.-]/g, '').trim().slice(0, 60) || 'submission';
    const safeName = `${base}-${kind}.${CONTENT_TYPES[ext] ? ext : 'pdf'}`;

    if (isDrivePath(path)) {
      const upstream = await fetchFileStream(driveFileId(path));
      const headers = new Headers({
        // Drive knows the real type; our ext guess is only a fallback.
        'Content-Type': upstream.headers.get('content-type') || CONTENT_TYPES[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      const len = upstream.headers.get('content-length');
      if (len) headers.set('Content-Length', len);
      return new Response(upstream.body, { status: 200, headers });
    }

    // Legacy rows: private Supabase bucket → short-lived signed URL.
    const { data: signed, error: signError } = await svc.storage
      .from('deck-vault-submissions')
      .createSignedUrl(path, 300);
    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not prepare the file' }, { status: 500 });
    }
    return NextResponse.redirect(signed.signedUrl, 307);
  } catch (err) {
    console.error('deck-vault admin file error:', err);
    return NextResponse.json({ error: 'File fetch failed' }, { status: 500 });
  }
}

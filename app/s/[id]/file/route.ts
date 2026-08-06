import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

const BUCKET = 'cheat-sheets';

/**
 * GET /s/<id>/file — the PDF itself, served from the mece.in domain.
 *
 * Streams (rather than redirects to) the stored object so the link a creator
 * shares stays on our domain end-to-end: nice in an ad, nice in a bio, and it
 * keeps the storage host out of the shared URL. Revoked sheets 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = (params.id || '').slice(0, 32);
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(id)) {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse('Not available', { status: 503 });
  }

  try {
    const svc = createServiceClient();
    const { data: row } = await svc
      .from('shared_cheat_sheets')
      .select('storage_path, revoked_at')
      .eq('id', id)
      .maybeSingle();

    const sheet = row as { storage_path: string; revoked_at: string | null } | null;
    if (!sheet || sheet.revoked_at) {
      return new NextResponse('Not found', { status: 404 });
    }

    const { data: file, error } = await svc.storage.from(BUCKET).download(sheet.storage_path);
    if (error || !file) return new NextResponse('Not found', { status: 404 });

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        // `inline` is what makes it open in the browser instead of downloading.
        'Content-Disposition': `inline; filename="mece-gd-cheat-sheet-${id}.pdf"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}

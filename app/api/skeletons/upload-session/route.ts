import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createUploadSession } from '@/lib/google-drive';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

/**
 * Admin-only: mint a resumable upload session in the vault's Drive folder.
 * The admin's browser then PUTs the file bytes straight to the session URL,
 * so large files never pass through our serverless request-body limits.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userRow } = await supabase
      .from('users').select('is_admin').eq('id', user.id).single();
    if (!userRow?.is_admin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const filename = String(body?.filename || '').slice(0, 200);
    const mimeType = String(body?.mimeType || 'application/pdf');
    if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 });
    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin;
    const uploadUrl = await createUploadSession(filename, mimeType, origin);

    return NextResponse.json({ uploadUrl });
  } catch (err: any) {
    console.error('Upload session error:', err);
    return NextResponse.json({ error: err.message || 'Could not start upload' }, { status: 500 });
  }
}

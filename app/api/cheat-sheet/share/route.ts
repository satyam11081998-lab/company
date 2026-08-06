import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const BUCKET = 'cheat-sheets';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — a text cheat sheet is ~50-300 KB

/** Rate limit: one publish per user per 10s. Keeps storage from being farmed. */
const lastPublish = new Map<string, number>();

/**
 * POST /api/cheat-sheet/share  (multipart: `file` = the rendered PDF)
 *   -> { url, id }
 *
 * Publishes an already-rendered, watermarked cheat sheet to the public
 * `cheat-sheets` bucket and mints a short mece.in/s/<id> link that opens the
 * PDF in any browser.
 *
 * Trust model: the bucket is PRIVATE with no storage policies, so no client can
 * read or write it directly. Readers get the file through `/s/<id>/file`, which
 * streams it with the service role only after checking `revoked_at` — that is
 * what makes revoking a shared sheet actually revoke it. The upload is validated
 * by size, declared type and PDF magic bytes before it is ever stored.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = Date.now();
    const last = lastPublish.get(user.id);
    if (last && now - last < 10_000) {
      return NextResponse.json({ error: 'Please wait a moment before sharing again.' }, { status: 429 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Sharing is not configured on this environment.' }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get('file');
    const pointCount = Number(form.get('pointCount') || 0);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'That file is too large to share.' }, { status: 400 });
    }
    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files can be shared.' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    // Magic bytes — a mislabelled upload never reaches storage.
    if (bytes.subarray(0, 4).toString('latin1') !== '%PDF') {
      return NextResponse.json({ error: 'That does not look like a PDF.' }, { status: 400 });
    }

    const id = randomBytes(6).toString('base64url'); // 8 url-safe chars
    const path = `${user.id}/${id}.pdf`;
    const svc = createServiceClient();

    const { error: upErr } = await svc.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: 'application/pdf', upsert: false, cacheControl: '31536000' });
    if (upErr) {
      console.error('[cheat-sheet share] upload failed:', upErr);
      return NextResponse.json({ error: 'Could not publish the sheet. Try again.' }, { status: 500 });
    }

    const { error: rowErr } = await svc.from('shared_cheat_sheets').insert({
      id,
      user_id: user.id,
      storage_path: path,
      point_count: Number.isFinite(pointCount) ? Math.max(0, Math.round(pointCount)) : 0,
    });
    if (rowErr) {
      // Roll the object back so we never leave an orphan in a public bucket.
      await svc.storage.from(BUCKET).remove([path]);
      console.error('[cheat-sheet share] row insert failed:', rowErr);
      return NextResponse.json({ error: 'Could not publish the sheet. Try again.' }, { status: 500 });
    }

    lastPublish.set(user.id, now);
    return NextResponse.json({ id, url: `${SITE_URL}/s/${id}` });
  } catch (e) {
    console.error('[cheat-sheet share] error:', e);
    return NextResponse.json({ error: 'Could not publish the sheet.' }, { status: 500 });
  }
}

/**
 * PUT /api/cheat-sheet/share  (multipart: `file`, `id`)
 *
 * Replaces the stored object for a sheet the caller owns. Used for exactly one
 * thing: swapping in the final render that carries its own share link in the
 * footer. Ownership is checked against the row, so one user can never overwrite
 * another's published sheet.
 */
export async function PUT(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Sharing is not configured.' }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get('file');
    const id = String(form.get('id') || '');

    if (!/^[A-Za-z0-9_-]{4,32}$/.test(id)) {
      return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Bad file.' }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 4).toString('latin1') !== '%PDF') {
      return NextResponse.json({ error: 'That does not look like a PDF.' }, { status: 400 });
    }

    const svc = createServiceClient();
    const { data: row } = await svc
      .from('shared_cheat_sheets')
      .select('storage_path, user_id')
      .eq('id', id)
      .maybeSingle();
    const sheet = row as { storage_path: string; user_id: string | null } | null;
    if (!sheet || sheet.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    const { error } = await svc.storage
      .from(BUCKET)
      .upload(sheet.storage_path, bytes, {
        contentType: 'application/pdf', upsert: true, cacheControl: '31536000',
      });
    if (error) {
      console.error('[cheat-sheet share] replace failed:', error);
      return NextResponse.json({ error: 'Could not update the sheet.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[cheat-sheet share] PUT error:', e);
    return NextResponse.json({ error: 'Could not update the sheet.' }, { status: 500 });
  }
}

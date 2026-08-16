import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isDrivePath, driveFileId, fetchFileStream } from '@/lib/google-drive';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Rendering and OpenAI summary may take ~15-30s

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/admin/decks/process
 *
 * Admin proxy to trigger backend page rendering and AI summary generation.
 * Streams the PDF directly from Google Drive / storage to FastAPI so backend
 * requires no Drive auth setup.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('users').select('is_admin').eq('id', user.id).single();
    if (!(profile as Partial<UserRow>)?.is_admin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return NextResponse.json({ error: 'no_session' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.deckId) {
      return NextResponse.json({ error: 'deckId is required' }, { status: 400 });
    }

    const svc = createServiceClient();
    const { data: deck } = await svc
      .from('deck_skeletons')
      .select('id, storage_path, title')
      .eq('id', body.deckId)
      .maybeSingle();

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const action = body.action || 'process'; // 'process' | 'render' | 'summarize'
    const endpoint = `${API_URL}/decks/${encodeURIComponent(body.deckId)}/${action}`;

    // Download PDF bytes using Next.js backend storage access
    let fileBuffer: Buffer | null = null;
    try {
      if (isDrivePath(deck.storage_path)) {
        const streamRes = await fetchFileStream(driveFileId(deck.storage_path));
        fileBuffer = Buffer.from(await streamRes.arrayBuffer());
      } else {
        const { data: bData } = await svc.storage.from('skeletons').download(deck.storage_path);
        if (bData) {
          fileBuffer = Buffer.from(await bData.arrayBuffer());
        }
      }
    } catch (fetchErr: any) {
      console.warn('Could not pre-fetch PDF in Next.js proxy:', fetchErr);
    }

    // Build multipart request
    const formData = new FormData();
    if (fileBuffer && fileBuffer.length > 0) {
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' });
      formData.append('pdf', blob, 'deck.pdf');
    }

    let upstream: Response;
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: fileBuffer ? formData : undefined,
        cache: 'no-store',
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Backend service is unreachable at ${API_URL}.` },
        { status: 502 },
      );
    }

    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      const detail = (payload && (payload.detail || payload.error)) || 'Deck processing failed';
      return NextResponse.json({ error: String(detail) }, { status: upstream.status });
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('Deck processing proxy error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
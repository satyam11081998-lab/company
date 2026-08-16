import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Rendering and OpenAI summary may take ~15-30s

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/admin/decks/process
 *
 * Admin proxy to trigger backend page rendering and AI summary generation.
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

    const action = body.action || 'process'; // 'process' | 'render' | 'summarize'
    const endpoint = `${API_URL}/decks/${encodeURIComponent(body.deckId)}/${action}`;

    let upstream: Response;
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Backend service is unreachable at ${API_URL}. Ensure backend is running.` },
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
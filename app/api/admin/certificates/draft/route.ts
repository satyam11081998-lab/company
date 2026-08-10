import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/admin/certificates/draft
 *
 * Thin proxy to the FastAPI drafter. It exists so the browser never needs the
 * backend's shape, and so admin status is checked on this side too before a
 * GPT-4o call is spent. The backend re-checks independently: this proxy is a
 * convenience, not the security boundary.
 */
export async function POST(req: Request) {
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
  if (!body) return NextResponse.json({ error: 'bad_json' }, { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/certificates/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        work_notes: String(body.work_notes ?? '').slice(0, 6000),
        recipient_program: String(body.recipient_program ?? '').slice(0, 200),
        target_roles: Array.isArray(body.target_roles)
          ? body.target_roles.slice(0, 6).map((r: unknown) => String(r).slice(0, 60))
          : [],
        duration_label: String(body.duration_label ?? '').slice(0, 60),
      }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { error: 'The drafting service is unreachable. Write the two lines by hand.' },
      { status: 502 },
    );
  }

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    // FastAPI puts the human-readable reason in `detail`.
    const detail = (payload && (payload.detail || payload.error)) || 'draft_failed';
    return NextResponse.json({ error: String(detail) }, { status: upstream.status });
  }

  return NextResponse.json(payload);
}

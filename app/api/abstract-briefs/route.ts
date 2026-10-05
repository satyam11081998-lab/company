import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { effectiveTier } from '@/lib/tier';

export const dynamic = 'force-dynamic';

/**
 * Shared Abstract-GD brief library, read from the `abstract_briefs` cache
 * (migration 0036 — written by the backend on every generation, service-role
 * only, so this route is the frontend's window into it).
 *
 * GET            → { briefs: [{ topic_key, topic, created_at }] }  (any signed-in user;
 *                  listing costs nothing and advertises what's already generated)
 * GET ?key=<k>   → { topic, brief }                                (Lite/Pro only —
 *                  viewing a brief is tier-gated, same rule as news GD briefs)
 */
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const key = new URL(request.url).searchParams.get('key');
  const svc = createServiceClient();

  if (!key) {
    const { data, error } = await svc
      .from('abstract_briefs')
      .select('topic_key, topic, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ briefs: data ?? [] });
  }

  // Full brief view — Lite/Pro only (server-enforced; the client gate is UX).
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (effectiveTier(profile) === 'free') {
    return NextResponse.json(
      { error: 'Viewing GD briefs is a Lite/Pro feature' },
      { status: 403 },
    );
  }

  const { data, error } = await svc
    .from('abstract_briefs')
    .select('topic, brief')
    .eq('topic_key', key)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not generated yet' }, { status: 404 });

  return NextResponse.json({ topic: data.topic, brief: data.brief });
}

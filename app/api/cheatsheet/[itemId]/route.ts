import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CHEAT_DOMAIN_IDS } from '@/lib/cheat-domains';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body?.note === 'string') patch.note = body.note.slice(0, 2000);
  if (typeof body?.position === 'number') patch.position = body.position;
  if (body?.domain === null || (typeof body?.domain === 'string' && (CHEAT_DOMAIN_IDS as readonly string[]).includes(body.domain)))
    patch.domain = body.domain;
  if (Array.isArray(body?.tags))
    patch.tags = (body.tags as unknown[])
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 12);
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  const { error } = await supabase.from('cheat_sheet_items')
    .update(patch).eq('id', params.itemId).eq('user_id', user.id); // RLS also enforces
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { itemId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { error } = await supabase.from('cheat_sheet_items')
    .delete().eq('id', params.itemId).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

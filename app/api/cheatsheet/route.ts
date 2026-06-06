import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier';
import { getOrCreateDefaultSheet, listCheatSheetItems } from '@/lib/cheatsheet';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const items = await listCheatSheetItems(supabase, user.id);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (effectiveTier(profile) !== 'pro')
    return NextResponse.json({ error: 'pro_required' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const content = (body?.content ?? '').toString().trim();
  if (!content) return NextResponse.json({ error: 'empty_content' }, { status: 400 });

  const sheetId = await getOrCreateDefaultSheet(supabase, user.id);
  if (!sheetId) return NextResponse.json({ error: 'sheet_unavailable' }, { status: 500 });

  const { data, error } = await supabase.from('cheat_sheet_items').insert({
    sheet_id: sheetId,
    user_id: user.id,
    source_headline_id: body?.source_headline_id ?? null,
    source_topic: (body?.source_topic ?? '').toString().slice(0, 300),
    source_kind: body?.source_kind ?? 'data_point',
    content: content.slice(0, 2000),
  }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

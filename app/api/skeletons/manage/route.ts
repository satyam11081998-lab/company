import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteFile, isDrivePath, driveFileId } from '@/lib/google-drive';

/**
 * Admin-only deck management that needs server credentials:
 * deletion removes the catalogue row AND the backing file (Drive or bucket).
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
    if (body?.action !== 'delete' || !body?.deckId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: deck } = await supabase
      .from('deck_skeletons')
      .select('id, storage_path')
      .eq('id', body.deckId)
      .maybeSingle();
    if (!deck) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { error: rowError } = await supabase
      .from('deck_skeletons').delete().eq('id', deck.id);
    if (rowError) {
      return NextResponse.json({ error: rowError.message }, { status: 500 });
    }

    // Best-effort file cleanup — the catalogue row is already gone.
    try {
      if (isDrivePath(deck.storage_path)) {
        await deleteFile(driveFileId(deck.storage_path));
      } else {
        await supabase.storage.from('skeletons').remove([deck.storage_path]);
      }
    } catch (cleanupErr) {
      console.error('File cleanup failed (row deleted):', cleanupErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Vault manage error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

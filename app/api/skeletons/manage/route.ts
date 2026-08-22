import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
    if (!body?.deckId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Set free-preview pages AND revalidate the public deck page. The admin used
    // to write deck_skeletons.free_pages straight from the client, but the public
    // /decks/[slug] page is ISR-cached (revalidate = 3600), so a lowered limit
    // did not take effect for up to an hour — it looked like the lock was being
    // ignored. Writing it here lets us revalidate the exact path so the new limit
    // goes live immediately.
    if (body.action === 'set_free_pages') {
      const val = body.freePages;
      if (val !== null && (typeof val !== 'number' || !Number.isFinite(val) || val < 0)) {
        return NextResponse.json(
          { error: 'Free pages must be a non-negative number or null.' },
          { status: 400 },
        );
      }
      const { data: updated, error: updErr } = await supabase
        .from('deck_skeletons')
        .update({ free_pages: val })
        .eq('id', body.deckId)
        .select('slug')
        .maybeSingle();
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      if (updated?.slug) {
        // Bust the ISR cache for the public deck page so the new lock is live now.
        revalidatePath(`/decks/${updated.slug}`);
      }
      return NextResponse.json({ success: true, slug: updated?.slug ?? null });
    }

    if (body.action !== 'delete') {
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

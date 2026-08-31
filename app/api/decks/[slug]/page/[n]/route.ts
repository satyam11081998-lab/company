import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { hasDeckAccess } from '@/lib/deck-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * True when the COOKIE-authenticated caller may read this deck's LOCKED pages.
 * Entitlement (lib/deck-access.ts): admin, active Pro, a whole-vault unlock
 * (₹499, skeleton_access), or this single deck bought (₹99, deck_purchases).
 *
 * Uses the RLS-scoped session client, so it can only ever read the caller's own
 * rows. Fails CLOSED: any error (no session, RLS, network) returns false, so a
 * locked slide is only served to a verified entitled user. Only called on the
 * locked branch, so anonymous free-page requests never pay for it and stay
 * publicly cacheable.
 */
async function callerHasDeckAccess(skeletonId: string): Promise<boolean> {
  try {
    const authed = createClient();
    const {
      data: { user },
    } = await authed.auth.getUser();
    if (!user) return false;
    return await hasDeckAccess(authed, user.id, skeletonId);
  } catch {
    return false;
  }
}

/**
 * Public image delivery endpoint for case competition deck slides.
 *
 * Security Model (Server-Side SQL Enforcement ONLY):
 *   The free page limit is derived directly from the Postgres database
 *   via the `effective_free_pages` SQL function on `deck_skeletons`.
 *
 *   n <= effective_free_pages -> 200 (image/webp or image/jpeg), Cache-Control: public, immutable
 *   n >  effective_free_pages -> 403 Forbidden unless the caller owns the deck
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string; n: string } }
) {
  try {
    const cleanN = params.n.replace(/\.(webp|jpe?g)$/i, '');
    const isJpegRequested = params.n.endsWith('.jpg') || params.n.endsWith('.jpeg') || new URL(req.url).searchParams.get('format') === 'jpg';

    const pageNum = parseInt(cleanN, 10);
    if (!Number.isFinite(pageNum) || pageNum < 1) {
      return new Response(null, { status: 400 });
    }

    const svc = createServiceClient();
    const { data: deck } = await svc
      .from('deck_skeletons')
      .select('id, slug, is_active, page_count, effective_free_pages, storage_path')
      .eq('slug', params.slug)
      .maybeSingle();

    if (!deck || !deck.is_active) {
      return new Response(null, { status: 404 });
    }

    const raw = Number(deck.effective_free_pages);
    const effectiveLimit = Number.isFinite(raw) ? raw : 1;

    // Free pages: served to anyone, cached hard (below). Locked pages: 403 for
    // the public, but a COOKIE-verified entitled viewer (admin / Pro / vault /
    // this deck bought) gets them — served PRIVATE so no shared/CDN cache can
    // ever hold an entitled response and leak it to anon.
    let cacheControl = 'public, max-age=31536000, immutable';
    if (pageNum > effectiveLimit) {
      const entitled = await callerHasDeckAccess(deck.id);
      if (!entitled) {
        return new Response(null, { status: 403 });
      }
      cacheControl = 'private, max-age=600';
    }

    let storagePath = `${deck.id}/${pageNum}.webp`;
    let contentType = 'image/webp';

    if (isJpegRequested && pageNum === 1) {
      storagePath = `${deck.id}/og.jpg`;
      contentType = 'image/jpeg';
    }

    // 1. Fetch from private Supabase storage bucket
    let { data: fileData, error: storageError } = await svc.storage
      .from('deck-pages')
      .download(storagePath);

    // 2. If not found (not rendered yet), attempt on-demand render via backend
    if (storageError || !fileData) {
      const token = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET || '';
      if (token) {
        try {
          const renderRes = await fetch(`${API_URL}/decks/${encodeURIComponent(deck.id)}/render`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          });

          if (renderRes.ok) {
            // Re-fetch the newly rendered image
            const retry = await svc.storage.from('deck-pages').download(storagePath);
            fileData = retry.data;
            storageError = retry.error;
          }
        } catch {
          // Fall through to 404 if backend is unreachable
        }
      }
    }

    if (storageError || !fileData) {
      if (isJpegRequested) {
        const { data: fallbackData } = await svc.storage
          .from('deck-pages')
          .download(`${deck.id}/${pageNum}.webp`);
        if (fallbackData) {
          const buffer = Buffer.from(await fallbackData.arrayBuffer());
          return new Response(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/webp',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Content-Type-Options': 'nosniff',
            },
          });
        }
      }
      return new Response(null, { status: 404 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    console.error('Deck page image error:', err);
    return new Response(null, { status: 500 });
  }
}

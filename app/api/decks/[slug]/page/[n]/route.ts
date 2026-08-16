import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public image delivery endpoint for case competition deck slides.
 *
 * Security Model (Server-Side SQL Enforcement ONLY):
 *   The free page limit is derived directly from the Postgres database
 *   via the `effective_free_pages` SQL function on `deck_skeletons`.
 *
 *   n <= effective_free_pages -> 200 (image/webp or image/jpeg), Cache-Control: public, immutable
 *   n >  effective_free_pages -> 403 Forbidden, empty body (bytes never leave)
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string; n: string } }
) {
  try {
    // Handle optional .jpg / .webp extension in n or query param
    const cleanN = params.n.replace(/\.(webp|jpe?g)$/i, '');
    const isJpegRequested = params.n.endsWith('.jpg') || params.n.endsWith('.jpeg') || new URL(req.url).searchParams.get('format') === 'jpg';

    const pageNum = parseInt(cleanN, 10);
    if (!Number.isFinite(pageNum) || pageNum < 1) {
      return new Response(null, { status: 400 });
    }

    const svc = createServiceClient();
    const { data: deck } = await svc
      .from('deck_skeletons')
      .select('id, slug, is_active, page_count, effective_free_pages')
      .eq('slug', params.slug)
      .maybeSingle();

    if (!deck || !deck.is_active) {
      return new Response(null, { status: 404 });
    }

    // Strict SQL-derived server paywall: bytes never leave if page > effective_free_pages
    // `|| 1` was wrong here: 0 is FALSY, so an admin who set free_pages = 0 to
    // lock a deck completely would still have had page 1 served. The migration
    // explicitly permits 0 (`check free_pages >= 0`) and documents it as
    // "fully locked", so the fallback must only fire when the value is genuinely
    // absent or non-numeric — never when it is a deliberate zero.
    const raw = Number(deck.effective_free_pages);
    const effectiveLimit = Number.isFinite(raw) ? raw : 1;
    if (pageNum > effectiveLimit) {
      return new Response(null, { status: 403 });
    }

    // Determine storage file path and content type
    let storagePath = `${deck.id}/${pageNum}.webp`;
    let contentType = 'image/webp';

    if (isJpegRequested && pageNum === 1) {
      storagePath = `${deck.id}/og.jpg`;
      contentType = 'image/jpeg';
    }

    // Fetch from private Supabase storage bucket
    const { data: fileData, error: storageError } = await svc.storage
      .from('deck-pages')
      .download(storagePath);

    if (storageError || !fileData) {
      // Fallback to webp if specific format not found
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
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    console.error('Deck page image error:', err);
    return new Response(null, { status: 500 });
  }
}
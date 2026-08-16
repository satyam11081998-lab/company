import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dedicated Open Graph / Twitter card image endpoint (serves JPEG).
 *
 * Guaranteed compatibility across all social platforms (LinkedIn, Twitter/X,
 * WhatsApp, Slack) and AI answer engines that reject WebP for OG previews.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const svc = createServiceClient();
    const { data: deck } = await svc
      .from('deck_skeletons')
      .select('id, slug, is_active, effective_free_pages')
      .eq('slug', params.slug)
      .maybeSingle();

    if (!deck || !deck.is_active) {
      return new Response(null, { status: 404 });
    }

    // The OG image is page 1, so it is subject to the SAME paywall as page 1.
    // Without this check the endpoint was a bypass: an admin who set
    // free_pages = 0 to lock a deck completely would still have had its first
    // slide served to anyone who requested the OG URL — and OG URLs are, by
    // design, the most widely shared and most aggressively fetched URLs a page
    // has. A locked deck simply has no preview image.
    const rawFree = Number(deck.effective_free_pages);
    const effectiveFree = Number.isFinite(rawFree) ? rawFree : 1;
    if (effectiveFree < 1) {
      return new Response(null, { status: 404 });
    }

    // Try og.jpg, 1.jpg, then fallback to 1.webp
    let { data: fileData } = await svc.storage
      .from('deck-pages')
      .download(`${deck.id}/og.jpg`);

    let contentType = 'image/jpeg';

    if (!fileData) {
      const res = await svc.storage.from('deck-pages').download(`${deck.id}/1.jpg`);
      fileData = res.data;
    }

    if (!fileData) {
      const res = await svc.storage.from('deck-pages').download(`${deck.id}/1.webp`);
      fileData = res.data;
      contentType = 'image/webp';
    }

    if (!fileData) {
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
    console.error('Deck OG image error:', err);
    return new Response(null, { status: 500 });
  }
}
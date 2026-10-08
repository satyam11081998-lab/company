import { NextResponse } from 'next/server';
import { track } from '@/lib/crm/server/outbox';

export const dynamic = 'force-dynamic';

const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/$/, '');

/**
 * Email tracking. o.<id>.<sig> → 1×1 gif (open); c.<id>.<n>.<sig> → 302 to
 * the n-th link STORED on that outbox row (never a URL from the request, so
 * this is not an open redirect). Bad or forged tokens: pixel / home page.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  let res: Awaited<ReturnType<typeof track>> = { kind: 'bad' };
  try {
    res = await track(params.token, req.headers.get('user-agent') ?? '');
  } catch (e) {
    console.error('[crm] tracking failed', e);
  }
  if (res.kind === 'click' && res.url) return NextResponse.redirect(res.url, 302);
  if (params.token.startsWith('c.')) return NextResponse.redirect(SITE, 302);
  return new NextResponse(PIXEL, {
    status: 200,
    headers: { 'content-type': 'image/gif', 'cache-control': 'no-store, max-age=0', 'x-robots-tag': 'noindex' },
  });
}

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/crm/server/svc';
import { loadMetaWith } from '@/lib/crm/server/meta';
import { submitForm } from '@/lib/crm/server/forms';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 64 * 1024;

function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 64);
  return (req.headers.get('x-real-ip') ?? 'unknown').slice(0, 64);
}

/** Public web-form submit. JSON only (a cross-site <form> post can't send JSON without a CORS preflight, which this route never answers). */
export async function POST(req: Request, { params }: { params: { key: string } }) {
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ ok: false, message: 'Unsupported request.' }, { status: 415 });
  }
  const len = Number(req.headers.get('content-length') ?? '0');
  if (len > MAX_BYTES) return NextResponse.json({ ok: false, message: 'That is too much text.' }, { status: 413 });
  let payload: unknown;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BYTES) return NextResponse.json({ ok: false, message: 'That is too much text.' }, { status: 413 });
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, message: 'Unsupported request.' }, { status: 400 });
  }
  try {
    const meta = await loadMetaWith(createServiceClient());
    const out = await submitForm(meta, params.key, payload, clientIp(req));
    return NextResponse.json(out.body, { status: out.status, headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    console.error('[crm] web form submit failed', e);
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

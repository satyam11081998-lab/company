import { NextResponse } from 'next/server';
import { answerSurvey } from '@/lib/crm/server/surveys';

export const dynamic = 'force-dynamic';

/** Public survey answer (JSON). One answer per token; validated server-side. */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ ok: false, message: 'Unsupported request.' }, { status: 415 });
  }
  let body: { score?: unknown; comment?: unknown } = {};
  try {
    const raw = await req.text();
    if (raw.length > 8000) return NextResponse.json({ ok: false, message: 'That comment is too long.' }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, message: 'Unsupported request.' }, { status: 400 });
  }
  try {
    const r = await answerSurvey(params.token, body.score, body.comment);
    return NextResponse.json(r, { status: r.ok ? 200 : 400, headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    console.error('[crm] survey answer failed', e);
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

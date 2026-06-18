import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { FEEDBACK_CATEGORY_IDS } from '@/lib/feedback';

export const dynamic = 'force-dynamic';

const MAX_MESSAGE = 4000;
const MAX_PATH = 500;
const MAX_EMAIL = 200;

// Best-effort, in-memory per-IP throttle. NOTE: on serverless this resets per
// cold start and is per-instance, so it is a soft guard, not a hard limit.
// See OPEN ITEM in the handoff: swap for a KV/Upstash counter if abuse appears.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(): string {
  const h = headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}

function sanitizeContext(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const allow = ['entity_type', 'entity_id', 'viewport', 'ua', 'referrer'];
  const out: Record<string, unknown> = {};
  for (const k of allow) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === 'string') out[k] = v.slice(0, 300);
  }
  return out;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const message = (body.message ?? '').toString().trim();
  if (!message) return NextResponse.json({ error: 'empty_message' }, { status: 400 });

  const category = FEEDBACK_CATEGORY_IDS.includes(body.category) ? body.category : 'general';

  if (throttled(clientIp())) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const contactEmail = (body.contact_email ?? '').toString().trim().slice(0, MAX_EMAIL) || null;

  const { error } = await supabase.from('feedback_reports').insert({
    user_id: user?.id ?? null,
    category,
    message: message.slice(0, MAX_MESSAGE),
    contact_email: contactEmail,
    path: (body.path ?? '').toString().slice(0, MAX_PATH) || null,
    context: sanitizeContext(body.context),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

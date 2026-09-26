import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_PREVIEW_COOKIE, ADMIN_PREVIEW_MAX_AGE } from '@/lib/admin-preview';

/**
 * POST /api/admin/us-preview   (form fields: mode = on | off, to = /path)
 *
 * Switches the admin "view as US" preview (lib/admin-preview.ts) on or off and
 * 303-redirects, so the browser does a FULL page load and every client
 * component (nav, user context) re-reads the previewed market.
 *
 * Turning it ON requires an admin session; the cookie is also ignored for
 * non-admins when read, so it is harmless in anyone else's browser. Turning it
 * OFF needs no check. A native form POST only carries the (SameSite=lax)
 * session cookie from our own origin, so another site cannot toggle it.
 */
function safePath(raw: FormDataEntryValue | null, fallback: string): string {
  const s = typeof raw === 'string' ? raw : '';
  return s.startsWith('/') && !s.startsWith('//') && !s.includes('\\') ? s : fallback;
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const mode = form.get('mode') === 'off' ? 'off' : 'on';

  if (mode === 'off') {
    const res = NextResponse.redirect(new URL(safePath(form.get('to'), '/admin/us-market'), req.url), 303);
    res.cookies.delete(ADMIN_PREVIEW_COOKIE);
    return res;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: row } = await supabase.from('users').select('is_admin').eq('id', user.id).maybeSingle();
  if (!(row as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const res = NextResponse.redirect(new URL(safePath(form.get('to'), '/practice'), req.url), 303);
  res.cookies.set(ADMIN_PREVIEW_COOKIE, 'US', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ADMIN_PREVIEW_MAX_AGE,
  });
  return res;
}

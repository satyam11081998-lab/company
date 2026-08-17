import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeNextPath } from '@/lib/constants';

/**
 * Auth callback used by Google OAuth and Supabase email magic links
 * (including password reset). Exchanges the code for a session and
 * redirects to `next` or /home.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  // Same-site only — a crafted next= must not turn the callback into an
  // open redirect. See sanitizeNextPath.
  const next = sanitizeNextPath(url.searchParams.get('next'));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${url.origin}${next}`);
    }
  }

  // Auth failed — send back to login with an error flag
  return NextResponse.redirect(`${url.origin}/login?error=auth_callback`);
}

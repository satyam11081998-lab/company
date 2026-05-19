import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback used by Google OAuth and Supabase email magic links
 * (including password reset). Exchanges the code for a session and
 * redirects to `next` or /dashboard.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';

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

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_ROUTES, AUTH_ROUTES } from '@/lib/constants';

/**
 * Refresh the Supabase session on every request and guard protected routes.
 * Public routes are allowed without auth; everything else redirects to /login.
 */
export async function updateSession(request: NextRequest) {
  // Propagate the current pathname to Server Components via a REQUEST header.
  // The (app) layout reads this with next/headers `headers()` to run the
  // onboarding gate. It MUST live on the request — a response header is NOT
  // visible to RSC `headers()`, which is why the gate was previously fragile.
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and on auth pages, push them into the app
  if (user && isAuthPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/dashboard';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  // Surface the current pathname as an internal header so the (app) layout
  // (which runs after middleware) can read it via next/headers and run the
  // onboarding-gate redirect without re-parsing the URL.
  supabaseResponse.headers.set('x-pathname', pathname);
  return supabaseResponse;
}

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_ROUTES, AUTH_ROUTES, isPreviewPath } from '@/lib/constants';

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

  // Early exit: if the route is public AND no session cookie exists,
  // skip Supabase entirely — no need to refresh a session that doesn't exist.
  // This avoids the getUser() network call that can cause MIDDLEWARE_INVOCATION_TIMEOUT
  // on Vercel when Supabase is slow or in a distant region.
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-'));

  if (isPublic && !hasSession) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('x-pathname', pathname);
    return response;
  }

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

  const isAuthPage = AUTH_ROUTES.includes(pathname);
  // Guest-previewable app routes (dashboard/practice/cases/leaderboard). These
  // are NOT in PUBLIC_ROUTES so the onboarding gate below still fires for
  // logged-in users; they only relax the "guest → /login" bounce so logged-out
  // visitors can browse a read-only preview.
  const isPreview = isPreviewPath(pathname);

  if (!user && !isPublic && !isPreview) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and on auth pages, push them into the app.
  //
  // GUEST MODE (0045): anonymous users are EXEMPT. A guest holds a session, so
  // this bounced them straight back to /dashboard the instant they clicked
  // "Log in" — making the link a silent no-op loop. But a guest going to
  // /login is entirely legitimate: they are telling us they already have a
  // real account. They must be allowed to reach the form.
  if (user && !user.is_anonymous && isAuthPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/dashboard';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  // ── Onboarding gate ──────────────────────────────────────────────────
  // Runs HERE, in middleware, because `pathname` is 100% reliable on the
  // request. The previous gate lived in the (app) layout and read the path
  // via headers() — that proved unreliable on Vercel and caused an infinite
  // redirect loop → 503 blank page for not-yet-onboarded users. We skip API
  // and auth routes (they must not be redirected to an HTML page).
  // /session-conflict is exempt: the (app) layout redirects here when another
  // device holds the account, and it lives OUTSIDE the (app) group. Without
  // this carve-out a not-yet-onboarded user would ping-pong
  // /session-conflict -> /onboarding -> /session-conflict forever.
  // Guest (anonymous auth) users skip the onboarding gate entirely — they have
  // no onboarding_completed_at and would infinite-redirect to /onboarding.
  // GUEST MODE (0045): "/" is in PUBLIC_ROUTES, so it normally skips this gate.
  // But "/" is rewritten to the dashboard for any signed-in user (see below),
  // and a half-onboarded real user must not be shown a dashboard — they must
  // still be sent to /onboarding. So "/" opts INTO the gate whenever a session
  // exists. Logged-out "/" is untouched and stays static.
  //
  // Gated on the same flag as the rewrite it exists to protect: with guest mode
  // off there is no rewrite, so opting "/" into the gate would only add a users
  // query and a behaviour change to every logged-in homepage hit for no reason.
  const isRootWithUser =
    pathname === '/' && !!user && process.env.NEXT_PUBLIC_GUEST_MODE === 'true';
  if (
    user && !user.is_anonymous && (!isPublic || isRootWithUser) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/session-conflict')
  ) {
    const onOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding/');
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .maybeSingle();
    const onboarded = !!profile?.onboarding_completed_at;

    if (!onboarded && !onOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      url.search = '';
      return NextResponse.redirect(url);
    }
    if (onboarded && onOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // ── Guests are confined to the guest surface ─────────────────────────
  // GUEST MODE (0045). An anonymous session is a real session, so without this
  // every authenticated page — leaderboard, profile, upgrade, cheat sheet,
  // deck vault, resume, GD briefs, skeletons — opens for someone who has never
  // given us an email. Hiding the nav links was not enough; a typed URL, a
  // stale tab or a shared link still got in.
  //
  // Done HERE rather than per page deliberately: eight pages today, and the
  // ninth one somebody adds next month would silently be exposed. One
  // allowlist, one place, and new routes are closed by default.
  //
  // What a guest may reach: the dashboard (their whole product surface), an
  // individual case (to solve it), the free casebook, the auth pages (to
  // convert), plus everything already public. Results and onboarding are listed
  // because a guest becomes non-anonymous mid-flight on conversion and may
  // arrive a beat before the session refreshes.
  // REMOVED (2026-08-10, owner spec): the guest allowlist that redirected
  // anonymous users off every authenticated page. The answer to "a guest opened
  // /practice" is now an overlay — they SEE the real questions, blurred, with
  // "Log in to continue" over them — not a redirect that hides the product.
  // Redirecting taught them nothing; the overlay shows exactly what an account
  // buys. The real boundary is unchanged and lives where it always did:
  // lib/access.ts and services/access_guard.py still refuse a guest on any
  // non-daily case, and assert_can_submit still gates scoring.

  // ── "/" serves the dashboard, without changing the URL ───────────────
  // GUEST MODE (0045). The owner's requirement is that mece.in IS the
  // dashboard — not a landing page that forwards to /dashboard. A client-side
  // router.push() would have satisfied neither the requirement nor the SEO
  // constraint:
  //   • the address bar would read /dashboard, which is the "marketing page +
  //     Try it now" shape that was explicitly rejected;
  //   • /dashboard -> Back -> / -> pushed forward again = the user cannot
  //     leave (a push/replace trap);
  //   • the marketing content would flash before the jump, and that shift is
  //     measured by CLS — degrading the Core Web Vitals the plan protects;
  //   • and Googlebot RENDERS JavaScript. It has no cookie, so it would take
  //     the guest branch, mint an anonymous user on every crawl, and index the
  //     rendered "/" as a bounce to a URL that is not even in the sitemap.
  //
  // A REWRITE has none of those properties. The URL stays "/", the response
  // body is the dashboard, and it is decided server-side on cookie presence.
  // Crawlers never carry a session cookie, so they fall through to the static,
  // ISR-cached "/" (revalidate = 300) with its <head>, H1, FAQ JSON-LD and
  // proof sections intact. That is the whole SEO invariant, enforced here
  // rather than hoped for in a useEffect.
  //
  // Onboarding is deliberately checked BEFORE this: a half-onboarded real user
  // must still be sent to /onboarding rather than shown a dashboard at "/".
  //
  // FLAG-GATED. This is the one change in guest mode that would otherwise fire
  // for REAL, existing users the moment it lands — it does not need an
  // anonymous session, only any session at all. Landing it on main unflagged
  // would silently change what every logged-in user sees at mece.in with no
  // preview and no way back except a revert. Behind the flag, merging to main
  // is inert and turning it on is an env var, which is also the rollback.
  if (pathname === '/' && user && process.env.NEXT_PUBLIC_GUEST_MODE === 'true') {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    const rewritten = NextResponse.rewrite(dashUrl, { request: { headers: requestHeaders } });
    // CRITICAL: `supabaseResponse` carries the refreshed auth cookies written
    // by setAll() during getUser(). Returning a fresh NextResponse without
    // copying them silently drops the rotated refresh token — the documented
    // way to log every user out at random. Copy them across verbatim.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewritten.cookies.set(cookie);
    });
    rewritten.headers.set('x-pathname', pathname);
    return rewritten;
  }

  // Surface the current pathname as an internal header so the (app) layout
  // (which runs after middleware) can read it via next/headers and run the
  // onboarding-gate redirect without re-parsing the URL.
  supabaseResponse.headers.set('x-pathname', pathname);
  return supabaseResponse;
}

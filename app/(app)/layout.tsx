import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import AppNav from '@/components/app-nav';
import { UserProvider } from '@/components/user-context';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import Footer from '@/components/footer';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import FeedbackLauncher from '@/components/feedback/feedback-launcher';
import GuestPreviewNav from '@/components/guest/guest-preview-nav';
import { getCachedAuthUser, getCachedUserRow } from '@/lib/supabase/auth-cached';
import { isPreviewPath } from '@/lib/constants';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Public-content carve-out: /learn/** is listed in PUBLIC_ROUTES (middleware
 * lets unauthenticated requests through) so the Casebook is crawlable by
 * search engines and AI crawlers and readable by logged-out visitors.
 * Middleware sets `x-pathname` on the REQUEST headers, so it is reliable
 * here. Fail-safe: if the header is ever missing, guests fall back to the
 * login redirect (the pre-existing behaviour) — never the other way around.
 */
function isPublicLearnPath(pathname: string): boolean {
  return pathname === '/learn' || pathname.startsWith('/learn/');
}

/**
 * Guests may render inside the app shell for two kinds of routes:
 *   - public learn/casebook content (SEO + logged-out reading), and
 *   - the guest PREVIEW routes (dashboard/practice/cases/leaderboard) where a
 *     logged-out visitor sees a read-only teaser and every real action is gated.
 */
function isGuestViewablePath(pathname: string): boolean {
  return isPublicLearnPath(pathname) || isPreviewPath(pathname);
}

/**
 * Lightweight chrome for logged-out readers of public learn content AND the
 * guest preview experience. On preview routes it also surfaces a section nav so
 * a guest can move between Dashboard / Practice / Leaderboard / Casebook while
 * exploring, and a persistent "sign in" prompt.
 */
function GuestChrome({ children, showPreviewNav }: { children: React.ReactNode; showPreviewNav: boolean }) {
  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full">
        <div className="container flex h-14 md:h-16 items-center justify-between gap-2">
          <Link href="/" className="flex items-center -ml-2 shrink-0" aria-label="MECE home">
            <Logo isLanding={true} className="" />
          </Link>
          <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <button className="text-[15px] font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors">
                Log in
              </button>
            </Link>
            <Link href="/signup">
              <button className="btn-primary text-sm md:text-[15px] py-1.5 px-4 md:py-2 md:px-6 whitespace-nowrap shadow-sm">
                Get started
              </button>
            </Link>
          </div>
        </div>
        {showPreviewNav && <GuestPreviewNav />}
      </nav>
      <main className="min-h-[calc(100vh-64px)] flex flex-col relative w-full overflow-x-clip max-w-[100vw]">
        <div className="flex-1 pb-10">
          {children}
        </div>
        <Footer className="pb-12" />
      </main>
      <FeedbackLauncher />
    </>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Both calls are React.cache()-memoised → if a child page calls them again
  // during the same request, no extra Supabase round-trips fire. Cuts the
  // typical per-navigation auth cost from ~400ms to ~200ms.
  const authUser = await getCachedAuthUser();

  if (!authUser) {
    const pathname = headers().get('x-pathname') ?? '';
    if (isGuestViewablePath(pathname)) {
      return <GuestChrome showPreviewNav={isPreviewPath(pathname)}>{children}</GuestChrome>;
    }
    redirect('/login');
  }

  const userRow = await getCachedUserRow(authUser.id);

  // NOTE: the onboarding redirect now lives in middleware (lib/supabase/
  // middleware.ts), where the request pathname is reliable. Doing it here via
  // headers() was unreliable on Vercel and caused a redirect loop → 503 blank
  // page for not-yet-onboarded users. Do NOT re-add a path-based redirect here.

  const fallbackUser: UserRow = {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    points: 0,
    created_at: new Date().toISOString(),
    subscription_tier: 'free',
    subscription_started_at: null,
    subscription_expires_at: null,
    streak_count: 0,
    streak_last_date: null,
    is_admin: false,
  };

  const user: UserRow = userRow ?? fallbackUser;

  return (
    <UserProvider initialUser={user}>
      <AppNav />
      <main className="min-h-[calc(100vh-64px)] flex flex-col relative w-full overflow-x-clip max-w-[100vw]">
        <div className="flex-1 pb-24 xl:pb-10 min-h-[calc(100vh-3.5rem)] xl:min-h-0">
          {children}
        </div>
        <Footer className="pb-24 xl:pb-12" />
      </main>
      <MobileBottomNav />
      <FeedbackLauncher />
    </UserProvider>
  );
}

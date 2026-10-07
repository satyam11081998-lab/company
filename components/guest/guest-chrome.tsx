import Link from 'next/link';
import Footer from '@/components/footer';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import FeedbackLauncher from '@/components/feedback/feedback-launcher';
import GuestPreviewNav from '@/components/guest/guest-preview-nav';

/**
 * Lightweight chrome for logged-out readers of public learn content AND the
 * guest preview experience. On preview routes it also surfaces a section nav so
 * a guest can move between Dashboard / Practice / Leaderboard / Casebook while
 * exploring, and a persistent "sign in" prompt.
 *
 * Moved here unchanged from app/(app)/layout.tsx (2026-10-07) so the static
 * logged-out copy of the Casebook (app/learn-static) renders exactly the same
 * chrome. The only change is that the market is passed in as `intl` instead of
 * being read from the request inside: the (app) layout passes
 * isIntlMarket(requestRegion()) — the value it read before — and the static
 * copy passes false (it is only ever served to visitors placed in India; see
 * lib/supabase/middleware.ts).
 */
export default function GuestChrome({
  children,
  showPreviewNav,
  intl,
}: {
  children: React.ReactNode;
  showPreviewNav: boolean;
  intl: boolean;
}) {
  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full">
        <div className="container flex h-14 md:h-16 items-center justify-between gap-2">
          <Link href={intl ? '/us' : '/'} className="flex items-center -ml-2 shrink-0" aria-label="MECE home">
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
        {showPreviewNav && <GuestPreviewNav intl={intl} />}
      </nav>
      <main className="min-h-[calc(100vh-64px)] flex flex-col relative w-full overflow-x-clip max-w-[100vw]">
        <div className="flex-1 pb-10">
          {children}
        </div>
        <Footer className="pb-12" intl={intl} />
      </main>
      <FeedbackLauncher />
    </>
  );
}

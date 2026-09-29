import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthCTA from '@/components/auth-cta';
import LandingMobileNav from '@/components/landing-mobile-nav';
import Wordmark from '@/components/home/wordmark';
import HomeThemeButton from '@/components/home/theme-button';

export const HOME_NAV: { href: string; label: string }[] = [
  { href: '/learn/mece-framework', label: 'MECE framework' },
  { href: '/learn/casebook/getting-started/what-it-tests', label: 'Free Casebook' },
  { href: '/dashboard', label: 'Start practising' },
  { href: '#scoring', label: 'Scoring' },
  { href: '/methodology', label: 'Methodology' },
];

/** Red announcement bar + sticky nav for the India landing. */
export default function HomeHeader() {
  return (
    <>
      <div className="bg-primary px-4 py-2.5 text-center text-[13px] font-medium text-primary-foreground">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          Thousands of aspirants are already studying our free casebook. Don&apos;t be the only one unprepared.
          <Link
            href="/learn/casebook/getting-started/what-it-tests"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-[3px] transition-opacity hover:opacity-80"
          >
            Read it now <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </span>
      </div>

      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/[0.92] backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-[68px] w-full max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 lg:h-[74px]">
          <div className="flex min-w-0 items-center gap-8 xl:gap-12">
            <Link href="/" aria-label="MECE — home" className="shrink-0 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Wordmark taglineFrom="xl" />
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-5 lg:flex xl:gap-8">
              {HOME_NAV.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="whitespace-nowrap font-editorial text-[15px] text-foreground/80 transition-colors hover:text-primary xl:text-[16px]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <HomeThemeButton />
            <span aria-hidden className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <AuthCTA variant="nav" look="editorial" />
            <LandingMobileNav hideFrom="lg" links={HOME_NAV.map((l) => (l.href.startsWith('#') ? { ...l, href: `/${l.href}` } : l))} />
          </div>
        </div>
      </header>
    </>
  );
}

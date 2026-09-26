import Link from 'next/link';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import LandingMobileNav from '@/components/landing-mobile-nav';

/** Nav for the international (US + Europe) marketing pages under /us. */
export const US_NAV_LINKS = [
  { href: '/us/case-interview-examples', label: 'Case examples' },
  { href: '/us/market-sizing-questions', label: 'Market sizing' },
  { href: '/us#how-scoring-works', label: 'How scoring works' },
  { href: '/us/pricing', label: 'Pricing' },
];

export default function UsSiteHeader() {
  return (
    <nav className="sticky top-0 z-50 w-full max-w-[100vw] overflow-hidden border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between md:h-16">
        <div className="flex shrink-0 items-center gap-4 md:gap-10">
          <Link href="/us" className="-ml-4 -mt-1.5 flex shrink-0 items-center md:-ml-6" aria-label="MECE home">
            <Logo isLanding={true} className="" />
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {US_NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="touch-target text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <ThemeToggle />
          <AuthCTA variant="nav" />
          <LandingMobileNav links={US_NAV_LINKS} />
        </div>
      </div>
    </nav>
  );
}

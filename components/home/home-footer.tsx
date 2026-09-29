import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';
import Wordmark from '@/components/home/wordmark';
import { LINKEDIN_COMPANY_URL } from '@/lib/constants';

/**
 * Light footer for the India landing (the shared navy <Footer/> stays on
 * every other page). Social links are only the live profiles: LinkedIn, and
 * the Instagram handle MECE already uses in its email signature. There is no
 * YouTube channel yet (@mece-in returns 404), so there is no YouTube icon.
 */

const COLS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/learn/mece-framework', label: 'MECE framework' },
      { href: '/learn/casebook/getting-started/what-it-tests', label: 'Free Casebook' },
      { href: '/dashboard', label: 'Start practising' },
      { href: '/#scoring', label: 'Scoring' },
      { href: '/methodology', label: 'Methodology' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/learn/casebook/cases/profitability/regional-dairy-cooperative', label: 'Case library' },
      { href: '/learn/casebook/guesstimates/pain-and-promise', label: 'Guesstimates' },
      { href: '/gd-briefs', label: 'GD briefs' },
      { href: '/insights', label: 'Insights' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/testimonials', label: 'Success stories' },
      { href: 'mailto:team@mece.in', label: 'Contact', external: true },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
      { href: '/refund', label: 'Refund policy' },
    ],
  },
];

export default function HomeFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Link href="/" aria-label="MECE — home" className="inline-block rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Wordmark />
          </Link>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            The premier platform for MBA &amp; PGDM students to master consulting, finance, and product management
            interviews through structured, MECE-driven practice.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
          {COLS.map((c) => (
            <div key={c.title}>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-navy dark:text-white">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-5 lg:col-span-2 lg:items-end">
          <div className="flex items-center gap-2">
            <a
              href={LINKEDIN_COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MECE on LinkedIn"
              className="grid h-10 w-10 place-items-center rounded-[8px] text-navy transition-colors hover:bg-muted dark:text-white"
            >
              <Linkedin aria-hidden className="h-[19px] w-[19px]" />
            </a>
            <a
              href="https://www.instagram.com/mece.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MECE on Instagram"
              className="grid h-10 w-10 place-items-center rounded-[8px] text-navy transition-colors hover:bg-muted dark:text-white"
            >
              <Instagram aria-hidden className="h-[19px] w-[19px]" />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-col gap-2 border-t border-border/70 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} MECE Prep. All rights reserved.</p>
          <p>Not affiliated with any consulting firm.</p>
        </div>
      </div>
    </footer>
  );
}

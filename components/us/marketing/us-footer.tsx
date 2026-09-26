import Link from 'next/link';
import Logo from '@/components/logo';
import { LINKEDIN_COMPANY_URL } from '@/lib/constants';

/**
 * US footer. Links only to pages written for a US visitor (plus the legal
 * pages, which apply to everyone). The India-oriented About, Methodology and
 * casebook pages are deliberately not linked from here.
 */
const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: 'Practice',
    links: [
      { href: '/practice', label: 'Practice library' },
      { href: '/us/case-interview-examples', label: 'Case interview examples' },
      { href: '/us/market-sizing-questions', label: 'Market sizing questions' },
      { href: '/us/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Method',
    links: [
      { href: '/us#method', label: 'The MECE method' },
      { href: '/us#how-scoring-works', label: 'How scoring works' },
      { href: '/us#faq', label: 'Questions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: 'mailto:team@mece.in', label: 'Contact', external: true },
      { href: LINKEDIN_COMPANY_URL, label: 'LinkedIn', external: true },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/refund', label: 'Refund policy' },
    ],
  },
];

export default function UsFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/us" aria-label="MECE home" className="-ml-4 inline-flex rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Logo isLanding full className="!h-[64px]" />
            </Link>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Case interview and market sizing practice with an interviewer that asks follow-ups and scores your thinking.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.external ? (
                        <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-[14px] text-foreground/80 transition-colors hover:text-primary">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="text-[14px] text-foreground/80 transition-colors hover:text-primary">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} MECE Prep. MECE is independent and not affiliated with any consulting firm.</p>
          <p>
            Photography via{' '}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              Unsplash
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

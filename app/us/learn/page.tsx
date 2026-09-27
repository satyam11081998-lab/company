import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import UsHeader from '@/components/us/marketing/us-header';
import UsFooter from '@/components/us/marketing/us-footer';
import StartButton from '@/components/us/marketing/start-button';
import { FinalCta } from '@/components/us/marketing/sections';
import { Eyebrow, US_CARD, usButton } from '@/components/us/ui';
import HubHeroVisual from '@/components/us-learn/hub-hero-visual';
import { LEARN_CLUSTERS, pagesInCluster, learnPath, readMinutes } from '@/lib/us-learn';
import { US_ENTITY_LINE, jsonLdString, learnHubJsonLd, learnHubMetadata } from '@/lib/us-learn/seo';

/**
 * US Learn hub — /us/learn. Static. The one page that links to every guide,
 * grouped into three clusters (foundations, case frameworks, role guides), so
 * crawlers and readers can reach the whole library in one hop.
 */
export const dynamic = 'force-static';

export const metadata: Metadata = learnHubMetadata();

const HUB_FAQS = [
  {
    q: 'Are the MECE Learn guides free?',
    a: 'Yes. Every guide is free to read without an account. Practicing with the AI interviewer is free for the daily case and the daily market sizing question. Lite adds extra cases every day, and Pro opens the full US case bank.',
  },
  {
    q: 'Who are these guides for?',
    a: 'Anyone who has to work through a business problem out loud: consulting candidates, product managers, sales and marketing managers, HR and people leaders, strategy and operations hires, finance roles, and managers who want sharper structured thinking.',
  },
  {
    q: 'Is MECE the same as the MECE principle?',
    a: 'The principle, Mutually Exclusive, Collectively Exhaustive, is a rule for structuring problems named by Barbara Minto at McKinsey. MECE (mece.in) is a practice platform named after it, and is not affiliated with McKinsey or any other consulting firm.',
  },
  {
    q: 'How should I use these guides to prepare for interviews?',
    a: 'Read the foundations first, then the framework or role guide that matches your interview, and practice a live case after each one. Solving out loud with feedback builds the skill; reading alone does not.',
  },
];

export default function LearnHubPage() {
  return (
    <div className="min-h-screen bg-background">
      {learnHubJsonLd(HUB_FAQS).map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(j) }} />
      ))}
      <UsHeader />

      <main id="main">
        <section className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-8 px-4 pb-6 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-12 lg:pt-16">
          <div className="min-w-0">
            <Eyebrow>MECE Learn</Eyebrow>
            <h1 className="mt-5 max-w-3xl font-display text-[38px] leading-[1.06] tracking-[-0.015em] text-foreground sm:text-[54px]">
              Learn to solve business problems<span className="text-primary">.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              Free guides to the thinking behind case interviews and business decisions: MECE structure, the case interview, market sizing
              and the core frameworks, plus how product, sales, marketing, HR, operations and finance interviews use cases. Every guide ends
              in a live practice case.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <StartButton />
              <Link href={learnPath('what-is-mece')} className={usButton('secondary', 'lg')}>
                Start with MECE
              </Link>
            </div>
            <nav aria-label="Sections" className="mt-10 flex flex-wrap gap-2">
              {LEARN_CLUSTERS.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {c.title} ({pagesInCluster(c.id).length})
                </a>
              ))}
            </nav>
          </div>
          {/* Decorative, CSS-only motion; hidden on phones to keep the first screen short. */}
          <div className="hidden sm:block">
            <HubHeroVisual />
          </div>
        </section>

        {LEARN_CLUSTERS.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className="mx-auto w-full max-w-[1160px] scroll-mt-24 px-4 py-10 sm:px-6">
            <div className="max-w-2xl">
              <h2 id={`${c.id}-h`} className="font-display text-[30px] leading-tight text-foreground sm:text-[36px]">
                {c.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{c.blurb}</p>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pagesInCluster(c.id).map((p) => (
                <li key={p.slug}>
                  <Link href={learnPath(p.slug)} className={`${US_CARD} group flex h-full flex-col p-5 transition-colors hover:border-border-strong`}>
                    <span className="text-[17px] font-semibold leading-snug text-foreground group-hover:text-primary">{p.title}</span>
                    <span className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-muted-foreground">{p.answer}</span>
                    <span className="mt-auto flex items-center justify-between pt-4 text-[13px]">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock aria-hidden className="h-3.5 w-3.5" /> {readMinutes(p)} min read
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        Read <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="hub-faq-h" className="mx-auto w-full max-w-[1160px] px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>Questions</Eyebrow>
              <h2 id="hub-faq-h" className="mt-5 font-display text-[30px] leading-tight text-foreground sm:text-[36px]">
                About MECE Learn
              </h2>
            </div>
            <div className={`${US_CARD} divide-y divide-border/70 px-6 lg:col-span-8`}>
              {HUB_FAQS.map((f) => (
                <div key={f.q} className="py-5">
                  <h3 className="text-[16px] font-semibold text-foreground">{f.q}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{US_ENTITY_LINE}</p>
        </section>
      </main>

      <FinalCta />
      <UsFooter />
    </div>
  );
}

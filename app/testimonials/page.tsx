import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/logo';
import Footer from '@/components/footer';
import { createClient } from '@/lib/supabase/server';
import { getPublishedTestimonials } from '@/lib/testimonials';
import { getPublishedEndorsements } from '@/lib/endorsements';
import { Quote, BadgeCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stories from MECE users',
  description:
    'What MBA and PGDM aspirants say about preparing with MECE: case practice, guesstimates, GD briefs, and brutally honest 6-dimension scoring.',
  alternates: { canonical: '/testimonials' },
};

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default async function TestimonialsWallPage() {
  const supabase = createClient();
  const [testimonials, endorsements] = await Promise.all([
    getPublishedTestimonials(supabase),
    getPublishedEndorsements(supabase),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/"><Logo full variant="dark" /></Link>
          <Link href="/signup" className="rounded-lg bg-primary px-4 py-2 text-small font-semibold text-primary-foreground hover:bg-primary/90">
            Start free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-micro font-semibold uppercase tracking-widest text-primary">Stories</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">What aspirants say about MECE</h1>
          <p className="mx-auto mt-3 max-w-2xl text-body text-muted-foreground">
            Real experiences from MBA and PGDM students using MECE for cases, guesstimates, GD briefs, and honest scoring.
          </p>
        </div>

        {endorsements.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 text-h2 text-foreground">Endorsements</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {endorsements.map((e) => (
                <article key={e.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <Quote className="mb-3 h-6 w-6 text-primary/25" aria-hidden="true" />
                  <blockquote className="flex-1 text-body font-light italic leading-relaxed text-foreground">&ldquo;{e.quote}&rdquo;</blockquote>
                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-small font-semibold text-foreground">{e.name}</p>
                        {e.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                        {e.linkedin_url && (
                          <a href={e.linkedin_url} target="_blank" rel="noreferrer" className="shrink-0 text-[#0A66C2]" title="LinkedIn">
                            <LinkedInLogo className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="truncate text-micro text-primary">{[e.role, e.organization].filter(Boolean).join(' · ')}</p>
                      {e.credential && <p className="truncate text-micro text-muted-foreground">{e.credential}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-5 text-h2 text-foreground">From students</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Quote className="mb-3 h-6 w-6 text-primary/25" aria-hidden="true" />
                <blockquote className="flex-1 text-body font-light italic leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-small font-semibold text-foreground">{t.name}</p>
                      {t.linkedin_url && (
                        <a href={t.linkedin_url} target="_blank" rel="noreferrer" className="shrink-0 text-[#0A66C2]" title="LinkedIn">
                          <LinkedInLogo className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {t.school && <p className="truncate text-micro text-muted-foreground">{t.school}</p>}
                    {t.placement && <p className="truncate text-micro text-primary">{t.placement}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-h2 text-foreground">Used MECE in your prep?</h2>
          <p className="mx-auto mt-2 max-w-xl text-body text-muted-foreground">
            We would love to feature your story. Share a few honest lines about what helped.
          </p>
          <Link href="/signup" className="mt-5 inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-small font-semibold text-primary-foreground hover:bg-primary/90">
            Get started free
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

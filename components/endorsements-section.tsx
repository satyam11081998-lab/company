'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, BadgeCheck } from 'lucide-react';
import type { Endorsement } from '@/lib/endorsements';

/**
 * Endorsements — a SMALL, curated set of credibility-first social proof from
 * named authorities (placed seniors, mentors, toppers), distinct from peer
 * testimonials. Self-contained: it renders its own section, and renders NOTHING
 * when there are no published endorsements (so the page is never padded with
 * empty/bogus social proof). Display is capped so it stays a curated set, not a
 * dump.
 */
const MAX_SHOWN = 6;

export default function EndorsementsSection() {
  const [items, setItems] = useState<Endorsement[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/endorsements')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setItems((d?.items as Endorsement[] | undefined) ?? []);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Nothing published yet → render nothing at all.
  if (!items || items.length === 0) return null;

  const shown = items.slice(0, MAX_SHOWN);

  return (
    <section className="border-t border-border bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-micro font-semibold uppercase tracking-[0.18em] text-primary">Endorsed by</p>
          <h2 className="mt-2 text-h2 text-foreground">People who&apos;ve been through placements — vouching for the method.</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 justify-center">
          {shown.map((e) => (
            <article
              key={e.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <Quote className="mb-3 h-7 w-7 shrink-0 text-primary/25" aria-hidden="true" />
              <blockquote className="flex-1 text-body font-light italic leading-relaxed text-foreground">
                &ldquo;{e.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/80 shadow-sm">
                  {e.avatar_url && <AvatarImage src={e.avatar_url} alt={e.name} className="object-cover" />}
                  <AvatarFallback className="bg-navy text-base font-semibold text-navy-foreground">
                    {e.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-small font-semibold text-foreground">{e.name}</p>
                    {e.verified && (
                      <span title="Verified endorser" className="inline-flex shrink-0 items-center text-primary">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                    )}
                    {e.linkedin_url && (
                      <a
                        href={e.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 transition-opacity hover:opacity-80"
                        title="View LinkedIn profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="#0A66C2">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="truncate text-micro text-primary">
                    {[e.role, e.organization].filter(Boolean).join(' · ')}
                  </p>
                  {e.credential && <p className="truncate text-micro text-muted-foreground mt-0.5">{e.credential}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

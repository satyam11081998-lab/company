'use client';

/**
 * EndorsementWall — two on-brand social-proof blocks, in order:
 *   1) Endorsements — a focused, prominent set of mentor/authority vouches (static grid).
 *   2) Testimonials — an auto-sliding rail of peer aspirant reviews (pauses on hover,
 *      hovered card lifts + grows, prev/next arrows + crimson progress bar).
 *
 * Data is the SAME DB-backed source as the rest of the site (published endorsements +
 * testimonials). Each block renders NOTHING when its list is empty — the page is never
 * padded with bogus social proof, and no quote is ever invented.
 */

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Endorsement } from '@/lib/endorsements';
import type { Testimonial } from '@/lib/testimonials';

type WallNode = {
  id: string;
  type: 'endorsement' | 'testimonial';
  name: string;
  line1: string;
  line2: string;
  quote: string;
  avatar_url: string | null;
  linkedin_url?: string;
  verified: boolean;
};

const SPEED = 0.7;  // px per frame
const REPS = 4;     // copies of the list for a seamless, always-overflowing loop

function initials(n: string) {
  return n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function toNodes(endorsements: Endorsement[], testimonials: Testimonial[]): WallNode[] {
  const e: WallNode[] = endorsements.map((x) => ({
    id: `e-${x.id}`,
    type: 'endorsement',
    name: x.name,
    line1: [x.role, x.organization].filter(Boolean).join(' · '),
    line2: x.credential ?? '',
    quote: x.quote ?? '',
    avatar_url: x.avatar_url,
    linkedin_url: x.linkedin_url,
    verified: !!x.verified,
  }));
  const t: WallNode[] = testimonials.map((x) => ({
    id: `t-${x.id}`,
    type: 'testimonial',
    name: x.name,
    line1: x.school ?? '',
    line2: x.placement ?? '',
    quote: x.quote ?? '',
    avatar_url: x.avatar_url,
    linkedin_url: x.linkedin_url,
    verified: false,
  }));
  return [...e, ...t];
}

const css = `
.ew-track { scrollbar-width: none; -ms-overflow-style: none; }
.ew-track::-webkit-scrollbar { display: none; }
.ew-card { transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease, border-color .28s ease; }
.ew-card:hover { transform: translateY(-8px) scale(1.035);
  box-shadow: 0 22px 48px rgba(15,28,51,.18), 0 2px 8px rgba(15,28,51,.08);
  border-color: hsl(var(--primary) / .35); }
.ew-end { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
.ew-end:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(15,28,51,.16);
  border-color: hsl(var(--primary) / .3); }
@media (prefers-reduced-motion: reduce) {
  .ew-card, .ew-end { transition: box-shadow .2s; }
  .ew-card:hover, .ew-end:hover { transform: none; }
}
`;

export default function EndorsementWall({
  endorsements,
  testimonials,
}: {
  endorsements?: Endorsement[];
  testimonials?: Testimonial[];
}) {
  const [items, setItems] = useState<WallNode[] | null>(
    endorsements || testimonials ? toNodes(endorsements ?? [], testimonials ?? []) : null,
  );

  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const pausedRef = useRef(false);
  const manualUntilRef = useRef(0);
  const posRef = useRef(0); // float scroll accumulator (scrollLeft rounds, so we track our own)

  useEffect(() => {
    if (endorsements || testimonials) return;
    let alive = true;
    Promise.all([
      fetch('/api/endorsements').then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
      fetch('/api/testimonials').then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
    ]).then(([e, t]) => {
      if (alive) setItems(toNodes((e?.items as Endorsement[]) ?? [], (t?.items as Testimonial[]) ?? []));
    });
    return () => {
      alive = false;
    };
  }, [endorsements, testimonials]);

  useEffect(() => {
    if (!items) return;
    if (items.filter((n) => n.type === 'testimonial').length === 0) return;
    let raf = 0;
    const step = () => {
      const el = trackRef.current;
      if (el) {
        const one = el.scrollWidth / REPS; // width of a single copy of the list
        if (one > 0) {
          if (!pausedRef.current && Date.now() > manualUntilRef.current) posRef.current += SPEED;
          if (posRef.current >= one) posRef.current -= one;
          else if (posRef.current < 0) posRef.current += one;
          el.scrollLeft = posRef.current;
          if (barRef.current) barRef.current.style.width = `${Math.max(14, (posRef.current / one) * 100)}%`;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    manualUntilRef.current = Date.now() + 1500;
    const one = el.scrollWidth / REPS || 1;
    posRef.current = (((posRef.current + dir * 360) % one) + one) % one;
  };

  if (items === null) return null;

  const endos = items.filter((n) => n.type === 'endorsement');
  const testis = items.filter((n) => n.type === 'testimonial');
  if (endos.length === 0 && testis.length === 0) return null;

  const loop = Array.from({ length: REPS }).flatMap(() => testis);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── 1. Endorsements — focused authority vouches ─────────────────── */}
      {endos.length > 0 && (
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="badge-pill badge-pill-red">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                Endorsed by mentors
              </span>
              <h2 className="mt-4 text-h2 text-foreground">Backed by people who&apos;ve cracked it</h2>
              <p className="mt-3 text-body text-muted-foreground">
                Senior consultants, managers and toppers who have been through placements — vouching for the method.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {endos.map((n) => {
                const clickable = !!n.linkedin_url;
                return (
                  <article
                    key={n.id}
                    onClick={() => clickable && window.open(n.linkedin_url!, '_blank', 'noopener')}
                    className={`ew-end relative flex w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-[0_4px_24px_rgba(15,28,51,.08),0_1px_4px_rgba(15,28,51,.06)] ${
                      clickable ? 'cursor-pointer' : ''
                    }`}
                  >
                    <span className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-micro font-semibold uppercase tracking-wider text-navy-foreground">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified mentor
                      </span>
                      <Quote className="h-8 w-8 shrink-0 text-primary/20" aria-hidden="true" />
                    </div>
                    <blockquote className="mt-4 flex-1 text-body font-light italic leading-relaxed text-foreground">
                      &ldquo;{n.quote}&rdquo;
                    </blockquote>
                    <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-base font-semibold text-white ring-2 ring-primary/70"
                        style={{
                          backgroundImage: n.avatar_url ? `url('${n.avatar_url}')` : undefined,
                          background: n.avatar_url ? undefined : 'hsl(var(--navy))',
                        }}
                      >
                        {!n.avatar_url && initials(n.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-small font-semibold text-foreground">{n.name}</p>
                          {n.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                          {n.linkedin_url && (
                            <a
                              href={n.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(ev) => ev.stopPropagation()}
                              className="shrink-0 text-[#0A66C2] transition-opacity hover:opacity-70"
                              title="LinkedIn"
                            >
                              <LinkedInLogo className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {n.line1 && <p className="truncate text-micro text-primary">{n.line1}</p>}
                        {n.line2 && <p className="truncate text-micro text-muted-foreground">{n.line2}</p>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Testimonials — sliding peer rail ─────────────────────────── */}
      {testis.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[320px_1fr]">
            <div className="lg:pr-4">
              <span className="badge-pill">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-navy" />
                From aspirants
              </span>
              <h2 className="mt-4 text-h2 text-foreground">What students say after using MECE</h2>
              <p className="mt-3 text-body text-muted-foreground">
                Real voices from IIM, IIT-DMS, XIMB and beyond. The rail slides on its own; hover to
                pause, click any card to open their LinkedIn.
              </p>
              <div className="mt-7 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => nudge(-1)}
                  aria-label="Previous"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:border-navy hover:bg-navy hover:text-navy-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <span ref={barRef} className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: '14%' }} />
                </div>
                <button
                  type="button"
                  onClick={() => nudge(1)}
                  aria-label="Next"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:border-navy hover:bg-navy hover:text-navy-foreground"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative -mx-6 lg:mx-0">
              <div
                ref={trackRef}
                className="ew-track flex gap-6 overflow-x-auto px-6 py-8 lg:px-4"
                onMouseEnter={() => (pausedRef.current = true)}
                onMouseLeave={() => (pausedRef.current = false)}
                onTouchStart={() => (pausedRef.current = true)}
                onTouchEnd={() => {
                  manualUntilRef.current = Date.now() + 1500;
                  pausedRef.current = false;
                }}
              >
                {loop.map((n, i) => {
                  const clickable = !!n.linkedin_url;
                  return (
                    <article
                      key={`${n.id}-${i}`}
                      onClick={() => clickable && window.open(n.linkedin_url!, '_blank', 'noopener')}
                      className={`ew-card group relative flex min-h-[268px] w-[316px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_4px_24px_rgba(15,28,51,.08),0_1px_4px_rgba(15,28,51,.06)] ${
                        clickable ? 'cursor-pointer' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="badge-pill text-micro">Aspirant</span>
                        <Quote className="h-7 w-7 shrink-0 text-navy/15" aria-hidden="true" />
                      </div>
                      <blockquote className="mt-4 flex-1 text-body font-light italic leading-relaxed text-foreground line-clamp-5">
                        &ldquo;{n.quote}&rdquo;
                      </blockquote>
                      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-small font-semibold text-white ring-2 ring-border"
                          style={{
                            backgroundImage: n.avatar_url ? `url('${n.avatar_url}')` : undefined,
                            background: n.avatar_url ? undefined : 'hsl(var(--navy))',
                          }}
                        >
                          {!n.avatar_url && initials(n.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-small font-semibold text-foreground">{n.name}</p>
                            {n.linkedin_url && (
                              <a
                                href={n.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(ev) => ev.stopPropagation()}
                                className="shrink-0 text-[#0A66C2] transition-opacity hover:opacity-70"
                                title="LinkedIn"
                              >
                                <LinkedInLogo className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {n.line1 && <p className="truncate text-micro text-primary">{n.line1}</p>}
                          {n.line2 && <p className="truncate text-micro text-muted-foreground">{n.line2}</p>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

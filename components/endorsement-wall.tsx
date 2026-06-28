'use client';

/**
 * EndorsementWall — two on-brand social-proof blocks:
 *   1) Endorsements — focused mentor/authority vouches (static grid).
 *   2) Testimonials — a JS translateX marquee that slides continuously, pauses on hover,
 *      hovered card lifts + grows, with working prev/next arrows.
 *
 * Cards follow the site card pattern (rounded-2xl border bg-card shadow-sm, shadcn Avatar).
 * Prefer passing data as props (server-rendered → no layout shift). Renders nothing if empty.
 */

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const SPEED = 0.7;      // px per frame (auto-slide)
const STEP = 336;       // px per arrow click (card 316 + gap 20)

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
    id: `e-${x.id}`, type: 'endorsement', name: x.name,
    line1: [x.role, x.organization].filter(Boolean).join(' · '), line2: x.credential ?? '',
    quote: x.quote ?? '', avatar_url: x.avatar_url, linkedin_url: x.linkedin_url, verified: !!x.verified,
  }));
  const t: WallNode[] = testimonials.map((x) => ({
    id: `t-${x.id}`, type: 'testimonial', name: x.name,
    line1: x.school ?? '', line2: x.placement ?? '',
    quote: x.quote ?? '', avatar_url: x.avatar_url, linkedin_url: x.linkedin_url, verified: false,
  }));
  return [...e, ...t];
}

const css = `
.ew-track { overflow: hidden; }
.ew-marquee { display: flex; width: max-content; will-change: transform; }
.ew-card { transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease, border-color .28s ease; }
.ew-card:hover { transform: translateY(-8px) scale(1.04);
  box-shadow: 0 22px 48px rgba(15,28,51,.18), 0 2px 8px rgba(15,28,51,.08);
  border-color: hsl(var(--primary) / .35); z-index: 2; }
.ew-end { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
.ew-end:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(15,28,51,.16);
  border-color: hsl(var(--primary) / .3); }
@media (prefers-reduced-motion: reduce) {
  .ew-card, .ew-end { transition: box-shadow .2s; }
  .ew-card:hover, .ew-end:hover { transform: none; }
}
`;

function PersonAvatar({ n, size, text }: { n: WallNode; size: string; text: string }) {
  return (
    <Avatar className={`${size} shrink-0 border-2 ${n.type === 'endorsement' ? 'border-primary/80' : 'border-border'} shadow-sm`}>
      {n.avatar_url && <AvatarImage src={n.avatar_url} alt={n.name} className="object-cover" />}
      <AvatarFallback className={`bg-navy font-semibold text-navy-foreground ${text}`}>{initials(n.name)}</AvatarFallback>
    </Avatar>
  );
}

function AspirantCard({ n }: { n: WallNode }) {
  const clickable = !!n.linkedin_url;
  return (
    <article
      onClick={() => clickable && window.open(n.linkedin_url!, '_blank', 'noopener')}
      className={`ew-card relative mr-5 flex min-h-[268px] w-[316px] shrink-0 flex-col rounded-2xl border border-border bg-card p-6 shadow-sm ${
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
        <PersonAvatar n={n} size="h-[55px] w-[55px]" text="text-sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-small font-semibold text-foreground">{n.name}</p>
            {n.linkedin_url && (
              <a href={n.linkedin_url} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()}
                className="shrink-0 text-[#0A66C2] transition-opacity hover:opacity-70" title="LinkedIn">
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
}

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
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (endorsements || testimonials) return;
    let alive = true;
    Promise.all([
      fetch('/api/endorsements').then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
      fetch('/api/testimonials').then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
    ]).then(([e, t]) => {
      if (alive) setItems(toNodes((e?.items as Endorsement[]) ?? [], (t?.items as Testimonial[]) ?? []));
    });
    return () => { alive = false; };
  }, [endorsements, testimonials]);

  useEffect(() => {
    if (!items || items.filter((n) => n.type === 'testimonial').length === 0) return;
    let raf = 0;
    const step = () => {
      const el = trackRef.current;
      if (el) {
        const one = el.scrollWidth / 2; // one copy of the duplicated list
        if (one > 0) {
          if (!pausedRef.current) offsetRef.current += SPEED;
          const m = ((offsetRef.current % one) + one) % one;
          el.style.transform = `translateX(${-m}px)`;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const nudge = (dir: 1 | -1) => { offsetRef.current += dir * STEP; };

  if (items === null) return null;
  const endos = items.filter((n) => n.type === 'endorsement');
  const testis = items.filter((n) => n.type === 'testimonial');
  if (endos.length === 0 && testis.length === 0) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── 1. Endorsements — focused authority vouches ─────────────────── */}
      {endos.length > 0 && (
        <section className="border-y border-border bg-secondary py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="badge-pill badge-pill-red">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                Endorsed by mentors
              </span>
              <h2 className="mt-4 text-h2 text-foreground">Backed by people who&apos;ve cracked it</h2>
              <p className="mt-3 text-body text-muted-foreground">
                Senior consultants, managers and toppers who have been through placements, vouching for the method.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {endos.map((n) => {
                const clickable = !!n.linkedin_url;
                return (
                  <article
                    key={n.id}
                    onClick={() => clickable && window.open(n.linkedin_url!, '_blank', 'noopener')}
                    className={`ew-end flex w-full max-w-[360px] flex-col rounded-2xl border border-border bg-card p-7 shadow-sm ${
                      clickable ? 'cursor-pointer' : ''
                    }`}
                  >
                    <Quote className="h-9 w-9 text-primary/20" aria-hidden="true" />
                    <blockquote className="mt-3 flex-1 text-body font-light italic leading-relaxed text-foreground">
                      &ldquo;{n.quote}&rdquo;
                    </blockquote>
                    <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                      <PersonAvatar n={n} size="h-[70px] w-[70px]" text="text-lg" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-small font-semibold text-foreground">{n.name}</p>
                          {n.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                          {n.linkedin_url && (
                            <a href={n.linkedin_url} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()}
                              className="shrink-0 text-[#0A66C2] transition-opacity hover:opacity-70" title="LinkedIn">
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

      {/* ── 2. Testimonials — sliding marquee + arrows ──────────────────── */}
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
                Real voices from IIM, IIT-DMS, XIMB and beyond. The rail slides on its own, hover to
                pause, and click any card to open their LinkedIn.
              </p>
              <div className="mt-7 flex items-center gap-3">
                <button type="button" onClick={() => nudge(-1)} aria-label="Previous"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:border-navy hover:bg-navy hover:text-navy-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => nudge(1)} aria-label="Next"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:border-navy hover:bg-navy hover:text-navy-foreground">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className="ew-track relative -mx-6 py-8 lg:mx-0"
              onMouseEnter={() => (pausedRef.current = true)}
              onMouseLeave={() => (pausedRef.current = false)}
              onTouchStart={() => (pausedRef.current = true)}
              onTouchEnd={() => (pausedRef.current = false)}
            >
              <div ref={trackRef} className="ew-marquee">
                {[...testis, ...testis].map((n, i) => (
                  <AspirantCard key={`${n.id}-${i}`} n={n} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Testimonial } from '@/lib/testimonials';

/**
 * SUCCESS STORIES — real students, real placements, from the `testimonials`
 * table (admin-managed at /admin/testimonials; falls back to the two verified
 * profiles in lib/testimonials.ts). Photos are the ones already stored with
 * each testimonial. Stories with a placement line lead.
 *
 * A native horizontal scroller with snap points: swipe on touch, shift-scroll
 * or the arrow buttons on desktop, arrow keys when focused. No autoplay.
 */

function initials(n: string) {
  return n
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function Avatar({ t }: { t: Testimonial }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-navy ring-2 ring-card sm:h-16 sm:w-16">
      {t.avatar_url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={t.avatar_url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center text-[15px] font-semibold text-white">{initials(t.name)}</span>
      )}
    </span>
  );
}

export default function SuccessStories({ stories }: { stories: Testimonial[] }) {
  const rail = useRef<HTMLUListElement | null>(null);
  const [edge, setEdge] = useState<{ start: boolean; end: boolean }>({ start: true, end: false });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = rail.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  function step(dir: 1 | -1) {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('li');
    const gap = 24;
    const by = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * by, behavior: reduce ? 'auto' : 'smooth' });
  }

  if (!stories.length) return null;

  return (
    <section aria-labelledby="stories-title" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-20 sm:px-6 lg:py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="home-eyebrow">Success stories</p>
            <h2
              id="stories-title"
              className="mt-5 font-editorial text-[38px] font-semibold leading-[1.06] tracking-[-0.02em] text-navy dark:text-white sm:text-[44px]"
            >
              From practice to placement
            </h2>
            <p className="mt-3 font-editorial text-[18px] leading-relaxed text-[#55534C] dark:text-white/70">
              MBA and PGDM students on what changed in their preparation — in their own words.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={edge.start}
              aria-label="Previous stories"
              aria-controls="stories-rail"
              className="grid h-11 w-11 place-items-center rounded-full border border-border-strong/70 bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={edge.end}
              aria-label="Next stories"
              aria-controls="stories-rail"
              className="grid h-11 w-11 place-items-center rounded-full border border-border-strong/70 bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ul
          id="stories-rail"
          ref={rail}
          tabIndex={0}
          aria-label="Success stories"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
          }}
          className="home-rail -ml-4 mr-[calc(50%-50vw)] mt-10 flex scroll-pl-4 gap-6 overflow-x-auto pb-6 pl-4 pr-6 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:-ml-6 sm:scroll-pl-6 sm:pl-6 lg:pr-24"
        >
          {stories.map((t) => (
            <li
              key={t.id}
              className="flex w-[84vw] max-w-[392px] shrink-0 flex-col rounded-[12px] border border-border/90 bg-card p-6 shadow-[0_1px_2px_rgba(15,28,51,0.05),0_14px_34px_-26px_rgba(15,28,51,0.4)] dark:shadow-none sm:w-[380px] sm:p-7 lg:w-[376px] xl:w-[381px]"
            >
              <figure className="flex h-full flex-col">
                <blockquote className="flex flex-1 gap-3">
                  <span aria-hidden className="-mt-2 font-editorial text-[54px] font-semibold leading-none text-[#D7B98E]">
                    &ldquo;
                  </span>
                  <p className="line-clamp-7 font-editorial text-[16.5px] italic leading-[1.55] text-[#3D3B36] dark:text-white/85">
                    {t.quote}
                  </p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <Avatar t={t} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[15.5px] font-semibold text-navy dark:text-white">
                      <span className="truncate">{t.name}</span>
                      {t.linkedin_url && (
                        <a
                          href={t.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${t.name} on LinkedIn`}
                          className="shrink-0 rounded-[3px] text-[#0A66C2] transition-opacity hover:opacity-75"
                        >
                          <LinkedInGlyph className="h-[15px] w-[15px]" />
                        </a>
                      )}
                    </p>
                    {t.placement && <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-primary">{t.placement}</p>}
                    {t.school && <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{t.school}</p>}
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-center sm:justify-start">
          <Link href="/testimonials" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary underline-offset-4 hover:underline">
            Read all stories <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS, type Testimonial } from '@/lib/testimonials';

/**
 * Testimonials. No auto-rotation. Cards are uniform fixed height with the quote
 * clamped and the author pinned to the bottom, so varying quote lengths never
 * distort the row. When there are more than three, the row becomes a snap
 * carousel with a hidden scrollbar, soft edge-fades, and arrow controls.
 *
 * Data: starts from `initialItems` (the verified set, for instant paint), then
 * swaps to the live published list from /api/testimonials.
 */
export default function TestimonialsCarousel({
  initialItems = TESTIMONIALS,
}: {
  initialItems?: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialItems);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/testimonials?type=testimonial')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.items?.length) setItems(d.items as Testimonial[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [items]);

  function scrollByCards(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  const isCarousel = items.length > 3;

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          className={`flex items-stretch gap-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isCarousel ? 'overflow-x-auto snap-x snap-mandatory' : 'justify-center flex-wrap lg:flex-nowrap'
          }`}
        >
          {items.map((t) => (
            <article
              key={t.id}
              data-card
              className="group flex h-[340px] w-full max-w-sm shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:w-[340px]"
            >
              <Quote className="mb-3 h-7 w-7 shrink-0 text-primary/25" aria-hidden="true" />
              <blockquote
                title={t.quote}
                className="line-clamp-6 flex-1 overflow-hidden text-body font-light italic leading-relaxed text-foreground"
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/80 shadow-sm">
                  {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.name} className="object-cover" />}
                  <AvatarFallback className="bg-navy text-base font-semibold text-navy-foreground">
                    {t.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-small font-semibold text-foreground">{t.name}</p>
                    {t.linkedin_url && (
                      <a
                        href={t.linkedin_url}
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
                  <p className="truncate text-micro text-muted-foreground">{t.school}</p>
                  <p className="line-clamp-2 text-micro mt-0.5 leading-snug text-primary">{t.placement}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Soft edge-fades to signal horizontal scroll (carousel only) */}
        {isCarousel && (
          <>
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-200 ${canLeft ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-200 ${canRight ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        )}
      </div>

      {isCarousel && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => scrollByCards(-1)}
            disabled={!canLeft}
            aria-label="Previous testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByCards(1)}
            disabled={!canRight}
            aria-label="Next testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

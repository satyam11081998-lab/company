'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS, type Testimonial } from '@/lib/testimonials';

/**
 * Manual-scroll testimonials. No auto-rotation. Renders all published
 * testimonials in a horizontal scroll-snap strip; users swipe or use the
 * arrows. With only a couple of entries they simply center with no controls.
 *
 * Data: starts from `initialItems` (defaults to the verified two for instant
 * paint), then swaps to the live published list from /api/testimonials.
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
    const step = card ? card.offsetWidth + 32 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  const showControls = items.length > 3;

  return (
    <Card className="relative overflow-hidden p-6 md:p-8">
      <div
        ref={scrollerRef}
        className={`flex items-stretch gap-5 ${
          items.length <= 3 ? 'justify-center flex-wrap lg:flex-nowrap' : 'overflow-x-auto snap-x snap-mandatory'
        } scrollbar-thin pb-2`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            data-card
            className="flex h-full w-full max-w-sm shrink-0 snap-center flex-col rounded-xl border border-border bg-card p-6 text-left shadow-sm md:w-[320px]"
          >
            <Quote className="mb-3 h-6 w-6 shrink-0 text-primary/30" aria-hidden="true" />
            <blockquote className="text-body flex-1 font-light italic leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <Avatar className="h-14 w-14 shrink-0 border-2 border-primary shadow-sm">
                {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.name} className="object-cover" />}
                <AvatarFallback className="bg-navy text-lg font-semibold text-navy-foreground">
                  {t.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-small font-semibold text-foreground">{t.name}</p>
                  {t.linkedin_url && (
                    <a href={t.linkedin_url} target="_blank" rel="noreferrer" className="shrink-0 transition-opacity hover:opacity-80" title="View LinkedIn Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                </div>
                <p className="truncate text-micro text-muted-foreground">{t.school}</p>
                <p className="text-micro mt-0.5 leading-snug text-primary line-clamp-2">{t.placement}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showControls && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => scrollByCards(-1)}
            disabled={!canLeft}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByCards(1)}
            disabled={!canRight}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </Card>
  );
}

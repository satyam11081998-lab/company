'use client';
  
import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Pause, Play } from 'lucide-react';
import { TESTIMONIALS, type Testimonial } from '@/lib/testimonials';

const AUTO_ROTATE_MS = 5000;

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  const t: Testimonial = TESTIMONIALS[index];

  return (
    <Card 
      className="p-8 md:p-10 relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative quote mark — top left */}
      <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/10" aria-hidden="true" />
      
      {/* Quote content */}
      <div className="relative max-w-3xl mx-auto text-center min-h-[200px] flex flex-col justify-center">
        <blockquote className="text-h3 leading-relaxed text-foreground italic font-light px-4 md:px-12">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        {/* Attribution */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-border">
            {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.name} />}
            <AvatarFallback className="bg-navy text-navy-foreground text-sm font-semibold">
              {t.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-body font-semibold text-foreground">{t.name}</p>
            <p className="text-small text-muted-foreground">
              {t.school} · <span className="text-primary">{t.placement}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-border hover:bg-muted-foreground/40'
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>

      {/* Pause indicator (small, bottom right) */}
      <button
        onClick={() => setPaused(!paused)}
        className="absolute bottom-6 right-6 h-6 w-6 flex items-center justify-center rounded-full bg-muted hover:bg-border transition-colors"
        aria-label={paused ? 'Resume' : 'Pause'}
      >
        {paused ? <Play className="h-3 w-3 text-muted-foreground" /> : <Pause className="h-3 w-3 text-muted-foreground" />}
      </button>
    </Card>
  );
}

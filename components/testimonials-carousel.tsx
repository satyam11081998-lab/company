'use client';
  
import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Pause, Play, Linkedin } from 'lucide-react';
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

  // We show 3 at a time, stepping by 3
  const visibleTestimonials: Testimonial[] = [];
  for (let i = 0; i < 3; i++) {
    visibleTestimonials.push(TESTIMONIALS[(index * 3 + i) % total]);
  }

  const numDots = Math.ceil(total / 3);

  return (
    <Card 
      className="p-8 md:p-10 relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/10" aria-hidden="true" />
      
      <div className="relative mx-auto min-h-[250px] flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleTestimonials.map((t, idx) => (
            <div key={`${t.id}-${idx}`} className="flex flex-col text-center">
              <blockquote className="text-body leading-relaxed text-foreground italic font-light mb-6 flex-grow">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-28 w-28 border-4 border-border shadow-sm">
                  {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.name} className="object-cover" />}
                  <AvatarFallback className="bg-navy text-navy-foreground text-xl font-semibold">
                    {t.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-body font-semibold text-foreground">{t.name}</p>
                    {t.linkedin_url && (
                      <a href={t.linkedin_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors" title="View LinkedIn Profile">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-small text-muted-foreground">
                    {t.school}
                  </p>
                  <p className="text-micro text-primary mt-0.5">
                    {t.placement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="mt-10 flex items-center justify-center gap-4 md:gap-2">
        {Array.from({ length: numDots }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="p-3 -m-3 focus:outline-none"
            aria-label={`Show testimonial page ${i + 1}`}
          >
            <div
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-border hover:bg-muted-foreground/40'
              }`}
            />
          </button>
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

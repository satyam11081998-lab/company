/**
 * MECE Insights — the long-form reading experience (/insights and /insights/[slug]).
 *
 * Art direction: an essay magazine (the Aeon model). A black stage carries the picture, a large
 * serif title and the standfirst; the body is a single serif column (~66 characters) with a drop
 * cap, a pull quote, pictures that break wider than the text, a stat strip, a tinted sidebar for
 * MBA aspirants, notes and an author box. Type is Newsreader (SIL OFL, already in the repo for the
 * landing page) for reading and Inter for small UI labels. Pictures are generated with Gemini for
 * each article (services/growth/images.py); posts without one get a typographic cover.
 */

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import type { SeoImage, SeoPage } from '@/lib/seo-pages';
import { ThemeToggle } from './ReadingChrome';

/** Topic colours (an essay-magazine palette: one strong colour per subject). */
export const TOPIC_COLORS: Record<string, string> = {
  Strategy: '#0C776D',
  Marketing: '#B5651D',
  Finance: '#035A6D',
  Operations: '#5B4B8A',
  Technology: '#940B52',
  Economy: '#9D120D',
  Careers: '#2F6B3A',
  Business: '#4A4A4A',
};

export function topicOf(page: Pick<SeoPage, 'content' | 'kind'>): { label: string; color: string } {
  const label = page.content?.topic_label || (page.kind === 'news_case' ? 'Case & GD' : 'Business');
  return { label, color: TOPIC_COLORS[label] || TOPIC_COLORS.Business };
}

export const fmtDate = (iso: string | null | undefined, long = false) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: long ? 'long' : 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
    })
    : '';

export function readingMinutes(words?: number) {
  return Math.max(2, Math.round((words || 0) / 220));
}

/** Text with [1] / [1,3] source markers rendered as small superscript links to the notes. */
export function Cited({ text }: { text: string }): ReactNode {
  // "break even [1]" -> "break even¹": no space before the marker
  const parts = text.replace(/\s+(\[\d+(?:,\s*\d+)*\])/g, '$1').split(/(\[\d+(?:,\s*\d+)*\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const ns = m[1].split(',').map((x) => x.trim());
        return (
          <sup key={i} className="ml-[1px] font-sans text-[0.62em] font-medium not-italic">
            {ns.map((n, j) => (
              <span key={n}>
                {j > 0 && ','}
                <a href={`#note-${n}`} className="text-[color:var(--accent)] no-underline hover:underline" aria-label={`Note ${n}`}>{n}</a>
              </span>
            ))}
          </sup>
        );
      })}
    </>
  );
}

/** A picture generated for the article, with caption and credit. `wide` breaks out of the text column. */
export function Picture({ image, wide = false, priority = false, className = '' }: {
  image: SeoImage; wide?: boolean; priority?: boolean; className?: string;
}) {
  return (
    <figure className={`${wide ? 'relative left-1/2 w-[min(100vw,1040px)] -translate-x-1/2 px-0 sm:px-6' : ''} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt || ''}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="block h-auto w-full bg-neutral-200 object-cover dark:bg-neutral-800"
      />
      {(image.caption || image.credit) && (
        <figcaption className="mx-auto mt-3 max-w-[680px] px-4 font-sans text-[0.8rem] leading-relaxed text-neutral-500 sm:px-0 dark:text-neutral-400">
          {image.caption}
          {image.caption && image.credit ? ' ' : ''}
          {image.credit && <span className="text-neutral-400 dark:text-neutral-500">{image.credit}.</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** The cover for a post without a picture: the topic colour, a field of fine rules and the MECE mark. */
export function TypeCover({ color, className = '' }: { color: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: color,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 14px)',
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/10 to-black/40" />
      <svg viewBox="50 47 49 32" className="absolute -right-[6%] bottom-[-4%] h-[72%] w-auto">
        <polygon points="63.38,77.00 80.00,49.00 96.63,77.00" fill="white" fillOpacity="0.13" />
        <polygon points="52.00,77.00 66.88,56.88 81.75,77.00" fill="white" fillOpacity="0.2" />
      </svg>
      <span className="absolute bottom-4 left-5 font-editorial text-[1.05rem] italic text-white/85">MECE Insights</span>
    </div>
  );
}

export function TopicLabel({ label, color, onDark = false }: { label: string; color: string; onDark?: boolean }) {
  return (
    <span
      className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--tl)] dark:text-[color:var(--tl-lift)]"
      style={{ ['--tl' as string]: onDark ? lighten(color) : color, ['--tl-lift' as string]: lighten(color) } as CSSProperties}
    >
      {label}
    </span>
  );
}

/** A topic colour lifted for use on the black stage and in dark mode. */
export function lighten(hex: string, amount = 0.45) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Sets --accent (the topic colour) on a page root. Pair with ACCENT_DARK on the same element so
 * dark mode swaps in the lifted colour (the deep topic colours are too dark to read on black).
 */
export function accentStyle(color: string): CSSProperties {
  return { ['--accent-base' as string]: color, ['--accent-lift' as string]: lighten(color, 0.42) } as CSSProperties;
}
// --accent itself comes from classes (an inline --accent would beat the dark: class).
export const ACCENT_DARK = '[--accent:var(--accent-base)] dark:[--accent:var(--accent-lift)]';

/** Page shell colours: warm paper by day, near-black by night. Opaque so the site pattern stays behind. */
export const PAPER =
  'relative z-10 min-h-screen overflow-x-clip bg-[#fdfcf9] text-[#1b1b19] dark:bg-[#111112] dark:text-[#e7e3db] ' +
  'selection:bg-[color:var(--accent)] selection:text-white';

/** Small sans label above a block ("In brief", "By the numbers"). */
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] ${className}`}>
      {children}
    </p>
  );
}

/** The thin bar above every Insights page: the MECE mark, the section name, theme and practice. */
export function InsightsBar({ onDark = false }: { onDark?: boolean }) {
  const ink = onDark ? 'text-white' : 'text-[#0F1C33] dark:text-white';
  const quiet = onDark ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white';
  return (
    <div className={onDark ? 'border-b border-white/10' : 'border-b border-black/10 dark:border-white/10'}>
      <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-6" aria-label="Insights">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href="/" className={`inline-flex items-center gap-2 ${ink}`} aria-label="MECE home">
            <svg viewBox="50 47 49 32" aria-hidden className="h-[18px] w-auto shrink-0">
              <polygon points="63.38,77.00 80.00,49.00 96.63,77.00" fill="#C8102E" />
              <polygon points="52.00,77.00 66.88,56.88 81.75,77.00" className={onDark ? 'fill-white' : 'fill-[#0F1C33] dark:fill-white'} />
            </svg>
            <span className="font-sans text-[18px] font-extrabold leading-none tracking-[0.01em]">MECE</span>
          </Link>
          <span aria-hidden className={onDark ? 'h-5 w-px bg-white/20' : 'h-5 w-px bg-black/15 dark:bg-white/20'} />
          <Link href="/insights" className={`font-editorial text-[1.15rem] font-medium italic leading-none ${ink}`}>
            Insights
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/learn/mece-framework" className={`hidden font-sans text-[0.8rem] font-medium sm:inline ${quiet}`}>
            The MECE method
          </Link>
          <ThemeToggle className={quiet} />
          <Link
            href="/practice"
            className={`rounded-full px-3.5 py-1.5 font-sans text-[0.8rem] font-semibold transition-opacity hover:opacity-85 ${
              onDark ? 'bg-white text-black' : 'bg-[#0F1C33] text-white dark:bg-white dark:text-black'}`}
          >
            Practise free
          </Link>
        </div>
      </nav>
    </div>
  );
}

export function InsightsFooter() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-8 font-sans text-[0.8rem] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-neutral-400">
        <p>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">MECE Insights</span>
          {' · '}a business story a day, sourced and explained, for MBA students and aspirants.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/insights" className="hover:text-neutral-900 dark:hover:text-white">All essays</Link>
          <Link href="/learn/casebook/getting-started/what-it-tests" className="hover:text-neutral-900 dark:hover:text-white">Free casebook</Link>
          <Link href="/methodology" className="hover:text-neutral-900 dark:hover:text-white">How we score</Link>
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white">mece.in</Link>
        </p>
      </div>
    </footer>
  );
}

/** A card for the index and "More from MECE Insights". */
export function InsightCard({ page, size = 'md' }: { page: SeoPage; size?: 'lg' | 'md' }) {
  const t = topicOf(page);
  const hero = page.content?.hero;
  const lg = size === 'lg';
  return (
    <Link href={`/insights/${page.slug}`} className={`group block ${lg ? 'md:grid md:grid-cols-12 md:items-center md:gap-10' : ''}`}>
      <div className={`${lg ? 'md:col-span-7' : ''} overflow-hidden`}>
        {hero?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt={hero.alt || ''}
            loading={lg ? 'eager' : 'lazy'}
            className={`block w-full bg-neutral-200 object-cover transition-transform duration-500 group-hover:scale-[1.02] dark:bg-neutral-800 ${lg ? 'aspect-[16/10]' : 'aspect-[3/2]'}`}
          />
        ) : (
          <TypeCover color={t.color}
            className={`w-full transition-transform duration-500 group-hover:scale-[1.02] ${lg ? 'aspect-[16/10]' : 'aspect-[3/2]'}`} />
        )}
      </div>
      <div className={lg ? 'mt-5 md:col-span-5 md:mt-0' : 'mt-4'}>
        <TopicLabel label={t.label} color={t.color} />
        <h3 className={`mt-2 font-editorial font-semibold leading-[1.12] tracking-[-0.01em] text-neutral-900 decoration-1 underline-offset-4 group-hover:underline dark:text-neutral-100 ${lg ? 'text-[2rem] sm:text-[2.6rem]' : 'text-[1.4rem]'}`}>
          {page.title}
        </h3>
        {page.dek && (
          <p className={`mt-2 font-editorial text-neutral-600 dark:text-neutral-400 ${lg ? 'text-[1.2rem] leading-snug' : 'line-clamp-3 text-[1.02rem] leading-snug'}`}>
            {page.dek}
          </p>
        )}
        <p className="mt-3 font-sans text-[0.75rem] uppercase tracking-[0.12em] text-neutral-500">
          {fmtDate(page.published_at ?? page.created_at)}
          {page.content?.words ? ` · ${readingMinutes(page.content.words)} min read` : ''}
        </p>
      </div>
    </Link>
  );
}

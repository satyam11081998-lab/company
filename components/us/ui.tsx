import type { ReactNode } from 'react';
import { photoSrcSet, photoUrl, type UsPhoto } from '@/lib/us-market/assets';

/**
 * US design primitives (v2, 2026-09-27). One button system, one pill label,
 * one tinted icon chip, one card surface, one section heading and one photo
 * element — shared by the US marketing pages, the US app shell and the US
 * dashboard. Nothing here is imported by India pages.
 *
 * Shape language: controls 8px, cards 16px, imagery 14–20px. Surfaces are
 * white cards with a hairline border and a soft shadow. No coloured side or
 * top rules on any tile — emphasis comes from tinted chips and type.
 */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverse-outline';
type BtnSize = 'sm' | 'md' | 'lg';

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-semibold transition-[background-color,box-shadow,color] duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50';

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(200,16,46,0.25),0_6px_16px_-8px_rgba(200,16,46,0.55)] hover:bg-primary-hover',
  secondary: 'border border-border bg-card text-foreground shadow-[0_1px_2px_rgba(15,28,51,0.06)] hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  inverse: 'bg-white text-navy hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-navy',
  'inverse-outline': 'border border-white/30 text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-navy',
};

const BTN_SIZE: Record<BtnSize, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export function usButton(variant: BtnVariant = 'primary', size: BtnSize = 'md', extra = ''): string {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${extra}`.trim();
}

/** The one card surface: white, hairline border, soft shadow. */
export const US_CARD =
  'rounded-[16px] border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,28,51,0.04),0_12px_32px_-20px_rgba(15,28,51,0.22)] dark:shadow-none';

/** Small pill label that opens a section ("BUILT FOR AMBITIOUS MINDS"). */
export function Eyebrow({ children, tone = 'red', className = '' }: { children: ReactNode; tone?: 'red' | 'muted' | 'inverse'; className?: string }) {
  const color =
    tone === 'red'
      ? 'bg-primary/[0.07] text-primary ring-primary/15 dark:bg-primary/15'
      : tone === 'inverse'
      ? 'bg-white/10 text-white/85 ring-white/15'
      : 'bg-muted text-muted-foreground ring-border';
  return (
    <p className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${color} ${className}`}>
      {children}
    </p>
  );
}

export type ChipTone = 'red' | 'amber' | 'violet' | 'emerald' | 'sky' | 'navy';

const CHIP_TONE: Record<ChipTone, string> = {
  red: 'bg-rose-50 text-primary ring-rose-100 dark:bg-primary/15 dark:text-rose-300 dark:ring-primary/20',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  navy: 'bg-slate-100 text-navy ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15',
};

const CHIP_SIZE = {
  sm: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-11 w-11 [&>svg]:h-5 [&>svg]:w-5',
  lg: 'h-14 w-14 [&>svg]:h-6 [&>svg]:w-6',
};

/** A soft tinted circle (or rounded square) holding one line icon. */
export function IconChip({
  children,
  tone = 'red',
  size = 'md',
  square = false,
  className = '',
}: {
  children: ReactNode;
  tone?: ChipTone;
  size?: keyof typeof CHIP_SIZE;
  square?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ring-1 ring-inset ${square ? 'rounded-[12px]' : 'rounded-full'} ${CHIP_TONE[tone]} ${CHIP_SIZE[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Section heading: pill, serif display title, optional lead. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
  className = '',
  inverse = false,
  id,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  inverse?: boolean;
  id?: string;
}) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto flex flex-col items-center text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <Eyebrow tone={inverse ? 'inverse' : 'red'}>{eyebrow}</Eyebrow>}
      <Tag
        id={id}
        className={`mt-5 font-display text-[34px] leading-[1.08] tracking-[-0.015em] sm:text-[44px] ${inverse ? 'text-white' : 'text-foreground'}`}
      >
        {title}
      </Tag>
      {lead && (
        <p className={`mt-4 text-[16px] leading-relaxed sm:text-[17px] ${inverse ? 'text-white/70' : 'text-muted-foreground'}`}>{lead}</p>
      )}
    </div>
  );
}

/** A red full stop for serif headlines. */
export function Dot() {
  return <span className="text-primary">.</span>;
}

/**
 * A responsive photo from lib/us-market/assets.ts. Plain <img> (the app runs
 * with images.unoptimized) with a width-descriptor srcset served by the
 * photo CDN, the photo's average colour as the placeholder, and its focal
 * point kept in frame when cropped.
 */
export function UsImage({
  photo,
  sizes,
  widths = [480, 768, 1080, 1440, 1920],
  ratio,
  className = '',
  priority = false,
  alt,
  decorative = false,
}: {
  photo: UsPhoto;
  sizes: string;
  widths?: number[];
  ratio?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
  decorative?: boolean;
}) {
  const fallbackW = widths[Math.min(2, widths.length - 1)];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photo, fallbackW, ratio ? { h: fallbackW / ratio } : {})}
      srcSet={photoSrcSet(photo, widths, ratio)}
      sizes={sizes}
      alt={decorative ? '' : alt ?? photo.alt}
      aria-hidden={decorative || undefined}
      width={photo.width}
      height={photo.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      style={{ backgroundColor: photo.color, objectPosition: photo.focal ?? '50% 50%' }}
      className={`object-cover ${className}`}
    />
  );
}

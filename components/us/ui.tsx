import type { ReactNode } from 'react';
import { photoSrcSet, photoUrl, type UsPhoto } from '@/lib/us-market/assets';

/**
 * US design primitives (2026-09-26). One button system, one eyebrow, one
 * section heading, one photo element — used by the US marketing pages, the US
 * app shell and the US dashboard. Nothing here is imported by India pages.
 *
 * Shape language: controls 8px, modules 10–12px, imagery 14px. Borders over
 * shadows; only floating UI floats.
 */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverse-outline';
type BtnSize = 'sm' | 'md' | 'lg';

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-semibold transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50';

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'border border-border-strong bg-card text-foreground hover:bg-muted',
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

/** Tiny uppercase label that opens a section. Red by default. */
export function Eyebrow({ children, tone = 'red', className = '' }: { children: ReactNode; tone?: 'red' | 'muted' | 'inverse'; className?: string }) {
  const color = tone === 'red' ? 'text-primary' : tone === 'inverse' ? 'text-white/70' : 'text-muted-foreground';
  return (
    <p className={`flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${color} ${className}`}>
      <span aria-hidden className={`h-px w-6 ${tone === 'inverse' ? 'bg-white/50' : 'bg-primary'}`} />
      {children}
    </p>
  );
}

/** Editorial section heading: eyebrow, serif display title, optional lead. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
  className = '',
  inverse = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  inverse?: boolean;
}) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <Eyebrow tone={inverse ? 'inverse' : 'red'} className={center ? 'justify-center' : ''}>{eyebrow}</Eyebrow>}
      <Tag
        className={`mt-4 font-display text-[34px] leading-[1.08] tracking-[-0.015em] sm:text-[42px] ${inverse ? 'text-white' : 'text-foreground'}`}
      >
        {title}
      </Tag>
      {lead && (
        <p className={`mt-4 text-[16px] leading-relaxed sm:text-[17px] ${inverse ? 'text-white/70' : 'text-muted-foreground'}`}>{lead}</p>
      )}
    </div>
  );
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

/** A thin rule with a label, for editorial separations. */
export function RuleLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

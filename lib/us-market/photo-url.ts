/**
 * The photo shape and the two URL helpers, split from ./assets (2026-09-27)
 * so client components (components/us/ui.tsx → UsImage) do not pull the
 * whole photo library and its keyword rules into the browser bundle.
 */

export interface UsPhoto {
  id: string;
  category: 'brand' | 'industry' | 'topic' | 'skyline';
  /** Path on images.unsplash.com (preferred) … */
  path?: string;
  /** … or a full URL for a photo hosted elsewhere. */
  src?: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, e.g. '60% 40%'. Keeps the subject in frame when cropped. */
  focal?: string;
  /** Average colour, painted while the image loads (no white flash). */
  color: string;
  credit: { name: string; url: string };
}

const CDN = 'https://images.unsplash.com/';

/** One sized URL. `w` in CSS pixels × DPR is the caller's job (see srcSet). */
export function photoUrl(photo: UsPhoto, w: number, opts: { h?: number; q?: number } = {}): string {
  if (photo.src) return photo.src;
  const q = opts.q ?? 72;
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(Math.round(w)), q: String(q) });
  if (opts.h) params.set('h', String(Math.round(opts.h)));
  return `${CDN}${photo.path}?${params.toString()}`;
}

/** A width-descriptor srcset. The CDN crops to `ratio` (w/h) when given. */
export function photoSrcSet(photo: UsPhoto, widths: number[], ratio?: number): string | undefined {
  if (photo.src) return undefined;
  return widths
    .map((w) => `${photoUrl(photo, w, ratio ? { h: w / ratio } : {})} ${w}w`)
    .join(', ');
}

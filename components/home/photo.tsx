import { photoSrcSet, photoUrl } from '@/lib/us-market/photo-url';
import type { HomePhoto } from '@/lib/home/photos';

/**
 * A responsive photo from lib/home/photos.ts. Plain <img> (the app runs with
 * images.unoptimized) with a width-descriptor srcset served by the photo CDN,
 * the photo's average colour painted while it loads, and its focal point kept
 * in frame when cropped. Same contract as the US UsImage, kept separate so the
 * India page does not import US components.
 */
export default function HomeImage({
  photo,
  sizes,
  widths = [480, 768, 1080, 1440, 1920],
  ratio,
  className = '',
  style,
  priority = false,
  alt,
  decorative = false,
  quality,
  media,
}: {
  /**
   * Only fetch this photo when the media query matches (e.g. the desktop hero
   * on desktop only). Renders a <picture> whose fallback is a 1px blank, so a
   * copy hidden with display:none at other widths costs no download.
   */
  media?: string;
  photo: HomePhoto;
  sizes: string;
  widths?: number[];
  ratio?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  alt?: string;
  decorative?: boolean;
  quality?: number;
}) {
  const fallbackW = widths[Math.min(2, widths.length - 1)];
  if (media && !photo.src) {
    return (
      <picture>
        <source
          media={media}
          srcSet={widths.map((w) => `${photoUrl(photo, w, { q: quality ?? 72, ...(ratio ? { h: w / ratio } : {}) })} ${w}w`).join(', ')}
          sizes={sizes}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
          alt={decorative ? '' : alt ?? photo.alt}
          aria-hidden={decorative || undefined}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          style={{ backgroundColor: photo.color, objectPosition: photo.focal ?? '50% 50%', ...style }}
          className={className}
        />
      </picture>
    );
  }
  const q = quality ?? 72;
  const srcSet = photo.src
    ? undefined
    : widths.map((w) => `${photoUrl(photo, w, { q, ...(ratio ? { h: w / ratio } : {}) })} ${w}w`).join(', ');
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photo, fallbackW, { q, ...(ratio ? { h: fallbackW / ratio } : {}) })}
      srcSet={srcSet ?? photoSrcSet(photo, widths, ratio)}
      sizes={sizes}
      alt={decorative ? '' : alt ?? photo.alt}
      aria-hidden={decorative || undefined}
      width={photo.width}
      height={photo.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      style={{ backgroundColor: photo.color, objectPosition: photo.focal ?? '50% 50%', ...style }}
      className={className}
    />
  );
}

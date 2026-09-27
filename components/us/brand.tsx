/**
 * The MECE lockup for the US experience: mountain mark + wordmark + the full
 * form, "Method for Evaluating Corporate Excellence".
 *
 * Built in HTML rather than using public/logo-mece-*.svg: at header height
 * the SVG's tagline renders at ~7px. Here the tagline is real text at a size
 * people can read, and the mark follows the theme.
 */
export default function UsLogo({
  tagline = true,
  size = 'md',
  inverse = false,
  taglineOnPhones = false,
  className = '',
}: {
  /** Show the full form beside the wordmark (hidden below `sm` automatically). */
  tagline?: boolean;
  size?: 'sm' | 'md';
  /** White version for navy surfaces. */
  inverse?: boolean;
  /** Keep the full form visible below `sm` too (footer, phone menu). */
  taglineOnPhones?: boolean;
  className?: string;
}) {
  const mark = size === 'sm' ? 'h-[18px]' : 'h-[22px]';
  const word = size === 'sm' ? 'text-[19px]' : 'text-[22px]';
  const ink = inverse ? 'text-white' : 'text-navy dark:text-white';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 45 28" aria-hidden className={`${mark} w-auto shrink-0`}>
        <polygon points="11.38,28 28,0 44.63,28" fill="#C8102E" />
        <polygon points="0,28 14.88,7.88 29.75,28" className={inverse ? 'fill-white' : 'fill-navy dark:fill-white'} />
      </svg>
      <span className={`${word} font-extrabold leading-none tracking-[0.05em] ${ink}`}>MECE</span>
      {tagline && (
        <>
          <span aria-hidden className={`ml-1 h-7 w-px ${taglineOnPhones ? 'block' : 'hidden sm:block'} ${inverse ? 'bg-white/25' : 'bg-border-strong'}`} />
          <span className={`${taglineOnPhones ? 'block' : 'hidden sm:block'} whitespace-nowrap font-medium leading-[1.3] ${size === 'sm' ? 'text-[10.5px]' : 'text-[11px]'} ${inverse ? 'text-white/70' : 'text-muted-foreground'}`}>
            Method for Evaluating
            <br />
            Corporate Excellence
          </span>
        </>
      )}
    </span>
  );
}

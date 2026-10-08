/**
 * The MECE lockup drawn in HTML/SVG instead of the /logo-*.svg files, so the
 * word "MECE" renders in the page's own Inter (an <img> SVG cannot reach page
 * fonts and falls back to the system sans) and flips cleanly in dark mode.
 * Geometry is the brand mark from public/logo-mece-navy.svg, unchanged.
 */
export default function Wordmark({
  tone = 'auto',
  className = '',
  taglineFrom = 'sm',
}: {
  tone?: 'auto' | 'light';
  className?: string;
  /** Breakpoint from which the two-line tagline shows (the nav needs the room at lg); 'never' hides it. */
  taglineFrom?: 'sm' | 'xl' | 'never';
}) {
  const show = taglineFrom === 'never' ? '' : taglineFrom === 'xl' ? 'xl:block' : 'sm:block';
  const ink = tone === 'light' ? 'text-white' : 'text-navy dark:text-white';
  const sub = tone === 'light' ? 'text-white/60' : 'text-[#5C5A52] dark:text-white/60';
  const rule = tone === 'light' ? 'bg-white/20' : 'bg-[#E6E2D8] dark:bg-white/15';
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="50 47 49 32" aria-hidden className="h-[22px] w-auto shrink-0 sm:h-[24px]">
        <polygon points="63.38,77.00 80.00,49.00 96.63,77.00" fill="#C8102E" />
        <polygon points="52.00,77.00 66.88,56.88 81.75,77.00" className={tone === 'light' ? 'fill-white' : 'fill-[#0F1C33] dark:fill-white'} />
      </svg>
      <span className={`font-sans text-[22px] font-extrabold leading-none tracking-[0.01em] sm:text-[25px] ${ink}`}>MECE</span>
      <span aria-hidden className={`hidden h-8 w-px ${show} ${rule}`} />
      <span className={`hidden font-sans text-[11.5px] font-medium leading-[1.3] ${show} ${sub}`}>
        Method for Evaluating
        <br />
        Corporate Excellence
      </span>
    </span>
  );
}

import React from 'react';

/**
 * MECE logo (new wordmark — mountain mark + "MECE" + tagline).
 *
 * variant:
 *   'light' — the WHITE logo, for dark / navy surfaces (app nav, footer)
 *   'dark'  — the NAVY logo, for light surfaces (auth cards)
 *   'auto'  — follow the theme: navy in light mode, white in dark mode (default)
 * isLanding — back-compat alias for variant='auto'.
 * full — render the full lockup WITH the tagline (used where there's room, e.g.
 *        the footer). Default is the compact mark (icon + "MECE"), which stays
 *        legible in tight nav bars where the small tagline would be unreadable.
 *
 * Sizing is intentional: the source SVG is a ~4:1 wordmark, so heights are kept
 * modest and width is auto. Callers may still pass `className` (e.g. an explicit
 * height) to override per context.
 */
type LogoVariant = 'auto' | 'light' | 'dark';

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
  isLanding?: boolean;
  full?: boolean;
}

const SVGS = {
  full: { navy: '/logo-mece-navy.svg', white: '/logo-mece-white.svg' },
  mark: { navy: '/logo-mece-mark-navy.svg', white: '/logo-mece-mark-white.svg' },
};

export default function Logo({
  className = '',
  variant = 'auto',
  isLanding = false,
  full = false,
}: LogoProps) {
  const set = full ? SVGS.full : SVGS.mark;
  const sizeCls = full ? 'h-10 md:h-12 w-auto' : 'h-7 md:h-8 w-auto';
  const base = `${sizeCls} flex-shrink-0 ${className}`;

  const mode: LogoVariant = isLanding ? 'auto' : variant;

  // White logo — for dark/navy backgrounds.
  if (mode === 'light') {
    return <img src={set.white} alt="MECE" className={base} />;
  }
  // Navy logo — for light backgrounds.
  if (mode === 'dark') {
    return <img src={set.navy} alt="MECE" className={base} />;
  }
  // Auto — navy in light theme, white in dark theme.
  return (
    <>
      <img src={set.navy} alt="MECE" className={`block dark:hidden ${base}`} />
      <img src={set.white} alt="MECE" className={`hidden dark:block ${base}`} />
    </>
  );
}

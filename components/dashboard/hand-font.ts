import localFont from 'next/font/local';

/**
 * Kalam Light (Indian Type Foundry, SIL OFL 1.1) for the dashboard's
 * handwritten line of the day. Same file the landing's margin notes use
 * (components/home/fonts), declared on its own here so the dashboard does not
 * also pull the landing's Newsreader faces. ~21KB, latin subset.
 */
export const dashHand = localFont({
  src: [{ path: '../home/fonts/kalam-latin-300-normal.woff2', weight: '300', style: 'normal' }],
  variable: '--font-dash-hand',
  display: 'swap',
  fallback: ['Segoe Print', 'Bradley Hand', 'cursive'],
});

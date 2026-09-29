import localFont from 'next/font/local';

/**
 * Type for the India landing page ("/") only — scoped here, not in the root
 * layout, so the app and the US site never download it.
 *
 *   serif — Newsreader (Production Type, SIL OFL 1.1). An editorial text face
 *           with a real display cut: headlines at 600, body copy at 400, the
 *           story quotes in 400 italic. Latin subset, ~23KB per style.
 *   hand  — Kalam Light (Indian Type Foundry, SIL OFL 1.1). The two margin
 *           notes only — a real pen hand, not a novelty script. ~21KB.
 *
 * Files come from @fontsource 5.3.0 (latin subset) and live beside this file.
 */
export const homeSerif = localFont({
  src: [
    { path: './fonts/newsreader-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/newsreader-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/newsreader-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/newsreader-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-home-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const homeHand = localFont({
  src: [{ path: './fonts/kalam-latin-300-normal.woff2', weight: '300', style: 'normal' }],
  variable: '--font-home-hand',
  display: 'swap',
  fallback: ['Segoe Print', 'Bradley Hand', 'cursive'],
});

import localFont from 'next/font/local';

/**
 * The US display serif inside the APP (greeting, case titles). Same files as
 * app/us/layout.tsx, but `preload: false`: this module is imported by the
 * shared (app) layout, and preloading there would make India pages download
 * a font they never use. Without a preload the browser fetches it only when
 * an element actually uses the family — i.e. only in the US shell.
 */
export const usAppDisplay = localFont({
  src: [
    { path: '../../../app/us/_fonts/lora-regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../app/us/_fonts/lora-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../../app/us/_fonts/lora-semibold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-us-display',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

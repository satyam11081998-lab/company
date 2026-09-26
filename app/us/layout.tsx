import type { Viewport } from 'next';
import localFont from 'next/font/local';

/**
 * Layout for the international (US + Europe) marketing pages under /us.
 *
 * Adds ONE editorial display serif (Lora, subset to Latin, WOFF2 ~20KB per
 * style) used only for large headlines on these pages. Everything else stays
 * Inter. Scoped here — not in the root layout — so the India site and the app
 * never download it.
 */
const display = localFont({
  src: [
    { path: './_fonts/lora-regular.woff2', weight: '400', style: 'normal' },
    { path: './_fonts/lora-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-us-display',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

// The root layout pins maximumScale to 1 (stops iOS zooming into focused
// inputs in the app). These marketing pages have no form fields, so let
// people pinch-zoom (WCAG 1.4.4).
export const viewport: Viewport = { maximumScale: 5 };

export default function UsMarketingLayout({ children }: { children: React.ReactNode }) {
  // relative + z-[1] + an opaque background: the root layout's fixed GeoPattern
  // watermark (z-0) stays behind these pages, which are designed without it.
  return <div className={`${display.variable} us-scope relative z-[1] min-h-screen bg-background`}>{children}</div>;
}

import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import GeoPattern from '@/components/geo-pattern';
import MobileDesktopBanner from '@/components/mobile-desktop-banner';
import PwaProvider from '@/components/pwa/pwa-provider';
import { Analytics } from "@vercel/analytics/next";
import PageTracker from '@/components/analytics/page-tracker';
import Script from 'next/script';
import { SITE_URL, SITE_TITLE, SITE_DESC, siteGraphJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'MECE',
  title: {
    default: SITE_TITLE,
    template: '%s · MECE',
  },
  description: SITE_DESC,
  keywords: [
    'MBA placement preparation',
    'case interview practice',
    'guesstimate questions',
    'GD topics for MBA',
    'consulting interview prep',
    'summer placement interview',
    'product manager interview prep',
    'MBA casebook',
  ],
  authors: [{ name: 'MECE', url: SITE_URL }],
  creator: 'MECE',
  publisher: 'MECE',
  category: 'education',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'MECE',
    statusBarStyle: 'default',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'MECE',
    title: SITE_TITLE,
    description: SITE_DESC,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0F1C33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents auto-zoom on input focus in iOS Safari
};

/** Root HTML layout — GeoPattern is fixed behind everything, cards cover it naturally */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Organization + WebSite entity graph — page-level JSON-LD (articles,
  // breadcrumbs) references these nodes by @id.
  const jsonLd = siteGraphJsonLd();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} font-sans text-foreground bg-background antialiased min-h-screen relative selection:bg-primary/20 selection:text-primary`}>
        <MobileDesktopBanner />
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
            Skip to content
          </a>
          {/* Fixed diagonal parallelogram pattern — same as Medusa template */}
          <GeoPattern />
          <main id="main-content">
            {children}
          </main>
          <Toaster />
          <PwaProvider />
          <Analytics />
          <PageTracker />
          {/* Cloudflare Turnstile — loaded ONLY when a site key is configured,
              so no third-party script reaches users until you actually turn the
              protection on. `lazyOnload` keeps it off the critical path: it is
              needed at the moment someone clicks "start practising", never at
              first paint, so it must not compete with LCP on "/".
              `render=explicit` stops it auto-attaching to the page; lib/guest.ts
              renders an invisible widget on demand and reads the token. */}
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="lazyOnload"
            />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}

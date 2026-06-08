import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import GeoPattern from '@/components/geo-pattern';
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = 'https://mece.in';
const SITE_TITLE = 'MECE — Placement interview prep for Indian MBA students';
const SITE_DESC = 'Cases, frameworks, GD briefs, and structured feedback for MBA & PGDM placement interviews — consulting, finance, marketing, product, ops.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'MECE',
  title: SITE_TITLE,
  description: SITE_DESC,
  keywords: ['MBA placement', 'case interview', 'GD prep', 'consulting prep', 'product manager interview'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'MECE',
    title: SITE_TITLE,
    description: SITE_DESC,
    locale: 'en_IN',
    images: [{ url: '/og-card.png', alt: 'MECE', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ['/og-card.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0F1C33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents auto-zoom on input focus in iOS Safari
};

/** Root HTML layout — GeoPattern is fixed behind everything, cards cover it naturally */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "MECE",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": SITE_DESC
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} font-sans text-foreground bg-background antialiased min-h-screen relative selection:bg-primary/20 selection:text-primary`}>
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
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
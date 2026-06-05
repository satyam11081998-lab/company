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
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'MECE',
    title: SITE_TITLE,
    description: SITE_DESC,
    locale: 'en_IN',
    images: [{ url: '/logo.png', alt: 'MECE' }],
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ['/logo.png'],
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen text-foreground antialiased font-sans overflow-x-hidden`}>
        <ThemeProvider>
          {/* Fixed diagonal parallelogram pattern — same as Medusa template */}
          <GeoPattern />
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
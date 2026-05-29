import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import GeoPattern from '@/components/geo-pattern';

export const metadata: Metadata = {
  title: 'MECE — Placement interview prep for Indian MBA students',
  description: 'Cases, frameworks, GD briefs, and structured feedback for MBA & PGDM placement interviews — consulting, finance, marketing, product, ops.',
  keywords: ['MBA placement', 'case interview', 'GD prep', 'consulting prep', 'product manager interview'],
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
        </ThemeProvider>
      </body>
    </html>
  );
}
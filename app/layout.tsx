import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import GeoPattern from '@/components/geo-pattern';

export const metadata: Metadata = {
  title: 'MECE — Case interview & GD prep for Indian MBA students',
  description: 'Daily cases, structured feedback, and GD-ready news briefs for MBA & PGDM aspirants in India.',
};

/** Root HTML layout — GeoPattern is fixed behind everything, cards cover it naturally */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-foreground antialiased">
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
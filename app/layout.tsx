import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Consilio — Case interview & GD prep for Indian MBA students',
  description: 'Daily cases, AI feedback, and GD-ready news briefs for MBA & PGDM aspirants in India.',
};

/** Root HTML layout used by every route. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

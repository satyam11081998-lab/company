import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Consilio — Case interview & GD prep for Indian MBA students',
  description: 'Daily cases, structured feedback, and GD-ready news briefs for MBA & PGDM aspirants in India.',
};

/** Root HTML layout used by every route. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

/** Simple site footer with links to methodology and key pages. */
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="container max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Consilio</span>
          <span className="ml-2">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link href="/methodology" className="text-slate-600 hover:text-primary">
            Methodology
          </Link>
          <Link href="/cases" className="text-slate-600 hover:text-primary">
            Cases
          </Link>
          <Link href="/learn" className="text-slate-600 hover:text-primary">
            Learn
          </Link>
          <Link href="/leaderboard" className="text-slate-600 hover:text-primary">
            Leaderboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
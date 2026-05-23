import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'MECE — Case interview & GD prep for Indian MBA students',
  description: 'Daily cases, structured feedback, and GD-ready news briefs for MBA & PGDM aspirants in India.',
};

/** Root HTML layout used by every route. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <ThemeProvider>
          {/* Engineering paper grid background */}
          <div className="grid-bg" aria-hidden="true" />
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

/** Simple site footer with links to methodology and key pages. */
function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto relative z-10">
      <div className="container max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">MECE</span>
          <span className="ml-2">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link href="/methodology" className="text-muted-foreground hover:text-primary transition-colors">
            Methodology
          </Link>
          <Link href="/cases" className="text-muted-foreground hover:text-primary transition-colors">
            Cases
          </Link>
          <Link href="/learn" className="text-muted-foreground hover:text-primary transition-colors">
            Learn
          </Link>
          <Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
            Leaderboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
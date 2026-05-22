import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Newspaper, Trophy, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Public landing page (/) marketing MECE to MBA aspirants.
 *  If the user is already logged in, redirects them straight to /dashboard. */
export default async function LandingPage() {
  // If user is already authenticated, send them to the dashboard
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              MECE
            </span>
            <span className="hidden rounded-md bg-navy text-navy-foreground px-2 py-0.5 text-xs font-medium sm:inline-block">
              MBA prep
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">Sign up free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for Indian MBA students
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Crack{' '}
            <span className="text-primary">case interviews</span> with structured practice
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Daily cases, structured feedback grounded in consulting frameworks, and GD-ready news briefs. Built for Indian MBA students preparing for placements.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-hover">
                Sign up free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<BrainCircuit className="h-6 w-6 text-primary" />}
            title="Structured case practice"
            description="Submit answers to real guesstimate, profitability and market-sizing cases. Get rigorous feedback across 6 dimensions in under a minute."
          />
          <FeatureCard
            icon={<Newspaper className="h-6 w-6 text-primary" />}
            title="Daily GD briefs"
            description="Curated news with smart angles, data points and opening lines. Walk into any GD with a sharp, defensible opinion."
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6 text-primary" />}
            title="Peer leaderboard"
            description="Compete with MBA aspirants across India. Climb the ranks with every case you crack."
          />
        </div>
      </section>

      <footer className="border-t border-border bg-slate-50">
        <div className="container py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} MECE. Built for the next generation of consultants.
        </div>
      </footer>
    </main>
  );
}

/** Single feature card on the landing page. */
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
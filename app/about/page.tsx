import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { UserProvider } from '@/components/user-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Footer from '@/components/footer';
import type { UserRow } from '@/lib/types';
import { Shield, Trophy, Activity, Layers } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRow: UserRow | null = null;
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    userRow = data as UserRow | null;
  }

  // Find founders from the existing testimonials data
  const founders = TESTIMONIALS.slice(0, 3);

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <UserProvider initialUser={userRow}>
        <AppNav />
      </UserProvider>
      <main className="container max-w-6xl py-16 flex-grow">
        
        {/* Header Section */}
        <div className="text-center mb-24 max-w-5xl mx-auto overflow-hidden">
          <p className="text-base font-semibold uppercase tracking-wider text-primary">About MECE</p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight whitespace-nowrap">
            <span className="text-primary">M</span>ethod for <span className="text-primary">E</span>valuating <span className="text-primary">C</span>orporate <span className="text-primary">E</span>xcellence
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground whitespace-normal">
            MECE is an AI-powered placement-interview preparation platform purpose-built for Indian MBA and PGDM students. 
            We provide a structured, rigorous, and completely objective environment to master your consulting, finance, marketing, product, and operations interviews.
          </p>
        </div>

        {/* The MECE Philosophy */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Why &ldquo;MECE&rdquo;?</h2>
              <div className="space-y-6 text-body leading-relaxed text-foreground/80">
                <p>
                  In the consulting world, the <strong className="text-foreground">MECE principle</strong> (Mutually Exclusive, Collectively Exhaustive) is the absolute gold standard for problem-solving. Popularized by McKinsey alumna Barbara Minto, it ensures that your framework breaks a problem down with zero overlaps and zero gaps.
                </p>
                <p>
                  We built our entire platform around this exact philosophy. Our official tagline?"<strong className="text-primary">M</strong>ethod for <strong className="text-primary">E</strong>valuating <strong className="text-primary">C</strong>orporate <strong className="text-primary">E</strong>xcellence?"is a nod to that rigorous standard. 
                </p>
                <p>
                  Every case, every guesstimate, and every piece of feedback we provide is designed to train your mind to think in perfect MECE structures, giving you an unfair advantage in high-stakes interviews.
                </p>
              </div>
            </div>
            <div className="bg-card p-10 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center h-full">
               <Layers className="h-16 w-16 text-primary mb-6" />
               <h3 className="text-xl font-bold text-navy mb-2">Mutually Exclusive</h3>
               <p className="text-body text-muted-foreground mb-8">No overlaps. Every point is distinct.</p>
               <h3 className="text-xl font-bold text-navy mb-2">Collectively Exhaustive</h3>
               <p className="text-body text-muted-foreground">No gaps. Every possibility is covered.</p>
            </div>
          </div>
        </section>

        {/* The Problem / Solution (Navy Block) */}
        <section className="mb-24">
          <div className="bg-navy rounded-3xl p-10 md:p-16 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
              <h2 className="text-3xl font-bold mb-6 text-white">The Problem We Solve</h2>
              <p className="text-lg leading-relaxed text-navy-foreground/80 mb-8">
                Preparing for summer internships and final placements at top-tier firms like McKinsey, BCG, Bain, Goldman Sachs, P&G, and HUL is incredibly challenging. 
                Historically, students have relied on unstructured peer-mock interviews, wrestling with scheduling conflicts, highly subjective feedback, or exorbitantly expensive paid bootcamps.
              </p>
              <div className="bg-white/10 p-8 rounded-xl border border-white/20">
                <p className="text-lg leading-relaxed text-white">
                  <strong className="text-primary-foreground font-semibold">The MECE Way:</strong> We replace subjectivity with hard data. You get consistent, 100-point rubric-based feedback at any hour of the day. No waiting for a peer to be free, and no wondering if your case structure was actually good enough.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Engine */}
        <section className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
             <h2 className="text-3xl font-bold text-foreground">Our Core Engine</h2>
             <p className="mt-4 text-lg text-muted-foreground">The technology and structure driving the premier placement prep platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 flex flex-col items-start text-left transition-shadow hover:shadow-md">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">100-Point AI Rubric</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                Every submission is evaluated by our advanced AI engine across 6 distinct dimensions (Structure, Pragmatism, Synthesis, etc.). Get deep, actionable insights instead of generic advice.
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-start text-left transition-shadow hover:shadow-md">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Cross-India Leaderboard</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                Your performance is ranked live against MBA aspirants from across India. Know exactly where you stand against your peers and what it takes to break into the top percentiles.
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-start text-left transition-shadow hover:shadow-md">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Habit Formation</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                Consistency is the only path to mastery. We surface daily curated content (cases, guesstimates, news briefs) and visually track your progress through a 12-week activity heatmap.
              </p>
            </Card>
          </div>
        </section>

        {/* Founders */}
        <section className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground">The Minds Behind MECE.in</h2>
            <p className="mt-4 text-lg text-muted-foreground">Built by MBA candidates, for MBA candidates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {founders.map((founder) => (
              <div key={founder.id} className="flex flex-col items-center text-center">
                <Avatar className="h-44 w-44 border-[6px] border-border shadow-lg mb-6">
                  {founder.avatar_url && <AvatarImage src={founder.avatar_url} alt={founder.name} className="object-cover" />}
                  <AvatarFallback className="bg-navy text-navy-foreground text-5xl font-semibold">
                    {founder.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 justify-center mb-1">
                  <h3 className="text-2xl font-bold text-foreground">{founder.name}</h3>
                  {founder.linkedin_url && (
                    <a href={founder.linkedin_url} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" title="View LinkedIn Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
                <p className="text-body font-medium text-muted-foreground mb-3">{founder.school}</p>
                <div className="w-12 h-1.5 bg-primary/20 rounded-full mx-auto mb-4"></div>
                <p className="text-base text-primary font-medium leading-snug max-w-[280px]">
                  {founder.placement}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8 text-center bg-card rounded-3xl p-14 border border-border shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to elevate your prep?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Your placement season starts now. Join the ranks of MBA students mastering their interviews with MECE.
            </p>
            <Link href="/practice">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-hover px-10 py-6 text-lg rounded-full shadow-md hover:shadow-lg transition-all">
                Start Practicing Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

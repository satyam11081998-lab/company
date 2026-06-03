import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ThemeToggle from '@/components/theme-toggle';
import TestimonialsCarousel from '@/components/testimonials-carousel';
import Logo from '@/components/logo';
import Footer from '@/components/footer';
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Users, BookOpen, Trophy, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full overflow-hidden max-w-[100vw]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12 shrink-0">
            <Link href="/" className="flex items-center -ml-2 shrink-0">
              <Logo variant="dark" className="" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {[['#features', 'Features'], ['#scoring', 'Scoring'], ['/methodology', 'Methodology']].map(([href, label]) => (
                <Link key={href} href={href} className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors touch-target">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <button className="btn-primary text-sm md:text-[15px] py-1.5 px-3 md:py-2 md:px-6 whitespace-nowrap">
                  Open MECE
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <button className="text-[15px] font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary text-sm md:text-[15px] py-1.5 px-4 md:py-2 md:px-6 whitespace-nowrap">
                    Get started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="animate-fade-in">
            <div className="badge-pill mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Placement interview prep · India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.08] tracking-tight">
              Crack placement<br />
              <span className="text-primary">interviews</span><br />
              the structured way.
            </h1>
            <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed max-w-md">
              Cases, frameworks, and GD prep for every MBA aspirant — consulting, finance, marketing, product, ops. Scored across 6 dimensions. Ranked against every aspirant in India.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link href={user ? "/dashboard" : "/signup"}>
                <button className="btn-primary">
                  {user ? "Open MECE" : "Start now"} <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/methodology">
                <button className="btn-ghost">
                  How it works
                </button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6">
              {[['6', 'Scoring dimensions'], ['60s', 'Feedback time'], ['Instant', 'Access']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-xl font-bold text-foreground">{val}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating UI mockup */}
          <div className="animate-slide-up mt-10 md:mt-0">
            <div className="relative">
              {/* Geometric outline shapes behind card */}
              <GeoShapes />
              {/* Main floating card */}
              <div className="ui-card-floating p-5 relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">M</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Your Dashboard</p>
                    <p className="text-[11px] text-muted-foreground">Live score overview</p>
                  </div>
                </div>
                {/* Mini KPI row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[['248', 'Points'], ['#12', 'Rank'], ['71', 'Avg Score']].map(([v, l]) => (
                    <div key={l} className="bg-muted rounded-lg p-2.5">
                      <p className="text-[18px] font-bold text-foreground leading-none">{v}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Score bars */}
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score breakdown</p>
                {[['Structure', 82, 'bg-primary'], ['Quantitative', 65, 'bg-amber-400'], ['Synthesis', 78, 'bg-emerald-500'], ['Judgment', 55, 'bg-primary/60']].map(([dim, pct, color]) => (
                  <div key={dim as string} className="flex items-center gap-2.5 mb-2">
                    <span className="text-[12px] text-muted-foreground w-20 flex-shrink-0">{dim as string}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] font-mono text-muted-foreground w-6 text-right">{pct}</span>
                  </div>
                ))}
              </div>
              {/* Second floating card */}
              <div className="ui-card absolute -bottom-8 -right-4 p-3.5 w-52 animate-float" style={{ animationDelay: '0.5s' }}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today's case</p>
                <p className="text-[13px] font-semibold text-foreground leading-snug">Estimate MBA prep market in India</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="tag tag-red">Market Sizing</span>
                  <span className="text-[11px] text-muted-foreground">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/60 py-5">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-6 text-center">
            Used by aspirants targeting roles at
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-50 grayscale">
            {['McKinsey', 'BCG', 'Bain', 'Goldman Sachs', 'JPMorgan', 'HUL', 'P&G', 'Amazon', 'Flipkart'].map(firm => (
              <span key={firm} className="text-[13px] font-semibold text-muted-foreground/60">{firm}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature 1: Scoring (left text + right card) ───────────────── */}
      <section id="scoring" className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div>
            <div className="badge-pill mb-4">
              <Shield className="h-3.5 w-3.5" />
              Scoring System
            </div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Precise scoring for<br />every answer
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              Highlight the <span className="text-primary font-medium">exact gaps</span> in your consulting thinking with a 100-point rubric across{' '}
              <span className="text-primary font-medium">6 dimensions</span> — in under 60 seconds.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Graded across 6 consulting dimensions simultaneously.',
                'Frameworks drawn from consulting, IB, and brand management traditions.',
                'Instant written feedback, not just a number.',
                'Track score improvement across every submission.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-6 inline-flex">
              <button className="btn-primary">Start practising</button>
            </Link>
          </div>
          {/* Scoring card mockup */}
          <div className="ui-card-floating overflow-hidden">
            <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Score Breakdown</span>
              <span className="tag tag-red">78 / 100</span>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto table-scroll-mobile">
                <table className="data-table min-w-[500px]">
                  <thead>
                    <tr>
                      <th>Dimension</th>
                      <th>Score</th>
                      <th>Max</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Structure', 21, 25, 'Strong', 'tag-green'],
                      ['Quantitative', 13, 20, 'Develop', 'tag-amber'],
                      ['Synthesis', 17, 20, 'Good', 'tag-green'],
                      ['Judgment', 12, 15, 'Good', 'tag-green'],
                      ['Creativity', 8, 10, 'Strong', 'tag-green'],
                      ['Tone', 7, 10, 'Strong', 'tag-green'],
                    ].map(([dim, score, max, rating, tagClass]) => (
                      <tr key={dim as string}>
                        <td className="text-[13px] font-medium text-foreground">{dim as string}</td>
                        <td className="font-mono font-semibold text-[13px]">{score as number}</td>
                        <td className="text-[12px] text-muted-foreground">{max as number}</td>
                        <td><span className={`tag ${tagClass as string}`}>{rating as string}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 2: Cases (centered + 2 cards) ────────────────────── */}
      <section id="features" className="bg-card border-y border-border py-20 relative overflow-hidden">
        {/* Geometric watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {[
            { w: 700, h: 500, rotate: 12, left: '-15%', top: '-20%', opacity: 0.04 },
            { w: 600, h: 420, rotate: 12, left: '-8%',  top: '-10%', opacity: 0.03 },
            { w: 500, h: 340, rotate: 12, right: '-10%', bottom: '-15%', opacity: 0.04 },
            { w: 400, h: 280, rotate: 12, right: '-5%',  bottom: '-8%', opacity: 0.03 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: s.w, height: s.h,
                border: `1px solid rgba(0,0,0,${s.opacity})`,
                borderRadius: 24,
                transform: `rotate(${s.rotate}deg)`,
                left: s.left, top: s.top, right: (s as any).right, bottom: (s as any).bottom,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="badge-pill mb-4 mx-auto w-fit">
              <BookOpen className="h-3.5 w-3.5" />
              Daily Practice
            </div>
            <h2 className="text-4xl font-bold text-foreground">Real cases across functions, daily</h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Practice <span className="text-primary font-medium">guesstimate</span>,{' '}
              <span className="text-primary font-medium">profitability</span>,{' '}
              <span className="text-primary font-medium">market sizing</span>, and brand strategy cases that mirror
              actual MBA placement interview formats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Card 1: Case list */}
            <div className="ui-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Available Cases</span>
                <span className="tag tag-navy">3 new today</span>
              </div>
              <div className="overflow-x-auto table-scroll-mobile">
                <table className="data-table min-w-[500px]">
                  <thead>
                  <tr>
                    <th>Case</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Online MBA prep market size', 'Market Sizing', 'Medium', '78'],
                    ['EdTech profitability decline', 'Profitability', 'Hard', '—'],
                    ['College canteen daily revenue', 'Guesstimate', 'Easy', '92'],
                    ['B-school fee increase impact', 'Framework', 'Medium', '65'],
                  ].map(([title, type, diff, score]) => (
                    <tr key={title} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="font-medium text-[13px] text-foreground max-w-[180px]">
                        <span className="line-clamp-1">{title}</span>
                      </td>
                      <td><span className="tag tag-navy text-[11px]">{type}</span></td>
                      <td>
                        <span className={`tag text-[11px] ${diff === 'Easy' ? 'tag-green' : diff === 'Hard' ? 'tag-red' : 'tag-amber'}`}>
                          {diff}
                        </span>
                      </td>
                      <td className="font-mono font-semibold text-[13px] text-foreground">{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            {/* Card 2: Submit form */}
            <div className="ui-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Submit Answer</span>
                <span className="tag tag-red">Medium · 20 pts</span>
              </div>
              <div className="p-5">
                <p className="text-[13px] font-semibold text-foreground mb-1">
                  Estimate the market size for online MBA prep in India.
                </p>
                <p className="text-[12px] text-muted-foreground mb-4">
                  State assumptions clearly. Walk through total college-going population to paying online learners.
                </p>
                <div className="bg-muted rounded-lg p-3 mb-4 text-[13px] text-muted-foreground border border-border">
                  Write your structured answer here...
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Scored in ~60 seconds</span>
                  <button className="btn-primary text-[13px] py-2 px-4">
                    Submit <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 3: GD Briefs (right text + left card) ─────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          {/* Left: GD brief card mockup */}
          <div className="ui-card-floating overflow-hidden">
            <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">GD Brief</span>
              </div>
              <span className="text-[11px] text-muted-foreground">24 May 2025</span>
            </div>
            <div className="p-5">
              <span className="tag tag-navy mb-3 inline-flex">Policy & Economy</span>
              <h3 className="text-[15px] font-bold text-foreground leading-snug mb-2">
                India&apos;s AI policy and its impact on the startup ecosystem
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                The government&apos;s new AI regulatory framework has sparked debate across industry leaders.
                Key angles include data sovereignty, startup compliance costs, and global competitiveness.
              </p>
              <div className="space-y-2.5">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Smart angles to open with</p>
                {[
                  'Compare India\'s approach to EU AI Act — what can we borrow?',
                  'Startups face 3x compliance cost — innovation penalty or necessary guardrail?',
                  'Data localisation creates moat for Indian AI companies.',
                ].map(angle => (
                  <div key={angle} className="flex items-start gap-2 text-[13px] text-foreground">
                    <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    {angle}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="badge-pill mb-4">
              <TrendingUp className="h-3.5 w-3.5" />
              GD Preparation
            </div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Walk into any GD<br />fully prepared
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              Curated news briefs with <span className="text-primary font-medium">smart angles</span>,
              counter-arguments, and opening lines. Built fresh from live news every day.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Daily briefs on policy, economy, markets, and business affairs.',
                'Structured for GD format — not just news summaries.',
                'Argument starters and smart angles to differentiate yourself.',
                'Covers topics likely to appear in top tier B-school GDs.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-6 inline-flex">
              <button className="btn-primary">Browse GD Briefs</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature 4: Leaderboard (left text + right card) ───────────── */}
      <section className="bg-card border-y border-border py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
            <div>
              <div className="badge-pill mb-4">
                <Trophy className="h-3.5 w-3.5" />
                Leaderboard
              </div>
              <h2 className="text-4xl font-bold text-foreground leading-tight">
                See exactly where<br />you stand
              </h2>
              <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
                A <span className="text-primary font-medium">live leaderboard</span> of every MBA aspirant
                preparing across India. Earn points per submission. Track your{' '}
                <span className="text-primary font-medium">percentile rank</span> in real time.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Real competition with real aspirants, not curated examples.',
                  'Points earned on every case submission and GD brief read.',
                  'See rank, percentile, and gap to the next milestone.',
                  'Milestone ladder from Day 0 Dreamer to Summer Legend.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Leaderboard card */}
            <div className="ui-card-floating overflow-hidden">
              <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Leaderboard</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground">Live · 37 students</span>
                </div>
              </div>
              <div className="overflow-x-auto table-scroll-mobile">
                <table className="data-table min-w-[500px]">
                  <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Points</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['🥇', 'Arjun S.', '612', '14d', true],
                    ['🥈', 'Priya M.', '589', '9d', false],
                    ['🥉', 'Rohit K.', '541', '7d', false],
                    ['#4', 'Sneha T.', '498', '5d', false],
                    ['#12', 'You', '248', '3d', true],
                  ].map(([rank, name, pts, streak, highlight]) => (
                    <tr key={name as string} className={highlight ? 'bg-primary/5' : 'hover:bg-muted/30'}>
                      <td className="font-mono font-semibold text-[13px]">{rank as string}</td>
                      <td className={`text-[13px] font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>
                        {name as string}
                      </td>
                      <td className="font-mono font-bold text-[14px] text-foreground">{pts as string}</td>
                      <td className="text-[12px] text-muted-foreground">{streak as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── Methodology strip ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="badge-pill mx-auto w-fit mb-4">
            <Users className="h-3.5 w-3.5" />
            100-point rubric
          </div>
          <h2 className="text-3xl font-bold text-foreground">How every answer is graded</h2>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-md mx-auto">
            Six dimensions, consistent scoring, zero subjectivity.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Structure', '25 pts', 'MECE framework, logical flow, segmentation'],
            ['Quantitative', '20 pts', 'Math accuracy, assumptions, calculations'],
            ['Synthesis', '20 pts', 'Insights, so-what, conclusion quality'],
            ['Business Judgment', '15 pts', 'Commercial sense, real-world viability'],
            ['Creativity', '10 pts', 'Fresh angles, non-obvious ideas'],
            ['Professional Tone', '10 pts', 'Clarity, conciseness, communication'],
          ].map(([dim, pts, desc]) => (
            <div key={dim} className="ui-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-foreground">{dim}</span>
                <span className="tag tag-red">{pts}</span>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/methodology">
            <button className="btn-ghost">
              Read full methodology <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
              WHAT MBA ASPIRANTS SAY
            </p>
            <h2 className="mt-2 text-h2 text-foreground">
              From students who've used MECE in their placement journey.
            </h2>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-navy relative overflow-hidden py-16">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {[
            { w: 600, h: 400, rotate: 15, left: '-8%', top: '-20%', op: 0.06 },
            { w: 500, h: 320, rotate: 15, right: '-5%', bottom: '-15%', op: 0.06 },
          ].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', width: s.w, height: s.h,
              border: `1px solid rgba(255,255,255,${s.op})`,
              borderRadius: 24, transform: `rotate(${s.rotate}deg)`,
              left: s.left, top: s.top, right: (s as any).right, bottom: (s as any).bottom,
            }} />
          ))}
        </div>
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <div className="badge-pill mb-5 mx-auto w-fit" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)' }}>
            Begin practicing
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your placement season<br />starts now.
          </h2>
          <p className="mt-4 text-[15px] text-white/50 leading-relaxed">
            No credit card. No commitment. Start practising today and see where you rank.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link href="/signup">
              <button className="btn-primary">
                Create account <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/login">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: 9999, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
                Already a member?
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

/** Geometric outline shapes for hero section background */
function GeoShapes() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
      {[
        { w: 480, h: 340, rotate: 15, left: '-40px', top: '-30px', op: 0.05 },
        { w: 400, h: 280, rotate: 15, left: '0px',   top: '10px',  op: 0.04 },
        { w: 320, h: 220, rotate: 15, left: '30px',  top: '50px',  op: 0.03 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: s.w, height: s.h,
          border: `1px solid rgba(0,0,0,${s.op})`,
          borderRadius: 16,
          transform: `rotate(${s.rotate}deg)`,
          left: s.left, top: s.top,
        }} />
      ))}
    </div>
  );
}
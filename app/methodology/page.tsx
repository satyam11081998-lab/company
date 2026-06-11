import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { UserProvider } from '@/components/user-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserRow } from '@/lib/types';

export const metadata = {
  title: 'Scoring methodology',
  description: 'How MECE scores case interview and GD practice — six dimensions, transparent rubrics, and percentile ranks against MBA aspirants across India.',
  alternates: { canonical: '/methodology' },
};

export default async function MethodologyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRow: UserRow | null = null;
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    userRow = data as UserRow | null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <UserProvider initialUser={userRow}>
        <AppNav />
      </UserProvider>
      <main className="container max-w-4xl py-12">
        <div className="text-center">
          <p className="text-base font-semibold uppercase tracking-wider text-primary">Methodology</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
            How MECE evaluates your answers
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-body leading-relaxed text-muted-foreground">
            Case interview evaluation isn&apos;t subjective magic. It follows consistent principles
            used by top MBA placement committees. We&apos;ve codified those principles into a
            structured 6-dimension rubric, so you get the same rigorous feedback as your peers,
            every time.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-foreground">The 6 dimensions</h2>
          <p className="mt-2 text-body text-muted-foreground">
            Every submission is scored across these six areas, totaling 100 points.
          </p>

          <div className="mt-6 space-y-4">
            <DimensionCard
              name="Structure"
              max={25}
              description="MECE decomposition of the problem into a bespoke, logical framework. Clarification of scope before solving."
              groundedIn="MECE principle (Mutually Exclusive, Collectively Exhaustive) popularized by McKinsey alumna Barbara Minto."
            />
            <DimensionCard
              name="Quantitative Skills"
              max={20}
              description="Accuracy of calculations, Pareto-driven prioritization, and sanity-checking results against real-world plausibility."
              groundedIn="Mental arithmetic and sanity-check rigor expected at top firms across functions (IB, FMCG, Consulting, Tech)."
            />
            <DimensionCard
              name="Synthesis & Communication"
              max={20}
              description="Top-down delivery of the central recommendation, supporting logic in descending order of importance, executive tone."
              groundedIn="Minto Pyramid Principle, foundational to structured business communication."
            />
            <DimensionCard
              name="Business Judgment"
              max={15}
              description="Stress-testing recommendations across macro environment, industry dynamics, and company-specific constraints."
              groundedIn="3-Layer Strategic Alignment framework taught at FMS Delhi and other top Indian B-schools."
            />
            <DimensionCard
              name="Hypothesis-Driven Creativity"
              max={10}
              description="Generating multiple distinct, testable hypotheses including non-obvious options. Structured exploration, not brainstorming."
              groundedIn="Hypothesis-driven approach emphasized in BCG and Bain case interviews."
            />
            <DimensionCard
              name="Professional Tone"
              max={10}
              description="Confident without arrogance, acknowledging uncertainty where appropriate, ethical recommendations, intellectual humility."
              groundedIn="Behavioral signals consistently evaluated in high-stakes placement interviews; ethical compromises are near-disqualifying."
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-foreground">Frameworks we recognize</h2>
          <p className="mt-2 text-body text-muted-foreground">
            When you use these frameworks correctly in your answer, the evaluation rewards them.
          </p>

          <Card className="mt-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FrameworkItem name="MECE" desc="Mutually Exclusive, Collectively Exhaustive decomposition" />
              <FrameworkItem name="Issue Tree" desc="Hierarchical decomposition from root problem to hypotheses" />
              <FrameworkItem name="CSAC" desc="Clarify, Structure, Analyze, Conclude" />
              <FrameworkItem name="Minto Pyramid Principle" desc="Top-down communication starting with the conclusion" />
              <FrameworkItem name="Profitability Framework" desc="Revenue, Price/Volume vs Cost decomposition" />
              <FrameworkItem name="Pareto Principle (80/20)" desc="Prioritizing variables driving the outcome" />
              <FrameworkItem name="3-Layer Strategic Alignment" desc="Macro, Industry, Company stress-test" />
              <FrameworkItem name="Hypothesis-Driven Approach" desc="Multiple competing hypotheses before committing" />
              <FrameworkItem name="Sanity Check" desc="Verifying operational plausibility of results" />
              <FrameworkItem name="Feasibility Dual-Check" desc="Operational and financial viability of recommendations" />
            </div>
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-foreground">Publicly available sources</h2>
          <p className="mt-2 text-body text-muted-foreground">
            Our evaluation methodology draws from publicly available materials. We are not affiliated
            with or endorsed by any of these firms or institutions.
          </p>

          <Card className="mt-6 p-6">
            <ul className="space-y-3 text-body text-foreground/80">
              <SourceLink
                title="McKinsey on MECE / Barbara Minto"
                url="https://www.mckinsey.com/alumni/news-and-events/global-news/alumni-news/barbara-minto-mece-i-invented-it-so-i-get-to-say-how-to-pronounce-it"
              />
              <SourceLink
                title="BCG Case Interview Preparation"
                url="https://careers.bcg.com/global/en/case-interview-preparation"
              />
              <SourceLink
                title="BCG Interview Process"
                url="https://careers.bcg.com/global/en/interview-process"
              />
              <SourceLink
                title="Bain — What We Believe"
                url="https://www.bain.com/about/what-we-believe/"
              />
              <SourceLink
                title="McKinsey Careers — Interviewing"
                url="https://www.mckinsey.com/careers/interviewing/id-id"
              />
              <SourceLink
                title="McKinsey on Books (Pyramid Principle reference)"
                url="https://www.mckinsey.com/featured-insights/mckinsey-on-books"
              />
              <p className="text-body text-muted-foreground mt-4">
                The rubrics and structures on MECE are custom designed for comprehensive preparation.
              </p>
            </ul>
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-foreground">Important notes</h2>
          <Card className="mt-6 p-6 space-y-4 text-body leading-relaxed text-foreground/80">
            <p className="text-body text-muted-foreground mt-4">
              <strong className="text-foreground">No official affiliation.</strong> This platform is an independent educational tool. We are not affiliated with, endorsed by, or connected to McKinsey, BCG, Bain, or any specific firm or B-school referenced on the platform. Trademarks belong to their respective owners.
            </p>
            <p>
              <strong className="text-foreground">Evaluation limitations.</strong> MECE&apos;s
              evaluation augments practice but doesn&apos;t replace human feedback from professors,
              mentors, or peer mock interviews. We assess written submissions; live behavioral
              signals (composure, body language, active listening) are not captured.
            </p>
            <p>
              <strong className="text-foreground">Consistency over time.</strong> The same rubric is
              applied to every submission, so you can track genuine improvement across your practice
              sessions rather than relying on the subjective judgment of any single reviewer.
            </p>
            <p>
              <strong className="text-foreground">Continuous calibration.</strong> Our rubric is
              periodically reviewed against placement outcomes and emerging best practices. If you
              spot an issue with your evaluation, we want to hear about it.
            </p>
          </Card>
        </section>

        <div className="mt-14 flex justify-center">
          <Link href="/cases">
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
              Start practicing
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function DimensionCard(props: {
  name: string;
  max: number;
  description: string;
  groundedIn: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">{props.name}</h3>
        <span className="flex-shrink-0 rounded-md bg-accent px-2.5 py-1 text-small font-semibold text-primary">
          {props.max} pts
        </span>
      </div>
      <p className="mt-2 text-body leading-relaxed text-foreground/80">{props.description}</p>
      <p className="mt-3 text-small leading-relaxed text-muted-foreground italic">
        <span className="font-semibold not-italic text-muted-foreground">Grounded in: </span>
        {props.groundedIn}
      </p>
    </Card>
  );
}

function FrameworkItem(props: { name: string; desc: string }) {
  return (
    <div>
      <p className="text-strong font-semibold text-foreground">{props.name}</p>
      <p className="mt-0.5 text-body leading-relaxed text-muted-foreground">{props.desc}</p>
    </div>
  );
}

function SourceLink(props: { title: string; url: string }) {
  return (
    <li>
      <a href={props.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary hover:underline">
        {props.title}
      </a>
    </li>
  );
}
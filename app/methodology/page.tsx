import Link from 'next/link';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import ScrollAnimations from '@/components/scroll-animations';
import { Card } from '@/components/ui/card';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { genericArticleJsonLd, genericBreadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo';

const PAGE_TITLE = 'Scoring methodology';

export const metadata = {
  title: 'Scoring methodology',
  description: 'How MECE scores case-interview and GD practice — a transparent 100-point rubric across six dimensions, an arithmetic backstop that verifies your math, written feedback in ~60 seconds, and live percentile ranks against MBA aspirants across India.',
  alternates: { canonical: '/methodology' },
};

const articleJsonLd = genericArticleJsonLd({
  title: PAGE_TITLE,
  description: 'How MECE scores case-interview and GD practice — a transparent 100-point rubric across six dimensions, an arithmetic backstop, and percentile ranks against MBA aspirants across India.',
  url: '/methodology',
  datePublished: '2025-01-01',
  dateModified: '2026-06-12',
});

const breadcrumbJsonLd = genericBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Methodology' },
]);

const METHODOLOGY_FAQS = [
  {
    question: 'Is the scoring done by AI or by a human?',
    answer:
      'By MECE\'s evaluation engine — software, not a human panel — against a fixed 100-point rubric. For guesstimates and quantitative cases an independent arithmetic backstop re-checks the numbers, so a confident but wrong answer cannot quietly score well. Because the same rubric runs on every submission, your scores are comparable over time and against every other aspirant — something ad-hoc human mocks can\'t offer.',
  },
  {
    question: 'What are the six dimensions?',
    answer:
      'Structure (25), Quantitative Skills (20), Synthesis & Communication (20), Business Judgment (15), Hypothesis-Driven Creativity (10), and Professional Tone (10) — totalling 100 points.',
  },
  {
    question: 'How is my percentile calculated?',
    answer:
      'Your points accumulate across submissions and are ranked live against other MBA aspirants practising on MECE across India, so your percentile reflects the active pool rather than a fixed curve.',
  },
  {
    question: 'Can this replace a real mock interview?',
    answer:
      'No. It scores written submissions and is best used alongside mocks with peers, mentors, and professors. Live behavioural signals — composure, listening, body language — are not captured.',
  },
];
const methodologyFaqJsonLd = faqPageJsonLd(METHODOLOGY_FAQS);

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-muted">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologyFaqJsonLd) }}
      />
      <ScrollAnimations />

      {/* Static nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center -ml-2 shrink-0">
            <Logo isLanding />
          </Link>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            <AuthCTA variant="nav" />
          </div>
        </div>
      </nav>

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

        <section className="mt-14" data-reveal>
          <h2 className="text-2xl font-bold text-foreground">How a score is produced</h2>
          <p className="mt-2 text-body text-muted-foreground">
            The same five steps run on every submission, so feedback is consistent rather than dependent on who is reviewing.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['1 · Parse', 'Your answer is read for its structure — the buckets you created, the math you ran, and the recommendation you landed on.'],
              ['2 · Score the rubric', 'Each of the six dimensions is graded against fixed criteria, producing a 0–100 total with per-dimension points.'],
              ['3 · Verify the math', 'For guesstimates and quantitative cases, an arithmetic backstop independently recomputes the numbers and flags inconsistencies.'],
              ['4 · Write feedback', 'You get specific written feedback per dimension — what worked, what was missing, and the single highest-leverage fix.'],
              ['5 · Rank', 'Points are added to your running total and your live percentile against the national pool is updated.'],
            ].map(([t, d]) => (
              <Card key={t} className="p-5">
                <p className="text-strong font-semibold text-foreground">{t}</p>
                <p className="mt-1 text-body leading-relaxed text-muted-foreground">{d}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14" data-reveal>
          <h2 className="text-2xl font-bold text-foreground">The arithmetic backstop</h2>
          <Card className="mt-6 p-6 space-y-4 text-body leading-relaxed text-foreground/80">
            <p>
              A common failure mode in automated scoring is rewarding an answer that <em>sounds</em> rigorous but whose numbers
              do not add up. MECE guards against this with an independent arithmetic backstop: for guesstimates and
              quantitative cases, it recomputes the chain of estimates from your stated assumptions and checks each
              derived step.
            </p>
            <p>
              Stated and base values are used as given; only derived steps with finite inputs are flagged; percentage
              and reference operations are handled explicitly. If nothing can be reliably verified, the system defers to
              the language model rather than inventing a penalty — so your score reflects your reasoning, not a glitch.
            </p>
          </Card>
        </section>

        <section className="mt-14" data-reveal>
          <h2 className="text-2xl font-bold text-foreground">Percentile &amp; the leaderboard</h2>
          <p className="mt-2 text-body text-muted-foreground">
            A score is only useful if you know what it means. Yours is placed in context two ways.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <p className="text-strong font-semibold text-foreground">Live percentile</p>
              <p className="mt-1 text-body leading-relaxed text-muted-foreground">
                Your standing is computed against the active pool of MBA aspirants practising on MECE across India — a
                moving benchmark, not a fixed curve.
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-strong font-semibold text-foreground">Points &amp; milestones</p>
              <p className="mt-1 text-body leading-relaxed text-muted-foreground">
                Every submission and GD brief earns points that ladder you up a milestone path, so consistent practice
                shows up as visible progress — not just a single number.
              </p>
            </Card>
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

        <section className="mt-14" data-reveal>
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            <HelpCircle className="h-4 w-4" /> FAQ
          </div>
          <h2 className="text-2xl font-bold text-foreground">Questions about scoring</h2>
          <div className="mt-6 space-y-3">
            {METHODOLOGY_FAQS.map((faq) => (
              <details key={faq.question} className="bg-card border border-border rounded-xl p-5 group">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-base font-semibold text-foreground">
                  {faq.question}
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-body text-muted-foreground leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 flex justify-center">
          <Link href="/signup">
            <button className="btn-primary">
              Start practicing
            </button>
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
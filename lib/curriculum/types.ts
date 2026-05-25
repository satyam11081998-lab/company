/* ================================================================
   Curriculum Data Types
   Structured interfaces for all 18 learning domains.
   ================================================================ */

/** Leaf or branch in a lesson tree. */
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  children?: Lesson[];
}

/** One module (e.g. D1.1, D4.2) inside a domain. */
export interface Module {
  id: string;       // e.g. "D1.1"
  title: string;    // e.g. "What Is Management Consulting"
  lessons: Lesson[];
}

/** A single case study entry in a practice bank. */
export interface CaseEntry {
  code: string;        // P-01, ME-01, G-01, etc.
  title: string;
  sector: string;
  source?: string;     // BCG, McKinsey, etc.
  problem: string;
  rootCause?: string;
  keyInsight?: string;
  framework?: string;
  resolution?: string;
  math?: string;
  risks?: string;
  breakEven?: string;
  analysis?: string;
  channels?: string;
  targetSegments?: string;
  exitOptions?: string;
  approach?: string;   // for guesstimates: Demand-side, Supply-side, etc.
  result?: string;     // for guesstimates: final answer
  keyAssumptions?: string;
  valuePricing?: string;
  hiddenCost?: string;
  features?: string;
}

/** A guesstimate entry. */
export interface GuessEntry {
  code: string;        // G-01 to G-69
  title: string;
  approach: string;    // Demand-side | Supply-side | Projection | etc.
  keyDetail?: string;  // Key assumptions or method
  result: string;      // Final answer
}

/** Company profile for D14. */
export interface CompanyProfile {
  name: string;
  founded: string;
  revenue: string;
  presence?: string;
  vision?: string;
  mission?: string;
  purpose?: string;
  values: string[];
  csr?: string[];
  keyProducts?: string;
  subsidiaries?: string;
  sectors?: string;
  chairman?: string;
  employees?: string;
  marketCap?: string;
  extra?: string;
}

/** Quiz question type example. */
export interface QuizType {
  code: string;
  name: string;
  example: string;
  answer?: string;
  explanation?: string;
}

/** One flashcard deck. */
export interface FlashcardDeck {
  name: string;
  cardCount: string;
}

/** Learning path (Path A-E). */
export interface LearningPath {
  id: string;        // "A" | "B" | "C" | "D" | "E"
  title: string;
  duration: string;  // "6 weeks" | "4 weeks" etc.
  weeks: { week: string; content: string }[];
  milestone: string;
}

/** A single content domain (D1-D18). */
export interface Domain {
  code: string;           // D1, D2, ..., D18
  slug: string;           // URL slug: "consulting-foundations"
  title: string;          // "Consulting Foundations"
  fullTitle: string;      // "D1 | CONSULTING FOUNDATIONS"
  level: string;          // "Beginner", "Intermediate", etc.
  prereqs: string;        // "None", "D1", "D2, D3.1", etc.
  tags: string[];
  modules: Module[];
  cases?: CaseEntry[];
  guesstimates?: GuessEntry[];
  companies?: CompanyProfile[];
  quizOpportunities?: string;
  diagramOpportunity?: string;
  flashcardOpportunities?: string;
  notes?: string;
  // Section 4 deep-dive sectors (for D18 or standalone)
  sectors?: string[];
  // GD topics (for D13)
  gdTopics?: {
    caseBased?: string[];
    tasEthics?: string[];
    abstract?: string[];
  };
  // Behavioral questions (for D12)
  questionBank?: {
    category: string;
    questions: string[];
  }[];
  // Amazon LPs (for D12)
  amazonLPs?: string[];
  // Resource repository (for D14)
  resources?: { category: string; items: string[] }[];
  // Benchmarks (for D17)
  benchmarkSections?: { title: string; stats: string[] }[];
  // SaaS benchmarks (for D16)
  saasBenchmarks?: string[];
  // Assessment (for D18)
  quizTypes?: QuizType[];
  flashcardDecks?: FlashcardDeck[];
  // Case competition summaries
  competitionSummaries?: CaseEntry[];
  // Customer satisfaction cases
  customerSatCases?: CaseEntry[];
}

/** Platform overview stats from Section 1. */
export interface PlatformStats {
  totalModules: number;
  totalLessons: string;
  caseLibrary: string;
  guesstimatBank: string;
  frameworkLibrary: string;
  interviewBank: string;
  gdBank: string;
  companyIntel: string;
}

/** Visualization inventory item */
export interface VisualizationItem {
  code: string;
  name: string;
}

/** Content gap */
export interface ContentGap {
  code: string;
  title: string;
  existing?: string;
  missing: string;
  priority: string;
}

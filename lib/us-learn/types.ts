/**
 * US Learn library — content model (2026-09-27).
 *
 * Public, server-rendered teaching pages at /us/learn/<slug> for the US and
 * Europe audience: consulting candidates AND anyone interviewing for (or doing)
 * a business role. One typed record per page; the renderer, the JSON-LD, the
 * sitemap, llms.txt and llms-full.txt all read the same record, so what a
 * search engine or an AI assistant sees can never drift from what a person
 * reads.
 *
 * EDITORIAL RULES (see docs/growth-us/MASTER_PROMPT.md):
 *   1. Answer first. `answer` is 40–60 words and stands alone when quoted.
 *   2. Every H2 is a question people type; its first sentence answers it.
 *   3. Worked examples use fictional companies and are labelled illustrative.
 *      Every calculation is checked (scripts/check-us-learn.mjs).
 *   4. Real-world numbers carry a source + year in `sources`.
 *   5. No invented statistics, testimonials, experts or firm endorsements.
 *
 * Inline markup allowed in any `md` string: **bold** and [text](/path or url).
 * Nothing else — no raw HTML. Use "×" for multiplication, never "*".
 */

import type { UsCaseType } from '@/lib/us-market/types';

export type LearnCluster = 'foundations' | 'frameworks' | 'roles';

export type LearnBlock =
  | { t: 'p'; md: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'steps'; items: { title: string; md: string }[] }
  | { t: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { t: 'callout'; tone: 'tip' | 'warn' | 'example'; title: string; md: string }
  /** An issue tree: the question, then MECE branches, each with optional leaves. */
  | { t: 'tree'; root: string; branches: { label: string; leaves?: string[] }[]; caption?: string }
  /** Worked arithmetic, one line per step. Checked by the content script. */
  | { t: 'math'; title?: string; lines: string[] }
  | { t: 'dialogue'; turns: { who: 'Interviewer' | 'Candidate'; md: string }[] };

export interface LearnSection {
  /** URL fragment, unique within the page. */
  id: string;
  /** Question-shaped H2. */
  h: string;
  blocks: LearnBlock[];
}

export interface LearnSource {
  label: string;
  url: string;
  /** What the source supports, and its date. */
  note: string;
}

export interface LearnFaq {
  q: string;
  a: string;
}

export interface LearnPage {
  slug: string;
  cluster: LearnCluster;
  /** Short label for cards and breadcrumbs. */
  nav: string;
  /** The visible H1. */
  title: string;
  /** <title> — absolute, ≤ ~65 chars. */
  metaTitle: string;
  /** Meta description, ≤ ~160 chars. */
  description: string;
  /** Badge on the /og card. */
  ogKind: 'concept' | 'framework' | 'toolkit';
  eyebrow: string;
  /** The 40–60 word answer an engine can quote whole. */
  answer: string;
  takeaways: string[];
  sections: LearnSection[];
  faqs: LearnFaq[];
  /** Case types from the US bank to offer as practice (first matches by code order). */
  practice: { caseTypes?: UsCaseType[]; caseCodes?: string[]; sizing?: number };
  /** Slugs of related Learn pages. */
  related: string[];
  sources?: LearnSource[];
  keywords: string[];
  /** ISO dates. `modified` feeds dateModified, the sitemap and the visible date. */
  published: string;
  modified: string;
  /** Optional India twin for hreflang (the page is a regional equivalent). */
  indiaTwin?: string;
}

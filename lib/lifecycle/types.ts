/**
 * Shared shapes for the lifecycle mail.
 *
 * These live in a plain module, not in the admin's `'use server'` file, for one
 * reason: a 'use server' module is an RPC boundary and Next requires every
 * export in it to be an async function. Interfaces are erased before that check
 * today, so exporting them from there happens to work — but it is a rule waiting
 * to be enforced, and a client component importing a type from a server-action
 * file reads as though it were importing the action. Types belong here; actions
 * belong there.
 *
 * Safe to import from a client component: nothing here exists at runtime.
 */
import type { ContentMarket } from '@/lib/market';
import type { LifecycleMode, LifecycleSettings, RunRecord } from './settings';
import type { Check, Verdict } from './deliverability';

/** What one market's digest or nudge run did. */
export interface MarketOutcome {
  market: ContentMarket;
  /** False when the run was gated out — see `skipped` for why. */
  ran: boolean;
  skipped?: string;
  audience: 'test' | 'live' | 'none';
  recipients: number;
  sent: number;
  failed: number;
  /** Already queued today, so not sent again. */
  duplicate: number;
  /** On the CRM privacy blocklist — erased on request, never to be written to. */
  suppressed: number;
  /** Trimmed off by the per-run ceiling or the nudge cap. */
  capped?: number;
  subject?: string;
  error?: string;
}

export interface LifecycleRunResult {
  mode: LifecycleMode;
  digests: MarketOutcome[];
  nudges: MarketOutcome[];
}

/** One lifecycle email's 30-day numbers. */
export interface Funnel {
  source: string;
  queued: number;
  sent: number;
  failed: number;
  suppressed: number;
  clicked: number;
  unsubscribed: number;
}

export interface BucketCount {
  kind: string;
  label: string;
  count: number;
}

/**
 * The cheap half of the admin screen: three indexed queries and no model calls,
 * so the page paints immediately.
 */
export interface LifecycleOverview {
  settings: LifecycleSettings;
  hours: { in: number; us: number };
  lastDigest: Record<'IN' | 'US', RunRecord | null>;
  lastNudge: Record<'IN' | 'US', RunRecord | null>;
  funnels: Funnel[];
  tablesMissing?: boolean;
}

/**
 * The expensive half, fetched after the page is on screen: DNS lookups, the
 * behavioural segmentation, and a digest build per market just to show tonight's
 * subject line.
 */
export interface LifecycleInsights {
  buckets: Record<'IN' | 'US', BucketCount[]>;
  deliverability: { domain: string; verdict: Verdict; checks: Check[] };
  previewSubjects: Record<'IN' | 'US', string | null>;
}

/** One pending upgrade email, as the reviewer sees it. */
export interface UpgradeDraft {
  id: string;
  to: string;
  name: string | null;
  subject: string;
  html: string;
  segment: string;
  label: string;
  /** The recipient's own numbers that put them in this segment. */
  why: string;
  createdAt: string;
}

/** A dry count of who would be written to, with one sample per segment. */
export interface UpgradeScan {
  total: number;
  segments: Array<{ segment: string; label: string; count: number; sampleSubject: string; sampleHtml: string; sampleWhy: string }>;
}

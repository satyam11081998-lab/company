/**
 * BROADCAST AUDIENCE — which market an admin email goes to (2026-10-02).
 *
 * Pure (no Node, no DOM, no Supabase) so the composer (browser) and the send
 * action (server) apply the SAME rule, and scripts/test-broadcast-audience.mjs
 * can check it without a database.
 *
 *   'IN'  India accounts.
 *   'US'  US + Europe accounts. Europe practises the US bank, so the two are
 *         one audience for practice email (lib/market.ts contentMarketOf).
 *   'all' Everyone.
 *
 * WHY THE MARKET OF THE LINKS MATTERS
 * A case belongs to one bank (cases.market) and an account may only open its
 * own bank's cases (backend services/markets.assert_market_access → 403 "This
 * case isn't available in your region"). So an email carrying India practice
 * links is useless to a US account, and the reverse. `audienceProblem` is the
 * one check, run in the composer before the button is enabled and again on the
 * server before anything is sent.
 */

import { contentMarketOf, type ContentMarket } from './market';

export type Audience = ContentMarket | 'all';

export const AUDIENCES: readonly Audience[] = ['IN', 'US', 'all'] as const;

export const MARKET_LABEL: Record<ContentMarket, string> = { IN: 'India', US: 'US & Europe' };

export function isAudience(v: unknown): v is Audience {
  return v === 'IN' || v === 'US' || v === 'all';
}

/** Server-side parse of an untrusted audience value. */
export function parseAudience(v: unknown): Audience {
  if (isAudience(v)) return v;
  throw new Error('Choose who this goes to: India, US & Europe, or both.');
}

/** Server-side parse of an optional content market ('IN' | 'US'); empty → undefined. */
export function parseContentMarket(v: unknown): ContentMarket | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (v === 'IN' || v === 'US') return v;
  throw new Error('Unknown practice market.');
}

/** Does an account (by its users.market value) belong to the audience? NULL / unknown → India. */
export function inAudience(userMarket: unknown, audience: Audience): boolean {
  return audience === 'all' || contentMarketOf(userMarket) === audience;
}

/**
 * Why this email must not go to this audience, or null when it may.
 * `linkMarkets` = the markets of the practice links in the email (empty for a
 * plain announcement). One person (`audience` = that person's market) uses the
 * same rule.
 */
export function audienceProblem(audience: Audience, linkMarkets: readonly ContentMarket[]): string | null {
  const markets = Array.from(new Set(linkMarkets));
  if (markets.length > 1) {
    return 'This email mixes India and US & Europe practice links. Remove one set: each market can only open its own cases.';
  }
  const content = markets[0];
  if (!content || audience === content) return null;
  const other: ContentMarket = content === 'IN' ? 'US' : 'IN';
  if (audience === 'all') {
    return `This email links to ${MARKET_LABEL[content]} practice, which ${MARKET_LABEL[other]} users can’t open. Send it to ${MARKET_LABEL[content]} only.`;
  }
  return `This email links to ${MARKET_LABEL[content]} practice, but the audience is ${MARKET_LABEL[audience]}. Rebuild it for ${MARKET_LABEL[audience]}, or switch the audience back.`;
}

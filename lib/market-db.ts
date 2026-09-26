import type { ContentMarket } from '@/lib/market';

/**
 * Market-scoped query helper with DEPLOY-ORDER SAFETY.
 *
 * Every listing of `cases` is filtered to one bank (`cases.market`, migration
 * 0070) so an India account never sees a US case and vice versa. Before 0070
 * has run the column does not exist and PostgREST rejects the filter. In that
 * window every row IS India content, so:
 *   - India → re-run the query without the filter (exactly today's behaviour)
 *   - US    → return an empty list (there is no US content yet)
 * Any other error is returned untouched for the caller to handle as before.
 */

type Res = { data: any; error: any; count?: number | null };

export function isMissingMarketColumn(err: { message?: string; code?: string; details?: string } | null | undefined): boolean {
  if (!err) return false;
  const m = `${err.message || ''} ${err.details || ''}`.toLowerCase();
  return (err.code === '42703' || err.code === 'PGRST204' || m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find'))
    && m.includes('market');
}

/** For LIST queries (the empty fallback is `[]`). */
export async function marketScoped<R extends Res>(
  market: ContentMarket,
  withFilter: () => PromiseLike<R>,
  withoutFilter: () => PromiseLike<R>,
): Promise<R> {
  const r = await withFilter();
  if (r && r.error && isMissingMarketColumn(r.error)) {
    if (market === 'IN') return withoutFilter();
    return { ...r, data: [], error: null } as R; // list queries only
  }
  return r;
}

/**
 * Scope a query on `users` (or on a `users!inner` embed) to one market's
 * accounts. India includes NULL (an account not stamped yet is India until
 * proven otherwise — the same default everywhere else).
 */
export function scopeUsersToMarket<Q>(q: Q, market: ContentMarket, embed?: 'users'): Q {
  const qq = q as any;
  if (market === 'US') {
    return qq.in(embed ? `${embed}.market` : 'market', ['US', 'EU']);
  }
  return embed
    ? qq.or('market.is.null,market.eq.IN', { referencedTable: embed })
    : qq.or('market.is.null,market.eq.IN');
}

/**
 * Run a cross-user aggregate scoped to a market, deploy-order safe: builds the
 * query with the scope; if the column is missing (pre-0070) India re-runs it
 * unscoped (every account is India then) and the US gets an empty result.
 */
export async function runMarketScoped<R extends Res>(
  market: ContentMarket,
  build: (scoped: boolean) => PromiseLike<R>,
): Promise<R> {
  const r = await build(true);
  if (r && r.error && isMissingMarketColumn(r.error)) {
    if (market === 'IN') return build(false);
    return { ...r, data: [], count: 0, error: null } as R;
  }
  return r;
}

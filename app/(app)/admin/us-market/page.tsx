import Link from 'next/link';
import { cookies } from 'next/headers';
import { Globe, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createServiceClient } from '@/lib/supabase/service';
import { ADMIN_PREVIEW_COOKIE } from '@/lib/admin-preview';
import { isMissingMarketColumn } from '@/lib/market-db';
import { formatMinor } from '@/lib/market';
import { INTL_TIER_PRICING } from '@/lib/pricing-intl';

/**
 * /admin/us-market — the admin's window onto the US / Europe version.
 * The (app)/admin layout already refuses non-admins.
 *
 *  - Links to every public US page (what a US visitor or Google sees).
 *  - "View the app as a US user": the display-only preview in
 *    lib/admin-preview.ts (US nav, US case bank, US daily, USD plans).
 *  - A read-only health panel: US bank size, today's US daily pair and how
 *    many accounts sit in each market. Every read is defensive — before
 *    migration 0070 runs it says so instead of erroring.
 */
export const dynamic = 'force-dynamic';

type Health =
  | { ok: false; reason: string }
  | {
      ok: true;
      usCases: number;
      usGuesstimates: number;
      accounts: { IN: number; US: number; EU: number; unstamped: number };
      daily: { date: string; items: { id: string; title: string; type: string }[] } | null;
    };

async function loadHealth(): Promise<Health> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, reason: 'Service role key is not configured here.' };
  try {
    const svc = createServiceClient();
    const count = async (q: any): Promise<number> => {
      const { count: n, error } = await q;
      if (error) throw error;
      return n ?? 0;
    };
    const cases = () => svc.from('cases').select('id', { count: 'exact', head: true }).eq('market', 'US').eq('is_active', true);
    const users = () => svc.from('users').select('id', { count: 'exact', head: true });
    const [usCases, usGuesstimates, IN, US, EU, unstamped] = await Promise.all([
      count(cases().neq('type', 'guesstimate')),
      count(cases().eq('type', 'guesstimate')),
      count(users().eq('market', 'IN')),
      count(users().eq('market', 'US')),
      count(users().eq('market', 'EU')),
      count(users().is('market', null)),
    ]);

    let daily: { date: string; items: { id: string; title: string; type: string }[] } | null = null;
    const { data: sched } = await svc
      .from('market_daily_schedule')
      .select('scheduled_date, case_id, guesstimate_id')
      .eq('market', 'US')
      .order('scheduled_date', { ascending: false })
      .limit(1);
    const row = (sched ?? [])[0] as { scheduled_date: string; case_id: string | null; guesstimate_id: string | null } | undefined;
    if (row) {
      const ids = [row.case_id, row.guesstimate_id].filter(Boolean) as string[];
      const { data: items } = ids.length
        ? await svc.from('cases').select('id, title, type').in('id', ids)
        : { data: [] as { id: string; title: string; type: string }[] };
      daily = { date: row.scheduled_date, items: (items ?? []) as { id: string; title: string; type: string }[] };
    }
    return { ok: true, usCases, usGuesstimates, accounts: { IN, US, EU, unstamped }, daily };
  } catch (e) {
    if (isMissingMarketColumn(e as { message?: string; code?: string })) {
      return { ok: false, reason: 'Migration 0070 has not run yet — run supabase/migrations/0070_international_markets.sql, then supabase/seed-us-market.sql.' };
    }
    const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
    return { ok: false, reason: msg };
  }
}

const PUBLIC_PAGES = [
  { href: '/us', label: 'US home', note: 'What US / Europe visitors land on' },
  { href: '/us/pricing', label: 'US pricing', note: 'USD / EUR plans' },
  { href: '/us/case-interview-examples', label: 'Case interview examples', note: 'SEO page — 50 US cases' },
  { href: '/us/market-sizing-questions', label: 'Market sizing questions', note: 'SEO page — 50 US guesstimates' },
];

const APP_PAGES = [
  { href: '/practice', label: 'Practice hub' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard (US & Europe)' },
  { href: '/upgrade/intl', label: 'Upgrade page (USD)' },
];

export default async function UsMarketAdminPage() {
  const previewOn = cookies().get(ADMIN_PREVIEW_COOKIE)?.value === 'US';
  const health = await loadHealth();
  const p = INTL_TIER_PRICING;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Globe className="h-6 w-6" /> US &amp; Europe
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the international version exactly as a US visitor or US account sees it.
        </p>
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">View the app as a US user</h2>
            <p className="text-sm text-muted-foreground">
              Switches the app to the US nav, US case bank, US daily and USD plans for your browser only (12 hours).
              Your account stays India and nothing is charged — checkout is disabled while previewing.
            </p>
          </div>
          <form method="post" action="/api/admin/us-preview">
            <input type="hidden" name="mode" value={previewOn ? 'off' : 'on'} />
            <input type="hidden" name="to" value={previewOn ? '/admin/us-market' : '/practice'} />
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                previewOn ? 'border border-border bg-card text-foreground hover:bg-muted' : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {previewOn ? <><EyeOff className="h-4 w-4" /> Exit US preview</> : <><Eye className="h-4 w-4" /> Start US preview</>}
            </button>
          </form>
        </div>
        {previewOn && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {APP_PAGES.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-foreground">Public US pages</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {PUBLIC_PAGES.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener"
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted"
              >
                <span>
                  <span className="block text-sm font-semibold text-foreground">{l.label}</span>
                  <span className="block text-xs text-muted-foreground">mece.in{l.href} · {l.note}</span>
                </span>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Visitors from the US or Europe are sent here automatically; from India you can open these links directly.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-foreground">Prices</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {(['lite', 'pro'] as const).map((t) => (
            <div key={t} className="rounded-lg border border-border p-3">
              <p className="font-semibold capitalize text-foreground">{t}</p>
              <p className="text-muted-foreground">
                {formatMinor(p.USD[t].monthly * 100, 'USD')} / {formatMinor(p.EUR[t].monthly * 100, 'EUR')} per month ·{' '}
                {formatMinor(p.USD[t].quarter * 100, 'USD')} / {formatMinor(p.EUR[t].quarter * 100, 'EUR')} for 3 months
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-foreground">Health</h2>
        {!health.ok ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">{health.reason}</p>
        ) : (
          <div className="space-y-3 text-sm">
            <p>
              <b>US bank:</b> {health.usCases} cases · {health.usGuesstimates} guesstimates
              {health.usCases + health.usGuesstimates === 0 && (
                <span className="text-amber-700 dark:text-amber-300"> — run supabase/seed-us-market.sql</span>
              )}
            </p>
            <p>
              <b>Accounts:</b> India {health.accounts.IN} · US {health.accounts.US} · Europe {health.accounts.EU}
              {health.accounts.unstamped > 0 && <> · not yet stamped {health.accounts.unstamped}</>}
            </p>
            <div>
              <b>Latest US daily:</b>{' '}
              {health.daily ? (
                <>
                  {health.daily.date}
                  <ul className="mt-1 list-disc pl-5">
                    {health.daily.items.map((c) => (
                      <li key={c.id}>
                        {c.type === 'guesstimate' ? 'Guesstimate' : 'Case'}: {c.title}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <span className="text-amber-700 dark:text-amber-300">none yet — run the “US Daily Case” GitHub Action once</span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

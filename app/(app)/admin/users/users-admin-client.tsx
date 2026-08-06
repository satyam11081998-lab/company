'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UsersRound, Search, X, ShieldCheck, FlaskConical, LogOut,
  CheckCircle2, XCircle, ChevronRight,
} from 'lucide-react';
import { getUserDetail, setDemoFlag, revokeAllSessions } from './actions';
import type { UserDetail } from './types';

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  points: number;
  streak: number;
  tier: string;
  expiresAt: string | null;
  isAdmin: boolean;
  isDemo: boolean;
  college: string | null;
  batchYear: number | null;
  linkedinUrl: string | null;
  onboarded: boolean;
}

export interface SignupBucket {
  date: string;
  count: number;
}

type TierFilter = 'all' | 'pro' | 'lite' | 'free' | 'demo';

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

const dayLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function TierPill({ tier }: { tier: string }) {
  const cls =
    tier === 'pro' ? 'bg-primary/10 text-primary'
    : tier === 'lite' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    : 'bg-muted text-muted-foreground';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {tier}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{value ?? '—'}</dd>
    </div>
  );
}

export default function UsersAdminClient({
  users,
  signups,
  truncated,
  loadError,
}: {
  users: AdminUserRow[];
  signups: SignupBucket[];
  truncated: boolean;
  loadError: string | null;
}) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<TierFilter>('all');
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailFor, setDetailFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const stats = useMemo(() => {
    // "Today" and "this week" are read straight off the SAME IST day buckets
    // the chart draws, rather than from a rolling 24h/168h window. Two numbers
    // on one screen that disagree because they use different clocks is worse
    // than either number being slightly coarser.
    const sum = (n: number) => signups.slice(-n).reduce((a, s) => a + s.count, 0);
    return {
      total: users.length,
      today: sum(1),
      week: sum(7),
      paid: users.filter((u) => u.tier === 'pro' || u.tier === 'lite').length,
    };
  }, [users, signups]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === 'demo' && !u.isDemo) return false;
      if (filter !== 'all' && filter !== 'demo' && u.tier !== filter) return false;
      if (!needle) return true;
      return (
        (u.name || '').toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        (u.college || '').toLowerCase().includes(needle) ||
        (u.linkedinUrl || '').toLowerCase().includes(needle)
      );
    });
  }, [users, q, filter]);

  const peak = Math.max(1, ...signups.map((s) => s.count));
  const windowTotal = signups.reduce((a, s) => a + s.count, 0);

  async function open(userId: string) {
    setDetailFor(userId);
    setDetail(null);
    setLog(null);
    const res = await getUserDetail(userId);
    if (res.success && res.data) setDetail(res.data);
    else setLog({ type: 'error', message: res.error || 'Could not load user.' });
  }

  async function toggleDemo() {
    if (!detail) return;
    setBusy(true);
    const res = await setDemoFlag(detail.id, !detail.isDemo);
    if (res.success) {
      setDetail({ ...detail, isDemo: !detail.isDemo });
      setLog({
        type: 'success',
        message: !detail.isDemo
          ? 'Flagged as a demo account. Hidden from the leaderboard and all cohort stats.'
          : 'Demo flag removed. This account now counts like any other.',
      });
    } else {
      setLog({ type: 'error', message: res.error || 'Failed.' });
    }
    setBusy(false);
  }

  async function signOutEverywhere() {
    if (!detail) return;
    setBusy(true);
    const res = await revokeAllSessions(detail.id);
    setLog(res.success
      ? { type: 'success', message: `Signed out ${res.data?.count ?? 0} live session(s). They can log in again immediately.` }
      : { type: 'error', message: res.error || 'Failed.' });
    if (res.success) setDetail({ ...detail, sessions: detail.sessions.map((s) => ({ ...s, revokedAt: s.revokedAt ?? new Date().toISOString() })) });
    setBusy(false);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-display-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-primary" />
          Users
        </h1>
        <p className="text-body text-muted-foreground mt-2">
          Everyone who has signed up, newest first. Click a row for the full record.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load users: {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total users', value: stats.total },
          { label: 'Joined today', value: stats.today },
          { label: 'Joined this week', value: stats.week },
          { label: 'On a paid plan', value: stats.paid },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Signups per day */}
      <Card className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Signups, last 30 days</h2>
          <span className="text-sm text-muted-foreground">
            <b className="text-foreground tabular-nums">{windowTotal}</b> in this window
          </span>
        </div>

        {windowTotal === 0 ? (
          // An explicit empty state. A row of 2%-tall slivers is
          // indistinguishable from a broken chart, which is exactly how this
          // read before — say "nothing here" rather than draw nothing.
          <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No signups in the last 30 days.
            {stats.total > 0 && <> All {stats.total} accounts are older than that.</>}
          </div>
        ) : (
          <>
            <div className="mt-5 flex h-32 items-end gap-1">
              {signups.map((s) => (
                <div
                  key={s.date}
                  className="group relative flex h-full flex-1 items-end"
                  title={`${dayLabel(s.date)} · ${s.count} signup${s.count === 1 ? '' : 's'}`}
                >
                  <div
                    className={`w-full rounded-t transition-colors ${
                      s.count > 0
                        ? 'bg-primary/70 group-hover:bg-primary'
                        : 'bg-border group-hover:bg-muted-foreground/40'
                    }`}
                    // Non-zero days get a floor of 8% so a single signup is
                    // still visibly a bar; empty days keep a 2% baseline so the
                    // axis stays readable.
                    style={{ height: s.count > 0 ? `${Math.max(8, (s.count / peak) * 100)}%` : '2%' }}
                  />
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{dayLabel(signups[0]?.date ?? '')}</span>
              <span>Peak {peak}/day</span>
              <span>{dayLabel(signups[signups.length - 1]?.date ?? '')} (today)</span>
            </div>
          </>
        )}
      </Card>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, college or LinkedIn"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-border p-1">
          {(['all', 'pro', 'lite', 'free', 'demo'] as TierFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-left font-medium">College</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-right font-medium">Points</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => open(u.id)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      {u.name || '—'}
                      {u.isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-label="Admin" />}
                      {u.isDemo && <FlaskConical className="h-3.5 w-3.5 text-amber-600" aria-label="Demo account" />}
                    </span>
                    <span className="block text-xs text-muted-foreground">{u.email}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{dateTime(u.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.college || '—'}
                    {u.batchYear ? <span className="block text-xs">Batch {u.batchYear}</span> : null}
                  </td>
                  <td className="px-4 py-3"><TierPill tier={u.tier} /></td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{u.points.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-3 text-muted-foreground"><ChevronRight className="h-4 w-4" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No users match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {truncated && (
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Showing the 1,000 most recent accounts. Older accounts are not listed.
          </p>
        )}
      </Card>

      {log && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${
          log.type === 'success'
            ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
            : 'border-destructive/20 bg-destructive/10 text-destructive'
        }`}>
          {log.type === 'success'
            ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <div className="text-sm font-medium">{log.message}</div>
        </div>
      )}

      {/* Detail drawer */}
      {detailFor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => { setDetailFor(null); setDetail(null); }}>
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {detail ? (detail.name || detail.email) : 'Loading…'}
                </h2>
                {detail && <p className="text-sm text-muted-foreground">{detail.email}</p>}
              </div>
              <button onClick={() => { setDetailFor(null); setDetail(null); }} aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!detail ? (
              <p className="text-sm text-muted-foreground">Loading full record…</p>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <TierPill tier={detail.tier} />
                  {detail.isAdmin && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">admin</span>}
                  {detail.isDemo && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">demo</span>}
                  {!detail.onboardedAt && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">onboarding incomplete</span>}
                </div>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Identity &amp; contact</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <Field label="Display name" value={detail.name} />
                    <Field label="Full name" value={detail.fullName} />
                    <Field label="Email" value={detail.email} />
                    <Field label="Phone" value={detail.phone} />
                    <Field label="College email" value={
                      detail.collegeEmail
                        ? `${detail.collegeEmail}${detail.collegeEmailVerifiedAt ? ' (verified)' : ' (unverified)'}`
                        : null} />
                    <Field label="LinkedIn" value={
                      detail.linkedinUrl
                        ? <a href={detail.linkedinUrl} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">{detail.linkedinUrl}</a>
                        : null} />
                    <Field label="User id" value={<code className="text-xs">{detail.id}</code>} />
                    <Field label="Found us via" value={detail.referralSource} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Profile</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <Field label="College" value={detail.collegeName || detail.collegeOther} />
                    <Field label="Batch" value={detail.batchYear} />
                    <Field label="Placement focus" value={detail.placementFocus} />
                    <Field label="Weekly hours target" value={detail.weeklyHoursTarget} />
                    <Field label="Goal" value={detail.goalText} />
                    <Field label="LinkedIn perk claimed" value={detail.linkedinFollowClaimedAt ? dateTime(detail.linkedinFollowClaimedAt) : 'No'} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Account</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <Field label="Joined" value={dateTime(detail.createdAt)} />
                    <Field label="Onboarded" value={detail.onboardedAt ? dateTime(detail.onboardedAt) : 'Never'} />
                    <Field label="Plan started" value={detail.subStartedAt ? dateTime(detail.subStartedAt) : '—'} />
                    <Field label="Plan expires" value={detail.subExpiresAt ? dateTime(detail.subExpiresAt) : 'No expiry'} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Activity</h3>
                  <dl className="grid grid-cols-3 gap-4">
                    <Field label="Points" value={detail.points.toLocaleString('en-IN')} />
                    <Field label="Streak" value={`${detail.streak} days`} />
                    <Field label="Submissions" value={detail.submissionCount} />
                    <Field label="Average score" value={detail.avgScore ?? '—'} />
                    <Field label="Best score" value={detail.bestScore ?? '—'} />
                    <Field label="Last active" value={detail.lastActiveAt ? dateTime(detail.lastActiveAt) : 'Never'} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Payments {detail.payments.length > 0 && <span className="text-muted-foreground">({detail.payments.length})</span>}
                  </h3>
                  {detail.payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payments.</p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.payments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                          <span>
                            <span className="font-medium capitalize text-foreground">{p.tier}</span>
                            <span className="ml-2 text-muted-foreground">{dateTime(p.createdAt)}</span>
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="tabular-nums text-foreground">{rupees(p.amountPaise)}</span>
                            <span className="text-xs uppercase text-muted-foreground">{p.status}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {detail.couponsUsed.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Coupons used</h3>
                    <ul className="space-y-2">
                      {detail.couponsUsed.map((c) => (
                        <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                          <span className="font-mono text-foreground">{c.code}</span>
                          <span className="text-muted-foreground">
                            {c.tier} · {c.period} · paid {rupees(c.paidPaise)} · saved {rupees(c.discountPaise)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Sessions &amp; devices</span>
                    <Button variant="outline" size="sm" disabled={busy} onClick={signOutEverywhere}>
                      <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out everywhere
                    </Button>
                  </h3>
                  {detail.sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No session records yet. Sessions are recorded from the first login after migration 0044.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.sessions.map((s) => (
                        <li key={s.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-foreground">{s.deviceLabel || 'Unknown device'}</span>
                            <span className={`text-xs font-medium ${s.revokedAt ? 'text-muted-foreground' : 'text-green-700 dark:text-green-400'}`}>
                              {s.revokedAt ? 'signed out' : 'active'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[s.city, s.region, s.country].filter(Boolean).join(', ') || 'Location unknown'}
                            {s.ip ? ` · ${s.ip}` : ''} · last seen {dateTime(s.lastSeenAt)}
                          </p>
                          {s.userAgent && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.userAgent}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {detail.recentSubmissions.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Recent submissions</h3>
                    <ul className="space-y-1.5">
                      {detail.recentSubmissions.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate text-foreground">{s.caseTitle}</span>
                          <span className="shrink-0 text-muted-foreground">
                            {s.score ?? '—'} · {dateTime(s.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Demo account</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A demo account works normally but is hidden from the public leaderboard, the
                    aspirant headcount, the cohort benchmark and the live activity tape.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" disabled={busy} onClick={toggleDemo}>
                    <FlaskConical className="mr-1 h-3.5 w-3.5" />
                    {detail.isDemo ? 'Remove demo flag' : 'Flag as demo account'}
                  </Button>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

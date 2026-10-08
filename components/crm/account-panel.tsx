'use client';

/**
 * "MECE account" panel on a contact (MECE admins only) — what the old admin
 * Users drawer showed and did: plan, flags, market, sessions and devices,
 * coupons, recent submissions; demo flag, market switch, sign out everywhere.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { acctDetail, acctSetDemo, acctSetMarket, acctSignOutAll } from '@/app/(app)/crm/account-actions';
import type { AccountDetail } from '@/lib/crm/server/account';
import { Button, Card, Skeleton, fmtDate } from './ui';

const rupees = (paise: number) => `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;

export default function AccountPanel({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<AccountDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = async () => {
    const r = await acctDetail(recordId);
    if (r.ok) { setD(r.data); setErr(null); } else setErr(r.error);
  };
  const toggle = () => { const next = !open; setOpen(next); if (next && !d) void load(); };
  const after = async (msg: string) => { toast.success(msg); await load(); router.refresh(); };
  return (
    <Card>
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MECE account (admins)</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 animate-in fade-in-0 duration-200 motion-reduce:animate-none">
          {err ? <p className="text-sm text-destructive">{err}</p> : !d ? (
            <div className="space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-16 w-full" /></div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-navy dark:text-white">{d.tier}</span>
                {d.isAdmin && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">admin</span>}
                {d.isDemo && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold uppercase">demo</span>}
                {!d.onboardedAt && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase text-muted-foreground">onboarding incomplete</span>}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-3">
                {[
                  ['Joined', fmtDate(d.createdAt)], ['Onboarded', d.onboardedAt ? fmtDate(d.onboardedAt) : 'Never'], ['Plan started', d.subStartedAt ? fmtDate(d.subStartedAt) : '—'],
                  ['Plan expires', d.subExpiresAt ? fmtDate(d.subExpiresAt) : 'No expiry'], ['College email', d.collegeEmail ? `${d.collegeEmail}${d.collegeEmailVerifiedAt ? ' (verified)' : ' (unverified)'}` : '—'], ['Weekly hours target', d.weeklyHoursTarget ?? '—'],
                  ['Goal', d.goalText ?? '—'], ['LinkedIn perk claimed', d.linkedinFollowClaimedAt ? fmtDate(d.linkedinFollowClaimedAt) : 'No'], ['Points · streak', `${d.points.toLocaleString('en-IN')} · ${d.streak} days`],
                  ['Submissions', d.submissionCount], ['Average · best score', `${d.avgScore ?? '—'} · ${d.bestScore ?? '—'}`], ['User id', <code key="id" className="text-[11px]">{d.userId}</code>],
                ].map(([k, v]) => <div key={String(k)}><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5 break-words">{v}</dd></div>)}
              </dl>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <label className="flex items-center gap-2 text-xs">Market
                  <select className="h-7 rounded-md border border-border bg-background px-2 text-xs" value={d.market ?? 'IN'} aria-label="Account market"
                    onChange={async (e) => { const m = e.target.value; const r = await acctSetMarket(recordId, m); if (!r.ok) return toast.error(r.error); await after(`Market set to ${m}. Prices, case bank and leaderboard switch on their next page load.`); }}>
                    <option value="IN">India</option><option value="US">US</option><option value="EU">Europe</option>
                  </select>
                </label>
                {!d.isAdmin && (
                  <Button small onClick={async () => { const r = await acctSetDemo(recordId, !d.isDemo); if (!r.ok) return toast.error(r.error); await after(!d.isDemo ? 'Flagged as a demo account — hidden from the leaderboard and all stats.' : 'Demo flag removed.'); }}>
                    {d.isDemo ? 'Remove demo flag' : 'Flag as demo account'}
                  </Button>
                )}
                <Button small danger onClick={async () => { if (!confirm('Sign this person out on every device? They can log in again at once.')) return; const r = await acctSignOutAll(recordId); if (!r.ok) return toast.error(r.error); await after(`Signed out ${r.data.count} live session(s).`); }}>
                  Sign out everywhere
                </Button>
              </div>

              <section>
                <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Sessions and devices</h3>
                {!d.sessions.length ? <p className="text-xs text-muted-foreground">No sessions recorded.</p> : (
                  <ul className="space-y-1.5">
                    {d.sessions.map((s) => (
                      <li key={s.id} className="rounded-md border border-border px-2.5 py-1.5 text-xs">
                        <div className="flex justify-between gap-2"><span className="font-medium">{s.deviceLabel || 'Unknown device'}</span><span className={s.revokedAt ? 'text-muted-foreground' : 'text-success'}>{s.revokedAt ? 'signed out' : 'active'}</span></div>
                        <p className="text-muted-foreground">{[s.city, s.region, s.country].filter(Boolean).join(', ') || 'Location unknown'}{s.ip ? ` · ${s.ip}` : ''} · last seen {fmtDate(s.lastSeenAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {d.coupons.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Coupons used</h3>
                  <ul className="space-y-1 text-xs">{d.coupons.map((c) => <li key={c.id} className="flex justify-between gap-2"><span className="font-mono">{c.code}</span><span className="text-muted-foreground">{c.tier} · {c.period} · paid {rupees(c.paidPaise)} · saved {rupees(c.discountPaise)}</span></li>)}</ul>
                </section>
              )}

              {d.recentSubmissions.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Recent submissions</h3>
                  <ul className="space-y-1 text-xs">{d.recentSubmissions.map((s) => <li key={s.id} className="flex justify-between gap-2"><span className="min-w-0 truncate">{s.caseTitle}</span><span className="shrink-0 text-muted-foreground">{s.score ?? '—'} · {fmtDate(s.createdAt)}</span></li>)}</ul>
                </section>
              )}
              <p className="text-[11px] text-muted-foreground">Payments and invoices are in the Deals and Invoices lists below. Account changes are recorded in the audit log.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

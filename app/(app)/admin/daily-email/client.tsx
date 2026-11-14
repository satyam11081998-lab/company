'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check as CheckIcon, ChevronRight, Info, Loader2, Mail, RefreshCw, XCircle } from 'lucide-react';
import { loadInsights, loadOverview, previewDigest, previewNudges, runNow, saveSettings, upgradeDecide, upgradeDrafts, upgradeScan, upgradeTest, upgradeWrite } from './actions';
import type { LifecycleInsights, LifecycleOverview, UpgradeDraft, UpgradeScan } from '@/lib/lifecycle/types';
import type { LifecycleMode, LifecycleSettings } from '@/lib/lifecycle/settings';
import type { Verdict } from '@/lib/lifecycle/deliverability';
import type { ContentMarket } from '@/lib/market';

const MODES: Array<{ v: LifecycleMode; title: string; blurb: string }> = [
  { v: 'off', title: 'Off', blurb: 'The nightly job does nothing. No mail of any kind.' },
  { v: 'manual', title: 'Manual — review', blurb: 'Builds tonight’s mail and sends it only to your test address. Nobody else receives anything.' },
  { v: 'auto', title: 'Auto — live', blurb: 'Sends to every opted-in user in each live market, every night, at the hour below.' },
];

const VERDICT_STYLE: Record<Verdict, { cls: string; Icon: React.FC<{ className?: string }> }> = {
  pass: { cls: 'text-emerald-700', Icon: CheckIcon },
  warn: { cls: 'text-amber-700', Icon: AlertTriangle },
  fail: { cls: 'text-red-700', Icon: XCircle },
  unknown: { cls: 'text-muted-foreground', Icon: Info },
};

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-navy">{title}</h2>
      {sub ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{sub}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border/60 py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {hint ? <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? 'bg-navy' : 'bg-muted-foreground/30'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function DailyEmailClient() {
  const [data, setData] = useState<LifecycleOverview | null>(null);
  const [ins, setIns] = useState<LifecycleInsights | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scan, setScan] = useState<UpgradeScan | null>(null);
  const [drafts, setDrafts] = useState<UpgradeDraft[] | null>(null);
  const [armAll, setArmAll] = useState(false);
  const [preview, setPreview] = useState<{ title: string; subject?: string; html: string } | null>(null);
  const [draft, setDraft] = useState<{ testEmail: string; replyTo: string; sendHourIst: number; sendHourEt: number; nudgeCap: number } | null>(null);

  /**
   * Run one async action at a time, with the UI disabled throughout.
   *
   * NOT useTransition: on React 18 a transition ends at the first await, so the
   * pending flag drops while the request is still in flight and every button
   * re-enables mid-send. On a page whose main button sends real email, that is a
   * double-send waiting to happen. The `busy` guard also rejects a second click
   * outright rather than relying on the disabled attribute alone.
   */
  const guard = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  /**
   * Two round trips on purpose. The first is three indexed queries, so the
   * controls are usable immediately; the second does DNS lookups, the
   * behavioural segmentation and a digest build per market, and fills in below
   * the fold when it lands. One combined call would have made every page load
   * wait several seconds for numbers nobody reads first.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await loadOverview();
    if (r.success && r.data) {
      setData(r.data);
      setDraft({
        testEmail: r.data.settings.testEmail,
        replyTo: r.data.settings.replyTo,
        sendHourIst: r.data.settings.sendHourIst,
        sendHourEt: r.data.settings.sendHourEt,
        nudgeCap: r.data.settings.nudgeCap,
      });
      setErr(null);
    } else {
      setErr(r.error || 'Could not load.');
    }
    setLoading(false);

    void upgradeDrafts().then((d) => setDrafts(d.success && d.drafts ? d.drafts : []));

    setIns(null);
    const i = await loadInsights();
    if (i.success && i.data) setIns(i.data);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = (patch: Partial<LifecycleSettings>, note?: string) =>
    void guard(async () => {
      setMsg(null);
      setErr(null);
      const r = await saveSettings(patch);
      if (r.success && r.settings) {
        setData((d) => (d ? { ...d, settings: r.settings! } : d));
        setMsg(note ?? 'Saved.');
      } else {
        setErr(r.error || 'Could not save.');
      }
    });

  /* ── upgrade emails ──────────────────────────────────────────────────── */
  const reloadDrafts = async () => {
    const d = await upgradeDrafts();
    if (d.success && d.drafts) setDrafts(d.drafts);
    else setErr(d.error || 'Could not load drafts.');
  };
  const doScan = () =>
    void guard(async () => {
      setMsg(null);
      setErr(null);
      const r = await upgradeScan();
      if (r.success && r.scan) setScan(r.scan);
      else setErr(r.error || 'Scan failed.');
    });
  const doWrite = () =>
    void guard(async () => {
      setMsg(null);
      setErr(null);
      const r = await upgradeWrite();
      if (!r.success) {
        setErr(r.error || 'Drafting failed.');
        return;
      }
      setMsg(
        `${r.drafted} draft${r.drafted === 1 ? '' : 's'} written. Nothing has been sent.` +
          (r.duplicate ? ` ${r.duplicate} were already drafted today.` : '') +
          (r.capped ? ` ${r.capped} more are waiting for the next pass.` : ''),
      );
      await reloadDrafts();
    });
  const doTest = (id: string) =>
    void guard(async () => {
      setMsg(null);
      setErr(null);
      const r = await upgradeTest(id);
      if (r.success) setMsg(`Test copy sent to ${r.to}. The draft is still waiting.`);
      else setErr(r.error || 'Test send failed.');
    });
  const doDecide = (ids: string[], approve: boolean) =>
    void guard(async () => {
      setMsg(null);
      setErr(null);
      setArmAll(false);
      const r = await upgradeDecide(ids, approve);
      if (!r.success) setErr(r.error || 'Could not do that.');
      else if (!approve) setMsg(`${r.rejected} rejected. They will not be sent.`);
      else
        setMsg(
          `${r.sent} sent.` +
            (r.skipped ? ` ${r.skipped} skipped at send time (unsubscribed, upgraded already, or blocklisted).` : '') +
            (r.failed ? ` ${r.failed} failed${r.error ? `: ${r.error}` : ''}.` : ''),
        );
      await reloadDrafts();
    });

  const doRun = (market: ContentMarket | undefined, dry: boolean) =>
    void guard(async () => {
      setMsg(null);
      setErr(null);
      const r = await runNow(market, dry);
      if (!r.success || !r.result) {
        setErr(r.error || 'Run failed.');
        return;
      }
      const lines = [...r.result.digests.map((d) => ({ ...d, what: 'digest' })), ...r.result.nudges.map((d) => ({ ...d, what: 'nudges' }))]
        .map((o) => {
          const head = `${o.market} ${o.what}`;
          if (o.error) return `${head}: error — ${o.error}`;
          if (!o.ran) return `${head}: skipped — ${o.skipped ?? 'no reason given'}`;
          const notes = [
            o.duplicate ? `${o.duplicate} already sent today` : '',
            o.suppressed ? `${o.suppressed} suppressed (privacy blocklist)` : '',
            o.capped ? `${o.capped} over the cap, left for tomorrow` : '',
            o.failed ? `${o.failed} failed` : '',
          ].filter(Boolean);
          return `${head}: ${dry ? 'would send' : 'sent'} ${dry ? o.recipients : o.sent}/${o.recipients} (${o.audience})${notes.length ? ` — ${notes.join(', ')}` : ''}`;
        })
        .join(' · ');
      setMsg(`${dry ? 'Dry run' : 'Run'} — mode ${r.result.mode}. ${lines}`);
      await refresh();
    });

  const openDigest = (market: ContentMarket) =>
    void guard(async () => {
      const r = await previewDigest(market);
      if (r.success && r.html) setPreview({ title: `${market} digest`, subject: r.subject, html: r.html });
      else setErr(r.error || 'Preview failed.');
    });

  const openNudges = (market: ContentMarket) =>
    void guard(async () => {
      const r = await previewNudges(market);
      if (!r.success) return setErr(r.error || 'Preview failed.');
      if (!r.samples?.length) return setMsg(`No ${market} users are in a behavioural bucket right now, so there is nothing to preview.`);
      setPreview({
        title: `${market} behavioural emails`,
        html: r.samples
          .map(
            (s) =>
              `<div style="font-family:system-ui;font-size:12px;color:#5B6472;padding:10px 14px;background:#F4F2EE;border-bottom:1px solid #E7E3DC;"><strong>${s.label}</strong> — subject: “${s.subject}”</div>${s.html}`,
          )
          .join('<div style="height:24px"></div>'),
      });
    });

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (!data || !draft) {
    return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err || 'Could not load.'}</p>;
  }

  const s = data.settings;
  const live = s.mode === 'auto';

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy">Daily email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tonight’s case and guesstimate, and the behavioural emails. India {String(data.hours.in).padStart(2, '0')}:00 · US {String(data.hours.us).padStart(2, '0')}:00 right now.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/40 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {msg ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{msg}</p> : null}
      {err ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</p> : null}
      {data.tablesMissing ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          The CRM tables aren’t migrated on this database, so sending works but nothing is recorded and no numbers appear below. Run migration 0071/0072.
        </p>
      ) : null}

      {/* ── mode ─────────────────────────────────────────────────────────── */}
      <Card
        title="Mode"
        sub="Manual is the review mode: the job runs on its normal schedule but every email goes to your test address only. Switch to auto when you are happy with where it lands and how it reads."
      >
        <div className="space-y-2">
          {MODES.map((m) => {
            const on = s.mode === m.v;
            return (
              <button
                key={m.v}
                type="button"
                disabled={busy}
                onClick={() => save({ mode: m.v }, m.v === 'auto' ? 'Live. Tonight’s mail goes to real users.' : `Mode set to ${m.v}.`)}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-60 ${
                  on ? 'border-navy bg-muted' : 'border-border hover:bg-muted/40'
                }`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${on ? 'border-navy bg-navy' : 'border-muted-foreground/40'}`}>
                  {on ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-navy">{m.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{m.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>

        {live && !s.replyTo ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            You’re live without a Reply-To. Set one below — replies are the strongest deliverability signal there is, and at your size the replies are worth more than any metric on this page.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => doRun(undefined, false)}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" /> {live ? 'Send tonight’s mail now' : 'Send to test address now'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => doRun(undefined, true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/40 disabled:opacity-50"
          >
            Dry run
          </button>
          <button type="button" disabled={busy} onClick={() => openDigest('IN')} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
            Preview India
          </button>
          <button type="button" disabled={busy} onClick={() => openDigest('US')} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
            Preview US
          </button>
        </div>
      </Card>

      {/* ── schedule + addresses ────────────────────────────────────────── */}
      <Card title="Schedule and addresses">
        <Row label="Test address" hint="Where manual-mode mail goes. Use a normal Gmail account — that is the inbox whose Promotions tab you are trying to beat.">
          <div className="flex gap-2">
            <input
              type="email"
              value={draft.testEmail}
              onChange={(e) => setDraft({ ...draft, testEmail: e.target.value })}
              placeholder="you@gmail.com"
              className="w-56 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button type="button" disabled={busy} onClick={() => save({ testEmail: draft.testEmail })} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
              Save
            </button>
          </div>
        </Row>
        <Row label="Reply-To" hint="An address you read. Every behavioural email asks for a reply.">
          <div className="flex gap-2">
            <input
              type="email"
              value={draft.replyTo}
              onChange={(e) => setDraft({ ...draft, replyTo: e.target.value })}
              placeholder="satyam@mece.in"
              className="w-56 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button type="button" disabled={busy} onClick={() => save({ replyTo: draft.replyTo })} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
              Save
            </button>
          </div>
        </Row>
        <Row label="India send hour (IST)" hint="24-hour clock, India time. The job fires inside that one hour.">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={23}
              value={draft.sendHourIst}
              onChange={(e) => setDraft({ ...draft, sendHourIst: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button type="button" disabled={busy} onClick={() => save({ sendHourIst: draft.sendHourIst })} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
              Save
            </button>
          </div>
        </Row>
        <Row label="US send hour (Eastern)">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={23}
              value={draft.sendHourEt}
              onChange={(e) => setDraft({ ...draft, sendHourEt: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button type="button" disabled={busy} onClick={() => save({ sendHourEt: draft.sendHourEt })} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
              Save
            </button>
          </div>
        </Row>
        <Row label="India market"><Toggle on={s.marketsIn} disabled={busy} onChange={(v) => save({ marketsIn: v })} /></Row>
        <Row label="US market"><Toggle on={s.marketsUs} disabled={busy} onChange={(v) => save({ marketsUs: v })} /></Row>
      </Card>

      {/* ── last run ───────────────────────────────────────────────────── */}
      <Card title="Last run">
        <div className="grid gap-4 sm:grid-cols-2">
          {(['IN', 'US'] as const).map((m) => {
            const d = data.lastDigest[m];
            const n = data.lastNudge[m];
            return (
              <div key={m} className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m === 'IN' ? 'India' : 'US & Europe'}</p>
                {d ? (
                  <>
                    <p className="mt-2 text-sm text-foreground">
                      {d.date} · {d.sent}/{d.recipients} sent{d.failed ? ` · ${d.failed} failed` : ''} · {d.audience === 'test' ? 'test address' : 'live'}
                    </p>
                    <p className="mt-1 break-words text-xs italic text-muted-foreground">“{d.subject}”</p>
                    {d.error ? <p className="mt-1 text-xs text-red-700">{d.error}</p> : null}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Never run.</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Behavioural: {n ? `${n.date} · ${n.sent}/${n.recipients}` : 'never run'}
                </p>
                <p className="mt-2 break-words text-xs text-muted-foreground">
                  Tonight’s subject: {ins ? (ins.previewSubjects[m] ? <span className="italic">“{ins.previewSubjects[m]}”</span> : '—') : 'building…'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── behavioural ────────────────────────────────────────────────── */}
      <Card
        title="Behavioural emails"
        sub="One person, one thing they did. Sent plain — no logo, no card borders, one link — because a branded frame around “you left this half-finished” is what puts it in Promotions. Every one asks for a reply."
      >
        <Row label="Send them" hint="Off by default. Preview first, then turn on.">
          <Toggle on={s.nudgesOn} disabled={busy} onChange={(v) => save({ nudgesOn: v })} />
        </Row>
        <Row label="Max per market per night" hint="A brake, not a target. Freshest behaviour is sent first.">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={2000}
              value={draft.nudgeCap}
              onChange={(e) => setDraft({ ...draft, nudgeCap: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button type="button" disabled={busy} onClick={() => save({ nudgeCap: draft.nudgeCap })} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
              Save
            </button>
          </div>
        </Row>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(['IN', 'US'] as const).map((m) => (
            <div key={m} className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m === 'IN' ? 'India' : 'US & Europe'}</p>
                <button type="button" disabled={busy} onClick={() => openNudges(m)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline disabled:opacity-50">
                  Preview <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {(ins?.buckets[m] ?? []).map((b) => (
                  <li key={b.kind} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-semibold tabular-nums text-navy">{b.count}</span>
                  </li>
                ))}
                {ins ? null : <li className="text-sm text-muted-foreground">Counting…</li>}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* ── upgrade emails ─────────────────────────────────────────────── */}
      <Card
        title="Upgrade emails"
        sub="Written from each person’s own numbers and held here. Nothing in this section sends on a schedule: a draft goes out only when you press Send on it. India accounts only. Nobody is drafted twice inside 30 days."
      >
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={busy} onClick={doScan} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 disabled:opacity-50">
            Who would get one?
          </button>
          <button type="button" disabled={busy} onClick={doWrite} className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            Write the drafts
          </button>
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </div>

        {scan ? (
          <div className="mt-4 rounded-lg border border-border/70 p-3">
            <p className="text-sm font-medium text-foreground">
              {scan.total === 0 ? 'Nobody qualifies right now.' : `${scan.total} ${scan.total === 1 ? 'person qualifies' : 'people qualify'} right now.`}
            </p>
            {scan.total === 0 ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                A free account needs three finished cases, one of them in the last fortnight, before it is asked to pay. If this stays at zero, the problem is activation, not the wording of an upgrade email.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {scan.segments.map((g) => (
                  <li key={g.segment} className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/60 pt-2 text-sm first:border-t-0 first:pt-0">
                    <span>
                      <span className="font-medium">{g.label}</span> <span className="tabular-nums text-muted-foreground">· {g.count}</span>
                      <span className="block text-xs text-muted-foreground">e.g. {g.sampleWhy}</span>
                    </span>
                    <button type="button" onClick={() => setPreview({ title: `${g.label} — sample`, subject: g.sampleSubject, html: g.sampleHtml })} className="text-xs font-medium text-navy underline underline-offset-2">
                      Read the email
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className="mt-4 border-t border-border/60 pt-4">
          {drafts === null ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading drafts…
            </p>
          ) : drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drafts waiting.</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{drafts.length} waiting for you</p>
                {armAll ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-red-700">Send all {drafts.length} to real people?</span>
                    <button type="button" disabled={busy} onClick={() => doDecide(drafts.map((d) => d.id).slice(0, 100), true)} className="rounded-md bg-red-700 px-2.5 py-1 font-medium text-white disabled:opacity-50">
                      Yes, send
                    </button>
                    <button type="button" onClick={() => setArmAll(false)} className="rounded-md border border-border px-2.5 py-1 font-medium">
                      No
                    </button>
                  </span>
                ) : (
                  <button type="button" disabled={busy} onClick={() => setArmAll(true)} className="text-xs font-medium text-navy underline underline-offset-2 disabled:opacity-50">
                    Send all
                  </button>
                )}
              </div>
              <ul className="space-y-3">
                {drafts.map((d) => (
                  <li key={d.id} className="rounded-lg border border-border/70 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="min-w-0 break-all text-sm font-medium text-foreground">
                        {d.name ? `${d.name} · ` : ''}
                        <span className="font-normal text-muted-foreground">{d.to}</span>
                      </p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{d.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Why: {d.why || 'not recorded'}</p>
                    <p className="mt-1.5 text-sm text-foreground">“{d.subject}”</p>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs font-medium">
                      <button type="button" onClick={() => setPreview({ title: `To ${d.to}`, subject: d.subject, html: d.html })} className="rounded-md border border-border px-2.5 py-1 hover:bg-muted/40">
                        Read
                      </button>
                      <button type="button" disabled={busy} onClick={() => doTest(d.id)} className="rounded-md border border-border px-2.5 py-1 hover:bg-muted/40 disabled:opacity-50">
                        Send a copy to me
                      </button>
                      <button type="button" disabled={busy} onClick={() => doDecide([d.id], true)} className="rounded-md bg-navy px-2.5 py-1 text-white hover:opacity-90 disabled:opacity-50">
                        Send
                      </button>
                      <button type="button" disabled={busy} onClick={() => doDecide([d.id], false)} className="rounded-md border border-border px-2.5 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Card>

      {/* ── deliverability ─────────────────────────────────────────────── */}
      <Card
        title={`Deliverability${ins?.deliverability.domain ? ` — ${ins.deliverability.domain}` : ''}`}
        sub="Where mail lands is decided here, not in the wording. Fix anything red before switching to auto: a missing DMARC record filters your mail no matter how well it reads."
      >
        {!ins ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Looking up SPF, DKIM and DMARC…
          </p>
        ) : (
        <ul className="space-y-3">
          {ins.deliverability.checks.map((c) => {
            const { cls, Icon } = VERDICT_STYLE[c.verdict];
            return (
              <li key={c.id} className="flex gap-3 border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {c.label} <span className={`text-xs font-normal ${cls}`}>{c.verdict}</span>
                  </p>
                  <p className="mt-0.5 break-words font-mono text-xs text-muted-foreground">{c.detail}</p>
                  {c.fix ? <p className="mt-1 text-xs leading-relaxed text-amber-800">{c.fix}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
        )}

        <div className="mt-4 border-t border-border/60 pt-4">
          <Row
            label="Open tracking pixel"
            hint="Leave this off. It is a recognised bulk-mail marker, and Apple Mail pre-fetches images, so a large share of the “opens” it reports never happened. The click numbers below are real."
          >
            <Toggle on={s.openPixel} disabled={busy} onChange={(v) => save({ openPixel: v })} />
          </Row>
        </div>
      </Card>

      {/* ── numbers ────────────────────────────────────────────────────── */}
      <Card title="Last 30 days" sub="Clicks, not opens. A click is somebody choosing to open a case; it is the only number here that means anything.">
        {data.funnels.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing sent yet.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 pb-2 font-semibold">Email</th>
                  <th className="px-2 pb-2 text-right font-semibold">Sent</th>
                  <th className="px-2 pb-2 text-right font-semibold">Clicked</th>
                  <th className="px-2 pb-2 text-right font-semibold">Rate</th>
                  <th className="px-2 pb-2 text-right font-semibold">Unsub</th>
                  <th className="px-2 pb-2 text-right font-semibold">Failed</th>
                </tr>
              </thead>
              <tbody>
                {data.funnels.map((f) => (
                  <tr key={f.source} className="border-t border-border/60">
                    <td className="px-2 py-2 font-mono text-xs">{f.source.replace(/^lifecycle:/, '')}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{f.sent}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{f.clicked}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{f.sent ? `${Math.round((f.clicked / f.sent) * 100)}%` : '—'}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{f.unsubscribed}</td>
                    <td className={`px-2 py-2 text-right tabular-nums ${f.failed ? 'text-red-700' : ''}`}>{f.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── preview overlay ────────────────────────────────────────────── */}
      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{preview.title}</p>
                {preview.subject ? <p className="mt-0.5 break-words text-xs text-muted-foreground">Subject: “{preview.subject}”</p> : null}
              </div>
              <button type="button" onClick={() => setPreview(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40">
                Close
              </button>
            </div>
            <iframe title="Email preview" srcDoc={preview.html} className="h-[70vh] w-full border-0 bg-white" sandbox="" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

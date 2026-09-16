'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, Send, User, Sparkles, Target } from 'lucide-react';
import { previewRecipients, sendBroadcast, sendToOne, generateDailyDigest, generateBroadcastOptions, materializeBroadcastOption } from './email-actions';
import { broadcastEmail, practiceCard, baseEmailLayout } from '@/lib/email/templates';

type SegmentType = 'all' | 'tier' | 'activity' | 'lifecycle';
type Mode = 'segment' | 'one';

const VALUE_OPTIONS: Record<SegmentType, { value: string; label: string }[]> = {
  all: [{ value: 'all', label: 'Everyone' }],
  tier: [
    { value: 'free', label: 'Free users' },
    { value: 'lite', label: 'Lite users' },
    { value: 'pro', label: 'Pro users' },
  ],
  activity: [
    { value: 'active', label: 'Active (practiced in 30 days)' },
    { value: 'dormant', label: 'Dormant (signed up, gone quiet)' },
    { value: 'never', label: 'Never practiced' },
  ],
  lifecycle: [
    { value: 'expiring', label: 'Expiring within 7 days' },
    { value: 'expired', label: 'Expired' },
  ],
};

const inputCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-body shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

const EMPTY_PREVIEW =
  '<!doctype html><html><body style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;color:#8C8A82;padding:48px 24px;text-align:center;background:#FAF9F6;">Your email preview will appear here as you type. Fill in a message on the left — or hit &ldquo;Generate today’s digest&rdquo;.</body></html>';

type PracticeCardT = { kind: 'case' | 'guesstimate'; title: string; hook: string; url: string };

// Insert practice-card HTML just before </body> in a full custom document; for the
// simple heading+body path the cards are concatenated onto the body instead.
function injectBeforeBodyClose(html: string, extra: string): string {
  if (!extra) return html;
  const i = html.toLowerCase().lastIndexOf('</body>');
  return i === -1 ? html + extra : html.slice(0, i) + extra + html.slice(i);
}

function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function BroadcastComposer() {
  const [mode, setMode] = useState<Mode>('segment');
  const [oneEmail, setOneEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [body, setBody] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [segmentType, setSegmentType] = useState<SegmentType>('all');
  const [segmentValue, setSegmentValue] = useState('all');
  const [rawHtml, setRawHtml] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState<'preview' | 'send' | 'digest' | null>(null);
  const [log, setLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Targeted practice (optional): generate a company/topic case or guesstimate,
  // pick one, and it becomes an UNLISTED case linked from a branded card in the email.
  const [tTopic, setTTopic] = useState('');
  const [tKind, setTKind] = useState<'case' | 'guesstimate'>('case');
  const [tDiff, setTDiff] = useState('medium');
  const [tBusy, setTBusy] = useState(false);
  const [tOptions, setTOptions] = useState<any[]>([]);
  const [tLog, setTLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cards, setCards] = useState<PracticeCardT[]>([]);

  // Live inbox preview — the EXACT HTML a recipient will receive, rebuilt as you
  // type (client-side, using the real email template). {{UNSUBSCRIBE}} is shown
  // as a dummy link here; it is filled in per-recipient at send time.
  // Materialised practice cards rendered as email HTML (shared template).
  const cardsHtml = useMemo(
    () =>
      cards
        .map((c) =>
          practiceCard({
            label: c.kind === 'guesstimate' ? 'Practice guesstimate' : 'Practice case',
            title: c.title,
            hook: c.hook || undefined,
            url: c.url,
            cta: c.kind === 'guesstimate' ? 'Practice the guesstimate' : 'Practice this case',
          }),
        )
        .join(''),
    [cards],
  );

  const previewHtml = useMemo(() => {
    const b = (body || '').trim();
    if (!b && !cardsHtml) return EMPTY_PREVIEW;
    const looksFull = /^\s*<(?:!doctype|html)\b/i.test(b);
    if (rawHtml || looksFull) {
      const doc = b.replace(/\{\{\s*UNSUBSCRIBE\s*\}\}/g, '#');
      return cardsHtml ? injectBeforeBodyClose(doc, cardsHtml) : doc;
    }
    return broadcastEmail({
      heading: (heading || subject || 'Your heading').trim(),
      bodyHtml: b.replace(/\n/g, '<br/>') + cardsHtml,
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      unsubscribeUrl: '#',
    });
  }, [body, rawHtml, heading, subject, ctaLabel, ctaUrl, cardsHtml]);

  const onTypeChange = (t: SegmentType) => {
    setSegmentType(t);
    setSegmentValue(VALUE_OPTIONS[t][0].value);
    setCount(null);
  };

  const doPreview = async () => {
    setBusy('preview');
    setLog(null);
    const r = await previewRecipients(segmentType, segmentValue);
    if (r.success) setCount(r.count ?? 0);
    else setLog({ type: 'error', message: r.error || 'Preview failed' });
    setBusy(null);
  };

  const doGenerateDigest = async () => {
    setBusy('digest');
    setLog(null);
    const r = await generateDailyDigest();
    if (r.success && r.html) {
      setRawHtml(true);
      setSubject(r.subject || 'Your daily reps are ready');
      setBody(r.html);
      setLog({ type: 'success', message: r.note || 'Digest generated — preview it on the right, then send.' });
    } else {
      setLog({ type: 'error', message: r.error || 'Could not generate the digest' });
    }
    setBusy(null);
  };

  const doGenerateOptions = async () => {
    setTBusy(true);
    setTLog(null);
    setTOptions([]);
    const r = await generateBroadcastOptions({ topic: tTopic, kind: tKind, difficulty: tDiff });
    if (r.success && r.options) {
      setTOptions(r.options);
      if (r.options.length === 0) setTLog({ type: 'error', message: 'No options came back — try again.' });
    } else {
      setTLog({ type: 'error', message: r.error || 'Generation failed.' });
    }
    setTBusy(false);
  };

  const doUseOption = async (o: any) => {
    setTBusy(true);
    setTLog(null);
    const r = await materializeBroadcastOption({ option: o, topic: tTopic });
    if (r.success && r.url) {
      const kind: 'case' | 'guesstimate' = o?.kind === 'guesstimate' ? 'guesstimate' : 'case';
      setCards((prev) => [...prev, { kind, title: r.title || o.title || 'Practice', hook: o.hook || '', url: r.url! }]);
      setTOptions([]);
      setTLog({ type: 'success', message: `Added “${r.title || o.title}” — see it in the preview on the right.` });
    } else {
      setTLog({ type: 'error', message: r.error || 'Could not save the option.' });
    }
    setTBusy(false);
  };

  // Assemble the picked case/guesstimate into a COMPLETE branded email (subject +
  // intro + cards + closing), same shape as "Generate today's digest", and load it
  // into the composer ready to preview/send. Cards are baked into the body, so they
  // are cleared from the picker to avoid a double render.
  const buildTargetedEmail = () => {
    if (cards.length === 0) {
      setTLog({ type: 'error', message: 'Add a case or guesstimate first.' });
      return;
    }
    const label = tTopic.trim();
    const cardsBlock = cards
      .map((c) =>
        practiceCard({
          label: c.kind === 'guesstimate' ? 'Practice guesstimate' : 'Practice case',
          title: c.title,
          hook: c.hook || undefined,
          url: c.url,
          cta: c.kind === 'guesstimate' ? 'Practice the guesstimate' : 'Practice this case',
        }),
      )
      .join('');
    const intro = label
      ? `<p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#1A2233;">${esc(label)} is on the radar \u2014 here\u2019s a targeted set to practise. About 10 focused minutes, and the MECE interviewer scores you at the end.</p>`
      : `<p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#1A2233;">Here\u2019s a targeted set to practise \u2014 about 10 focused minutes, and the MECE interviewer scores you at the end.</p>`;
    const closing = `<p style="margin:16px 0 0;font-size:14px;color:#5B6472;line-height:1.6;">Give it your best structured attempt. Good luck.</p>`;
    const html = baseEmailLayout({
      preheader: label ? `A ${label} case & guesstimate to practise.` : 'A targeted practice set for you.',
      heading: label ? `Practice for ${esc(label)}` : 'Your targeted practice set',
      contentHtml: intro + cardsBlock + closing,
      unsubscribeUrl: '{{UNSUBSCRIBE}}',
    });
    setRawHtml(true);
    setSubject(label ? `A ${label} case & guesstimate to practise` : 'Your targeted practice set');
    setBody(html);
    setCards([]);
    setTLog({ type: 'success', message: 'Practice email built \u2014 preview it on the right, tweak the copy if you like, then send.' });
  };

  const doSend = async () => {
    if (!subject.trim() || (!body.trim() && cards.length === 0)) {
      setLog({ type: 'error', message: 'A subject and a message (or at least one practice card) are required.' });
      return;
    }
    const looksLikeFullDoc = /^\s*<(?:!doctype|html)\b/i.test(body);
    const useRaw = rawHtml || looksLikeFullDoc;
    let html = useRaw ? body : body.replace(/\n/g, '<br/>');
    if (cardsHtml) html = useRaw ? injectBeforeBodyClose(html, cardsHtml) : html + cardsHtml;

    // ── Single recipient ──────────────────────────────────────────────────
    if (mode === 'one') {
      if (!oneEmail.trim()) {
        setLog({ type: 'error', message: 'Enter the recipient’s email address.' });
        return;
      }
      if (!confirm(`Send "${subject}" to ${oneEmail.trim()}? This emails a real person.`)) return;
      setBusy('send');
      setLog(null);
      const r = await sendToOne({
        email: oneEmail.trim(),
        subject: subject.trim(),
        heading: (heading || subject).trim(),
        bodyHtml: html,
        ctaLabel: useRaw ? undefined : ctaLabel.trim() || undefined,
        ctaUrl: useRaw ? undefined : ctaUrl.trim() || undefined,
        bodyIsFullHtml: useRaw,
      });
      setLog(r.success ? { type: 'success', message: `Sent to ${oneEmail.trim()}.` } : { type: 'error', message: r.error || 'Send failed' });
      setBusy(null);
      return;
    }

    // ── Segment broadcast ─────────────────────────────────────────────────
    const who = VALUE_OPTIONS[segmentType].find((o) => o.value === segmentValue)?.label || 'recipients';
    if (!confirm(`Send "${subject}" to ${count ?? 'all matching'} — ${who}? This emails real users.`)) return;
    setBusy('send');
    setLog(null);
    const r = await sendBroadcast({
      subject: subject.trim(),
      heading: (heading || subject).trim(),
      bodyHtml: html,
      ctaLabel: useRaw ? undefined : ctaLabel.trim() || undefined,
      ctaUrl: useRaw ? undefined : ctaUrl.trim() || undefined,
      segmentType,
      segmentValue,
      bodyIsFullHtml: useRaw,
    });
    if (r.success) {
      setLog({ type: 'success', message: `Sent to ${r.sent} of ${r.total} recipients${r.failed ? ` · ${r.failed} failed` : ''}.` });
    } else {
      setLog({ type: 'error', message: r.error || 'Send failed' });
    }
    setBusy(null);
  };

  return (
    <Card className="p-6 border-border bg-card shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Compose email
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Send to a segment or one person. Unsubscribed users are skipped and an unsubscribe link is added automatically.
          </p>
        </div>
        <Button variant="outline" onClick={doGenerateDigest} disabled={busy !== null} className="h-10 gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
          {busy === 'digest' ? 'Generating…' : "Generate today’s digest"}
        </Button>
      </div>

      {/* Send-to mode */}
      <div className="mb-4 inline-flex rounded-md border border-border p-1 bg-muted/40">
        <button
          type="button"
          onClick={() => setMode('segment')}
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'segment' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="h-4 w-4" /> A segment
        </button>
        <button
          type="button"
          onClick={() => setMode('one')}
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'one' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <User className="h-4 w-4" /> One person
        </button>
      </div>

      {/* Targeted practice generator (optional) */}
      <div className="mb-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Targeted practice (optional)</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Generate a company- or topic-specific case or guesstimate (e.g. a jewellery retailer visiting a campus). Pick
          one and it&rsquo;s added to the email as a live &ldquo;Practice this&rdquo; card, scored through the normal interview.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            value={tTopic}
            onChange={(e) => setTTopic(e.target.value)}
            placeholder="Company / topic — e.g. Titan (jewellery retail)"
            className={inputCls}
          />
          <select value={tKind} onChange={(e) => setTKind(e.target.value as 'case' | 'guesstimate')} className={inputCls}>
            <option value="case">Case</option>
            <option value="guesstimate">Guesstimate</option>
          </select>
          <select value={tDiff} onChange={(e) => setTDiff(e.target.value)} className={inputCls}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Button variant="outline" onClick={doGenerateOptions} disabled={tBusy || !tTopic.trim()} className="h-10 gap-2 whitespace-nowrap">
            <Sparkles className="h-4 w-4 text-primary" />
            {tBusy && tOptions.length === 0 ? 'Generating…' : 'Generate options'}
          </Button>
        </div>

        {tOptions.length > 0 && (
          <div className="mt-3 grid gap-2">
            <p className="text-xs font-medium text-muted-foreground">Pick one to add to the email:</p>
            {tOptions.map((o, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{o.title}</p>
                    {o.hook && <p className="mt-0.5 text-xs text-primary">{o.hook}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {String(o.scenario || o.prompt || '').slice(0, 200)}
                      {String(o.scenario || o.prompt || '').length > 200 ? '…' : ''}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {o.type} · {o.difficulty}
                    </p>
                  </div>
                  <Button
                    onClick={() => doUseOption(o)}
                    disabled={tBusy}
                    className="h-8 shrink-0 gap-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    Use this
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <div className="mt-3 grid gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">In this email ({cards.length}):</p>
            {cards.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2">
                <span className="min-w-0 truncate text-xs text-foreground">
                  <span className="font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">{c.kind}</span> · {c.title}
                </span>
                <button
                  type="button"
                  onClick={() => setCards(cards.filter((_, j) => j !== i))}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove card"
                >
                  ✕
                </button>
              </div>
            ))}
            <Button
              onClick={buildTargetedEmail}
              disabled={tBusy}
              className="mt-1 h-9 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" /> Build the practice email
            </Button>
          </div>
        )}

        {tLog && (
          <div className={`mt-2 text-xs ${tLog.type === 'error' ? 'text-destructive' : 'text-green-700 dark:text-green-400'}`}>
            {tLog.message}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: the form ────────────────────────────────────────────── */}
        <div className="grid gap-3 content-start">
          {mode === 'one' ? (
            <input
              type="email"
              value={oneEmail}
              onChange={(e) => setOneEmail(e.target.value)}
              placeholder="Recipient email address"
              className={inputCls}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={segmentType} onChange={(e) => onTypeChange(e.target.value as SegmentType)} className={inputCls}>
                <option value="all">All users</option>
                <option value="tier">By tier</option>
                <option value="activity">By activity</option>
                <option value="lifecycle">By subscription lifecycle</option>
              </select>
              <select
                value={segmentValue}
                onChange={(e) => {
                  setSegmentValue(e.target.value);
                  setCount(null);
                }}
                disabled={segmentType === 'all'}
                className={`${inputCls} disabled:opacity-50`}
              >
                {VALUE_OPTIONS[segmentType].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-start gap-2 text-sm text-foreground select-none">
            <input type="checkbox" checked={rawHtml} onChange={(e) => setRawHtml(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
            Custom full-width HTML email (sent exactly as-is — no extra header/footer)
          </label>

          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" className={inputCls} />
          {!rawHtml && (
            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Email heading (optional — defaults to the subject)"
              className={inputCls}
            />
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={rawHtml ? 12 : 7}
            placeholder={
              rawHtml
                ? 'Paste the FULL email HTML (whole document). Put {{UNSUBSCRIBE}} where the unsubscribe link should go — filled in per recipient.'
                : 'Your message… (line breaks preserved; basic HTML allowed)'
            }
            className={`${inputCls} h-auto py-2 resize-y ${rawHtml ? 'font-mono text-xs' : ''}`}
          />
          {!rawHtml && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Button label (optional)" className={inputCls} />
              <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="Button URL (optional)" className={inputCls} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {mode === 'segment' && (
              <>
                <Button variant="outline" onClick={doPreview} disabled={busy !== null} className="h-10 gap-2">
                  <Users className="h-4 w-4" />
                  {busy === 'preview' ? 'Counting…' : 'Count recipients'}
                </Button>
                {count !== null && (
                  <span className="text-sm text-muted-foreground">
                    {count} recipient{count === 1 ? '' : 's'} match
                  </span>
                )}
              </>
            )}
            <Button
              onClick={doSend}
              disabled={busy !== null || !subject.trim() || (!body.trim() && cards.length === 0) || (mode === 'one' && !oneEmail.trim())}
              className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
            >
              <Send className="h-4 w-4" />
              {busy === 'send' ? 'Sending…' : mode === 'one' ? 'Send email' : 'Send broadcast'}
            </Button>
          </div>

          {log && (
            <div
              className={`text-sm rounded-md border p-3 ${
                log.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}
            >
              {log.message}
            </div>
          )}
        </div>

        {/* ── Right: live inbox preview ─────────────────────────────────── */}
        <div className="flex flex-col">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live preview — how it lands in the inbox</p>
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            sandbox=""
            className="w-full flex-1 min-h-[520px] rounded-lg border border-border bg-white"
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Bulk email sends via Google Workspace / Gmail SMTP (<code>GMAIL_USER</code> + <code>GMAIL_APP_PASSWORD</code>), or set{' '}
        <code>RESEND_API_KEY</code> for the high-volume path. The preview shows the exact HTML a recipient receives.
      </p>
    </Card>
  );
}

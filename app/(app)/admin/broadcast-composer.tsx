'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, Send } from 'lucide-react';
import { previewRecipients, sendBroadcast } from './email-actions';

type SegmentType = 'all' | 'tier' | 'activity' | 'lifecycle';

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

export default function BroadcastComposer() {
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [body, setBody] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [segmentType, setSegmentType] = useState<SegmentType>('all');
  const [segmentValue, setSegmentValue] = useState('all');
  const [rawHtml, setRawHtml] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState<'preview' | 'send' | null>(null);
  const [log, setLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const doSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setLog({ type: 'error', message: 'Subject and message are required.' });
      return;
    }
    const who = VALUE_OPTIONS[segmentType].find((o) => o.value === segmentValue)?.label || 'recipients';
    if (!confirm(`Send "${subject}" to ${count ?? 'all matching'} — ${who}? This emails real users.`)) return;
    setBusy('send');
    setLog(null);
    // Custom-HTML mode: send the pasted markup verbatim (do NOT convert newlines
    // to <br/> — that would corrupt real HTML — and do NOT wrap it in the shell).
    // Auto-detect a full document even if the box is unchecked, so pasting a
    // complete email can never get double-wrapped or riddled with <br/>.
    const looksLikeFullDoc = /^\s*<(?:!doctype|html)\b/i.test(body);
    const useRaw = rawHtml || looksLikeFullDoc;
    const html = useRaw ? body : body.replace(/\n/g, '<br/>');
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
      setLog({
        type: 'success',
        message: `Sent to ${r.sent} of ${r.total} recipients${r.failed ? ` · ${r.failed} failed` : ''}.`,
      });
    } else {
      setLog({ type: 'error', message: r.error || 'Send failed' });
    }
    setBusy(null);
  };

  return (
    <Card className="p-6 border-border bg-card shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Send Broadcast Email
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Compose a promotional or announcement email and send it to a segment. Unsubscribed users are always
          skipped, and an unsubscribe link is added automatically.
        </p>
      </div>

      <div className="grid gap-3">
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

        <label className="flex items-center gap-2 text-sm text-foreground select-none">
          <input
            type="checkbox"
            checked={rawHtml}
            onChange={(e) => setRawHtml(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Send a custom, full-width HTML email (paste a complete design — it is sent exactly as-is, with no extra header or footer)
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
          rows={rawHtml ? 12 : 6}
          placeholder={
            rawHtml
              ? 'Paste the FULL email HTML here (the entire document). Include {{UNSUBSCRIBE}} where the unsubscribe link should go — it is filled in per recipient.'
              : 'Your message… (line breaks are preserved; basic HTML is allowed)'
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
          <Button variant="outline" onClick={doPreview} disabled={busy !== null} className="h-10 gap-2">
            <Users className="h-4 w-4" />
            {busy === 'preview' ? 'Counting…' : 'Preview recipients'}
          </Button>
          {count !== null && (
            <span className="text-sm text-muted-foreground">
              {count} recipient{count === 1 ? '' : 's'} match
            </span>
          )}
          <Button
            onClick={doSend}
            disabled={busy !== null || !subject.trim() || !body.trim()}
            className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
          >
            <Send className="h-4 w-4" />
            {busy === 'send' ? 'Sending…' : 'Send broadcast'}
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
        <p className="text-xs text-muted-foreground">
          Bulk email sends for free via your Google Workspace / Gmail SMTP (<code>GMAIL_USER</code> +{' '}
          <code>GMAIL_APP_PASSWORD</code>) — best for up to a few hundred recipients per send. Set{' '}
          <code>RESEND_API_KEY</code> to switch to the high-volume path automatically. Unsubscribed users are
          always skipped. In the default mode an unsubscribe link is added automatically; in{' '}
          <strong>custom HTML</strong> mode, put <code>{'{{UNSUBSCRIBE}}'}</code> in your HTML where the link should appear.
        </p>
      </div>
    </Card>
  );
}

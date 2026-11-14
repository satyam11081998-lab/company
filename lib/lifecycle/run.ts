/**
 * The nightly job.
 *
 * One entry point, `runLifecycle()`, called by /api/cron/daily-email (and by the
 * "run now" button in /admin/daily-email). It decides, per market:
 *
 *   mode = off     → nothing.
 *   mode = manual  → build everything, send ONLY to lifecycle.test_email.
 *   mode = auto    → send to that market's opted-in users.
 *
 * Every message is written to `crm_outbox` BEFORE it is sent, with its links
 * rewritten through the CRM's existing signed click-tracking route. Clicks,
 * unsubscribes and failures therefore show up in the CRM that is already built,
 * with no new table, no new endpoint and no new tracking code.
 *
 * Three independent things stop a double send, because a repeated email is the
 * one mistake here that cannot be taken back:
 *
 *   1. `crm_outbox.dedupe_key` is UNIQUE and contains the market and the
 *      market's own date. The database refuses the second insert. This is the
 *      real guarantee; the rest is defence in depth.
 *   2. A run ledger in crm_settings records the last date each market ran.
 *   3. Rows are inserted with status `sending`, NOT `approved`. This one matters:
 *      lib/crm/server/jobs.ts runs `sendApproved()` every five minutes off any
 *      CRM page load, and it claims *any* row sitting in `approved`. Inserting
 *      as approved would let that job send the same digest a second time, in the
 *      gap between the insert here and this function's own send.
 *
 * Server-only. Node runtime.
 */
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { buildDailyDigest } from '@/lib/email/digest';
import { clickUrl, openUrl, suppressionReason } from '@/lib/crm/server/outbox';
import { trackLinks } from '@/lib/crm/templates';
import type { ContentMarket } from '@/lib/market';
import { marketToday } from '@/lib/market';
import { marketHour, readLifecycleSettings, readRun, writeRun, type LifecycleSettings, type RunRecord } from './settings';
import { nudgeTargets, optedInUsers, type LifecycleUser } from './recipients';
import { renderNudge } from './nudges';
import type { MarketOutcome, LifecycleRunResult } from './types';

export interface RunOptions {
  /** Ignore the hour window and the ledger. The admin "run now" button sets this. */
  force?: boolean;
  /** Build and report, send nothing, write nothing. */
  dryRun?: boolean;
  /** Restrict to one market. */
  only?: ContentMarket;
}

/**
 * Hard ceiling on recipients per market per run, whatever the audience query
 * returns. A serverless function gets 60 seconds and the free SMTP fallback
 * needs roughly 0.2s a message; this is the brake that stops a runaway audience
 * timing out halfway through and stranding rows mid-send.
 */
const MAX_PER_RUN = 400;

/**
 * How many recipients go into one sendBulk call.
 *
 * sendBulk reports TOTALS, not per-recipient outcomes, so everything inside one
 * call shares one verdict. Below the threshold each recipient gets its own call
 * and therefore its own exact status in the CRM; above it, accuracy is traded
 * for the function budget and a failure is attributed to a block of 20 instead
 * of to every row in the run.
 */
const EXACT_ATTRIBUTION_UPTO = 60;
const BULK_CHUNK = 20;

/** Length of the send window, in the market's own clock. */
const WINDOW_HOURS = 2;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/+$/, '');
const TOKEN = /\{\{\s*UNSUBSCRIBE\s*\}\}/g;

/** One prepared message, already recorded in the outbox. */
interface Prepared {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  unsub: string;
}

export interface PrepareRow {
  /** Shown to the reviewer beside a draft; only stored on 'pending' rows. */
  why?: string;
  user: LifecycleUser | null;
  to: string;
  subject: string;
  html: string;
  text?: string;
  dedupeKey: string;
  sourceId: string;
}

/**
 * Write the outbox rows and return the messages to send. A row whose dedupe_key
 * already exists is reported as a duplicate and NOT re-sent.
 */
export async function prepare(
  rows: PrepareRow[],
  opts: { openPixel: boolean; dryRun: boolean; status?: 'sending' | 'pending' },
): Promise<{ msgs: Prepared[]; duplicate: number; suppressed: number; error?: string }> {
  const out: Prepared[] = [];
  if (!rows.length) return { msgs: out, duplicate: 0, suppressed: 0 };

  const db = createServiceClient();
  const inserts: Record<string, unknown>[] = [];
  const staged: Prepared[] = [];
  let suppressed = 0;

  for (const r of rows) {
    // The audience query already honours users.marketing_opt_out. This is the
    // other list: addresses erased under a privacy request, which live on the
    // CRM blocklist and must never be written to again. Reusing the CRM's own
    // function rather than reimplementing the rule, so there is one definition
    // of "must not email this person" in the codebase. Passing a null record
    // narrows it to exactly the blocklist check.
    if (await suppressionReason(db, null, r.to, 'marketing')) {
      suppressed += 1;
      continue;
    }
    const id = randomUUID();
    // A real user gets the HMAC unsubscribe link /api/unsubscribe already
    // honours logged-out. A bare test address has no user id, so it gets the
    // page itself — enough for a well-formed List-Unsubscribe header.
    const unsub = r.user ? unsubscribeUrl(r.user.id) : `${SITE}/api/unsubscribe`;

    // The token lives in BOTH parts. Replacing it only in the HTML would ship a
    // literal "{{UNSUBSCRIBE}}" to every plain-text reader.
    let html = r.html.replace(TOKEN, unsub);
    const text = r.text ? r.text.replace(TOKEN, unsub) : undefined;

    // Rewrite body links through the signed click route. The unsubscribe link in
    // the body is rewritten too — a click on it is the most important click
    // there is. The List-Unsubscribe HEADER keeps the raw URL, because a mailbox
    // provider has to reach the real endpoint directly.
    const tracked = trackLinks(html, (i) => clickUrl(id, i));
    html = tracked.html;
    if (opts.openPixel) {
      const pixel = `<img src="${openUrl(id)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px"/>`;
      html = html.includes('</body>') ? html.replace('</body>', `${pixel}</body>`) : `${html}${pixel}`;
    }

    staged.push({ id, to: r.to, subject: r.subject, html, text, unsub });
    inserts.push({
      id,
      record_id: null,
      to_email: r.to,
      to_name: r.user?.name?.slice(0, 200) ?? null,
      subject: r.subject.slice(0, 300),
      html,
      text_body: text ?? null,
      category: 'marketing',
      source: 'system',
      source_id: r.sourceId,
      links: tracked.links,
      // 'sending', not 'approved' — see the header comment. 'pending' is the
      // review queue: nothing picks a pending row up until a person approves it.
      status: opts.status ?? 'sending',
      status_reason: opts.status === 'pending' ? (r.why ?? null)?.slice(0, 300) ?? null : null,
      dedupe_key: r.dedupeKey,
      created_at: new Date().toISOString(),
    });
  }

  if (opts.dryRun) return { msgs: staged, duplicate: 0, suppressed };

  // ignoreDuplicates → ON CONFLICT DO NOTHING, and RETURNING yields only the
  // rows actually inserted. Anything missing was already queued.
  const { data, error } = await db
    .from('crm_outbox')
    .upsert(inserts, { onConflict: 'dedupe_key', ignoreDuplicates: true })
    .select('id');
  if (error) return { msgs: [], duplicate: 0, suppressed, error: error.message };

  const accepted = new Set(((data ?? []) as Array<{ id: string }>).map((r) => r.id));
  for (const m of staged) if (accepted.has(m.id)) out.push(m);
  return { msgs: out, duplicate: staged.length - out.length, suppressed };
}

/** Send the prepared messages and close out their outbox rows. */
async function deliver(msgs: Prepared[], replyTo: string): Promise<{ sent: number; failed: number; error?: string }> {
  if (!msgs.length) return { sent: 0, failed: 0 };
  const db = createServiceClient();
  const size = msgs.length <= EXACT_ATTRIBUTION_UPTO ? 1 : BULK_CHUNK;
  let sent = 0;
  let failed = 0;
  let firstError: string | undefined;

  for (let i = 0; i < msgs.length; i += size) {
    const chunk = msgs.slice(i, i + size);
    const ids = chunk.map((m) => m.id);
    let res: { sent: number; failed: number; skipped?: boolean; error?: string };
    try {
      res = await sendBulk(
        chunk.map((m) => ({ to: m.to, subject: m.subject, html: m.html, text: m.text, listUnsubscribe: m.unsub, replyTo: replyTo || undefined })),
      );
    } catch (e) {
      res = { sent: 0, failed: chunk.length, error: String((e as Error)?.message ?? e) };
    }
    if (!firstError && res.error) firstError = res.error;

    const anySent = res.sent > 0 && !res.skipped;
    if (anySent && res.failed === 0) {
      sent += res.sent;
      await db.from('crm_outbox').update({ status: 'sent', sent_at: new Date().toISOString() }).in('id', ids);
    } else if (anySent) {
      // Partial failure inside one block, with no way to tell which address
      // failed. Record the shortfall on the rows rather than pretending.
      sent += res.sent;
      failed += res.failed;
      await db
        .from('crm_outbox')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          status_reason: `${res.failed} of ${chunk.length} in this block failed; recipient unknown`.slice(0, 300),
        })
        .in('id', ids);
    } else {
      failed += chunk.length;
      await db.from('crm_outbox').update({ status: 'failed', status_reason: (res.error ?? 'send failed').slice(0, 300) }).in('id', ids);
      // A transport that is unconfigured or refusing the connection will refuse
      // every remaining block too. Fail the rest now instead of burning the
      // function budget discovering that one call at a time.
      if (res.skipped) {
        const rest = msgs.slice(i + size);
        if (rest.length) {
          failed += rest.length;
          await db
            .from('crm_outbox')
            .update({ status: 'failed', status_reason: (res.error ?? 'transport unavailable').slice(0, 300) })
            .in(
              'id',
              rest.map((m) => m.id),
            );
        }
        break;
      }
    }
  }
  return { sent, failed, ...(firstError ? { error: firstError } : {}) };
}

/** The addresses for a market under the current mode. */
async function audienceFor(
  market: ContentMarket,
  s: LifecycleSettings,
): Promise<{ kind: 'test' | 'live' | 'none'; users: Array<LifecycleUser | null>; capped?: number; problem?: string }> {
  if (s.mode === 'manual') {
    if (!s.testEmail) return { kind: 'none', users: [], problem: 'manual mode is on but no test address is set' };
    return { kind: 'test', users: [null] };
  }
  if (s.mode === 'auto') {
    const all = await optedInUsers(market);
    if (!all.length) return { kind: 'none', users: [], problem: `no opted-in ${market} users` };
    const users: Array<LifecycleUser | null> = all.slice(0, MAX_PER_RUN);
    return { kind: 'live', users, ...(all.length > users.length ? { capped: all.length - users.length } : {}) };
  }
  return { kind: 'none', users: [], problem: 'mode is off' };
}

/** Is this the right hour, and has today's mail already gone out? */
async function gate(market: ContentMarket, s: LifecycleSettings, kind: 'digest' | 'nudge'): Promise<string | null> {
  const key = market === 'US' ? 'US' : 'IN';
  const hour = marketHour(key);
  const want = key === 'US' ? s.sendHourEt : s.sendHourIst;
  // A window rather than an exact hour: a GitHub Actions schedule is routinely
  // late, sometimes by half an hour or more, and an exact-hour test would drop
  // that night's mail silently. The ledger and the unique dedupe_key are what
  // keep the wider window from sending twice.
  const within = Array.from({ length: WINDOW_HOURS }, (_, i) => (want + i) % 24).includes(hour);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (!within) return `not the send window (local ${pad(hour)}:00, window ${pad(want)}:00–${pad((want + WINDOW_HOURS - 1) % 24)}:59)`;
  const last = await readRun(key, kind);
  if (last?.date === marketToday(market)) return `already ran for ${last.date}`;
  return null;
}

const empty = (market: ContentMarket): MarketOutcome => ({ market, ran: false, audience: 'none', recipients: 0, sent: 0, failed: 0, duplicate: 0, suppressed: 0 });

/* ───────────────────────────────── digest ───────────────────────────────── */

async function runDigest(market: ContentMarket, s: LifecycleSettings, o: RunOptions): Promise<MarketOutcome> {
  const base = empty(market);
  if (s.mode === 'off') return { ...base, skipped: 'mode is off' };
  if (!o.force) {
    const why = await gate(market, s, 'digest');
    if (why) return { ...base, skipped: why };
  }

  const digest = await buildDailyDigest(market, 2);
  if (!digest.success || !digest.html || !digest.subject) return { ...base, error: digest.error || 'digest build failed' };
  const subject = digest.subject;
  const html = digest.html;

  const aud = await audienceFor(market, s);
  if (aud.kind === 'none') return { ...base, skipped: aud.problem, subject };

  const today = marketToday(market);
  const minute = new Date().toISOString().slice(0, 16);
  const rows: PrepareRow[] = aud.users.map((u) => ({
    user: u,
    to: u ? u.email : s.testEmail,
    subject,
    html,
    // A live send is keyed on the day, so it can happen only once. A test send is
    // keyed on the minute, so reviewing it twice in an evening actually works —
    // there is nobody to spam but himself.
    dedupeKey: u
      ? `lifecycle:digest:${market}:${today}:${u.email}`
      : `lifecycle:digest:${market}:test:${minute}:${s.testEmail}`,
    sourceId: `lifecycle:digest:${market}`,
  }));

  let prep: { msgs: Prepared[]; duplicate: number; suppressed: number; error?: string };
  try {
    prep = await prepare(rows, { openPixel: s.openPixel, dryRun: !!o.dryRun });
  } catch (e) {
    // Most likely a missing CRM signing key, which makes link tracking
    // impossible. Report it; never half-send.
    return { ...base, audience: aud.kind, recipients: rows.length, subject, error: String((e as Error)?.message ?? e).slice(0, 300) };
  }
  if (prep.error) return { ...base, audience: aud.kind, recipients: rows.length, subject, error: prep.error };

  const res: { sent: number; failed: number; error?: string } = o.dryRun ? { sent: 0, failed: 0 } : await deliver(prep.msgs, s.replyTo);

  // Only a live run claims the day. A test send must not stop the real one.
  if (!o.dryRun && aud.kind === 'live') {
    const rec: RunRecord = {
      date: today,
      at: new Date().toISOString(),
      mode: s.mode,
      sent: res.sent,
      failed: res.failed,
      recipients: rows.length,
      subject,
      audience: 'live',
      ...(res.error ? { error: res.error.slice(0, 300) } : {}),
    };
    await writeRun(market === 'US' ? 'US' : 'IN', rec, 'digest');
  }

  return {
    market,
    ran: true,
    audience: aud.kind,
    recipients: rows.length,
    sent: res.sent,
    failed: res.failed,
    duplicate: prep.duplicate,
    suppressed: prep.suppressed,
    subject,
    ...(aud.capped ? { capped: aud.capped } : {}),
    ...(res.error ? { error: res.error } : {}),
  };
}

/* ───────────────────────────────── nudges ───────────────────────────────── */

async function runNudges(market: ContentMarket, s: LifecycleSettings, o: RunOptions): Promise<MarketOutcome> {
  const base = empty(market);
  if (s.mode === 'off') return { ...base, skipped: 'mode is off' };
  if (!s.nudgesOn) return { ...base, skipped: 'behavioural emails are off' };
  if (!o.force) {
    const why = await gate(market, s, 'nudge');
    if (why) return { ...base, skipped: why };
  }

  const today = marketToday(market);
  const all = await nudgeTargets(market);
  if (!all.length) return { ...base, skipped: 'nobody is in a behavioural bucket today' };
  const targets = all.slice(0, Math.min(Math.max(0, s.nudgeCap), MAX_PER_RUN));
  if (!targets.length) return { ...base, skipped: 'the cap is set to zero' };

  const testing = s.mode === 'manual';
  if (testing && !s.testEmail) return { ...base, skipped: 'manual mode is on but no test address is set' };

  // In manual mode the test address receives ONE sample — the freshest target's
  // mail, rendered exactly as that person would get it. One of each kind would
  // be three emails a night to review, which nobody keeps doing.
  const rows: PrepareRow[] = testing
    ? [
        (() => {
          const t = targets[0];
          const mail = renderNudge(t, market, '{{UNSUBSCRIBE}}');
          return {
            user: null,
            to: s.testEmail,
            subject: `[sample · ${t.kind}] ${mail.subject}`,
            html: mail.html,
            text: mail.text,
            dedupeKey: `lifecycle:nudge:${market}:test:${new Date().toISOString().slice(0, 16)}:${s.testEmail}`,
            sourceId: `lifecycle:nudge-sample:${market}`,
          } satisfies PrepareRow;
        })(),
      ]
    : targets.map((t) => {
        const mail = renderNudge(t, market, '{{UNSUBSCRIBE}}');
        return {
          user: t.user,
          to: t.user.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          dedupeKey: `${mail.sourceId}:${market}:${today}:${t.user.email}`,
          // recipients.ts reads source_id back to enforce the cooldown, so this
          // is what stops anyone getting the same nudge twice.
          sourceId: mail.sourceId,
        } satisfies PrepareRow;
      });

  let prep: { msgs: Prepared[]; duplicate: number; suppressed: number; error?: string };
  try {
    prep = await prepare(rows, { openPixel: s.openPixel, dryRun: !!o.dryRun });
  } catch (e) {
    return { ...base, audience: testing ? 'test' : 'live', recipients: rows.length, error: String((e as Error)?.message ?? e).slice(0, 300) };
  }
  if (prep.error) return { ...base, audience: testing ? 'test' : 'live', recipients: rows.length, error: prep.error };

  const res: { sent: number; failed: number; error?: string } = o.dryRun ? { sent: 0, failed: 0 } : await deliver(prep.msgs, s.replyTo);

  if (!o.dryRun && !testing) {
    await writeRun(
      market === 'US' ? 'US' : 'IN',
      {
        date: today,
        at: new Date().toISOString(),
        mode: s.mode,
        sent: res.sent,
        failed: res.failed,
        recipients: rows.length,
        subject: `${all.length} in buckets, ${targets.length} mailed`,
        audience: 'live',
        ...(res.error ? { error: res.error.slice(0, 300) } : {}),
      },
      'nudge',
    );
  }

  return {
    market,
    ran: true,
    audience: testing ? 'test' : 'live',
    recipients: rows.length,
    sent: res.sent,
    failed: res.failed,
    duplicate: prep.duplicate,
    suppressed: prep.suppressed,
    ...(all.length > targets.length ? { capped: all.length - targets.length } : {}),
    ...(res.error ? { error: res.error } : {}),
  };
}

/* ───────────────────────────────── entry ───────────────────────────────── */

export async function runLifecycle(o: RunOptions = {}): Promise<LifecycleRunResult> {
  const s = await readLifecycleSettings();
  const markets: ContentMarket[] = o.only
    ? [o.only]
    : [...(s.marketsIn ? (['IN'] as const) : []), ...(s.marketsUs ? (['US'] as const) : [])];

  const digests: MarketOutcome[] = [];
  const nudges: MarketOutcome[] = [];
  for (const m of markets) {
    // Sequential on purpose: two markets sending at once through one pooled SMTP
    // connection is how you trip a rate limiter.
    digests.push(await runDigest(m, s, o));
    nudges.push(await runNudges(m, s, o));
  }
  return { mode: s.mode, digests, nudges };
}

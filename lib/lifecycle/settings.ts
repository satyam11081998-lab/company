/**
 * Lifecycle-email settings.
 *
 * Stored as rows in `crm_settings` (migration 0071 — already deployed), so this
 * whole feature ships with NO new table and NO migration. Every read has a
 * hard-coded default, so the feature behaves correctly before a single row
 * exists, and before the CRM tables are migrated at all.
 *
 * The important default: mode = 'manual'. Nothing reaches a real user until
 * somebody flips it to 'auto' in /admin/daily-email.
 *
 * Server-only.
 */
import { createServiceClient } from '@/lib/supabase/service';

export type LifecycleMode = 'off' | 'manual' | 'auto';

export interface LifecycleSettings {
  /**
   *  off    — the nightly job does nothing at all.
   *  manual — the job builds the mail and sends it ONLY to `testEmail`. This is
   *           the review mode: check where it lands and how it reads, then flip.
   *  auto   — the job sends to the real opted-in audience of each market.
   */
  mode: LifecycleMode;
  /** Who gets the mail in manual mode. */
  testEmail: string;
  /** Hour of the day (0–23) the digest goes out, in each market's own clock. */
  sendHourIst: number;
  sendHourEt: number;
  /** Which markets are live. */
  marketsIn: boolean;
  marketsUs: boolean;
  /** Behavioural nudges (abandoned / finished / signed-up-never-started). */
  nudgesOn: boolean;
  /** Max behavioural nudges per run, per market. A brake, not a target. */
  nudgeCap: number;
  /**
   * The open-tracking pixel. OFF by default, on purpose — see
   * lib/lifecycle/deliverability.ts for why an open pixel costs more
   * deliverability than the number it produces is worth.
   */
  openPixel: boolean;
  /** Reply-To on bulk mail. An address a human actually reads. */
  replyTo: string;
}

export const LIFECYCLE_DEFAULTS: LifecycleSettings = {
  mode: 'manual',
  testEmail: '',
  sendHourIst: 22,
  sendHourEt: 21,
  marketsIn: true,
  marketsUs: true,
  nudgesOn: false,
  nudgeCap: 40,
  openPixel: false,
  replyTo: '',
};

/** Keys in crm_settings. Each must match `^[a-z][a-z0-9_.]{1,60}$`. */
const KEY = {
  mode: 'lifecycle.mode',
  testEmail: 'lifecycle.test_email',
  sendHourIst: 'lifecycle.send_hour_ist',
  sendHourEt: 'lifecycle.send_hour_et',
  marketsIn: 'lifecycle.market_in',
  marketsUs: 'lifecycle.market_us',
  nudgesOn: 'lifecycle.nudges_on',
  nudgeCap: 'lifecycle.nudge_cap',
  openPixel: 'lifecycle.open_pixel',
  replyTo: 'lifecycle.reply_to',
} as const satisfies Record<keyof LifecycleSettings, string>;

const MODES: LifecycleMode[] = ['off', 'manual', 'auto'];

function asMode(v: unknown): LifecycleMode | null {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return (MODES as string[]).includes(s) ? (s as LifecycleMode) : null;
}
function asBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return null;
}
function asHour(v: unknown): number | null {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 23 ? n : null;
}
function asEmail(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s) && s.length <= 254 ? s : null;
}
function asCap(v: unknown): number | null {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 2000 ? n : null;
}

/**
 * Read every setting in one query. Any missing or malformed row falls back to
 * the default for that one field — a bad value can never take the feature down,
 * and it can never silently turn 'manual' into 'auto'.
 */
export async function readLifecycleSettings(): Promise<LifecycleSettings> {
  const out: LifecycleSettings = { ...LIFECYCLE_DEFAULTS, testEmail: LIFECYCLE_DEFAULTS.testEmail };
  try {
    const db = createServiceClient();
    const { data, error } = await db.from('crm_settings').select('key, value').in('key', Object.values(KEY));
    if (error || !data) return out;
    const map = new Map<string, any>();
    for (const r of data as Array<{ key: string; value: any }>) map.set(r.key, r.value?.v);

    out.mode = asMode(map.get(KEY.mode)) ?? out.mode;
    out.testEmail = asEmail(map.get(KEY.testEmail)) ?? out.testEmail;
    out.sendHourIst = asHour(map.get(KEY.sendHourIst)) ?? out.sendHourIst;
    out.sendHourEt = asHour(map.get(KEY.sendHourEt)) ?? out.sendHourEt;
    out.marketsIn = asBool(map.get(KEY.marketsIn)) ?? out.marketsIn;
    out.marketsUs = asBool(map.get(KEY.marketsUs)) ?? out.marketsUs;
    out.nudgesOn = asBool(map.get(KEY.nudgesOn)) ?? out.nudgesOn;
    out.nudgeCap = asCap(map.get(KEY.nudgeCap)) ?? out.nudgeCap;
    out.openPixel = asBool(map.get(KEY.openPixel)) ?? out.openPixel;
    out.replyTo = asEmail(map.get(KEY.replyTo)) ?? out.replyTo;
  } catch {
    // crm_settings not migrated, or the DB is unreachable: defaults hold, which
    // means 'manual'. Failing closed is the whole point.
  }
  return out;
}

/** Write only the fields given. Returns the settings as they now stand. */
export async function writeLifecycleSettings(patch: Partial<LifecycleSettings>, actorId: string | null): Promise<LifecycleSettings> {
  const rows: Array<{ key: string; value: { v: unknown }; updated_at: string; updated_by: string | null }> = [];
  const now = new Date().toISOString();
  const put = (key: string, v: unknown) => rows.push({ key, value: { v }, updated_at: now, updated_by: actorId });

  if (patch.mode !== undefined) {
    const m = asMode(patch.mode);
    if (!m) throw new Error('Mode must be off, manual or auto.');
    put(KEY.mode, m);
  }
  if (patch.testEmail !== undefined) {
    const e = asEmail(patch.testEmail);
    if (!e) throw new Error('Enter a valid test email address.');
    put(KEY.testEmail, e);
  }
  if (patch.replyTo !== undefined) {
    const e = asEmail(patch.replyTo);
    if (!e) throw new Error('Enter a valid reply-to address.');
    put(KEY.replyTo, e);
  }
  if (patch.sendHourIst !== undefined) {
    const h = asHour(patch.sendHourIst);
    if (h === null) throw new Error('Send hour must be between 0 and 23.');
    put(KEY.sendHourIst, h);
  }
  if (patch.sendHourEt !== undefined) {
    const h = asHour(patch.sendHourEt);
    if (h === null) throw new Error('Send hour must be between 0 and 23.');
    put(KEY.sendHourEt, h);
  }
  if (patch.nudgeCap !== undefined) {
    const n = asCap(patch.nudgeCap);
    if (n === null) throw new Error('The nudge cap must be between 0 and 2000.');
    put(KEY.nudgeCap, n);
  }
  if (patch.marketsIn !== undefined) put(KEY.marketsIn, !!patch.marketsIn);
  if (patch.marketsUs !== undefined) put(KEY.marketsUs, !!patch.marketsUs);
  if (patch.nudgesOn !== undefined) put(KEY.nudgesOn, !!patch.nudgesOn);
  if (patch.openPixel !== undefined) put(KEY.openPixel, !!patch.openPixel);

  if (rows.length) {
    const db = createServiceClient();
    const { error } = await db.from('crm_settings').upsert(rows, { onConflict: 'key' });
    if (error) throw new Error(`Could not save: ${error.message}`);
  }
  return readLifecycleSettings();
}

/* ───────────────────────────────────────────────────────────────────────────
 * Run ledger — "did today's mail already go out for this market?"
 *
 * Also kept in crm_settings, one row per market, so the nightly job is
 * idempotent: a double-fired cron, a retry, or a manual "send now" followed by
 * the cron cannot send the same digest twice.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface RunRecord {
  /** The market's local date the run was for (YYYY-MM-DD). */
  date: string;
  at: string;
  mode: LifecycleMode;
  sent: number;
  failed: number;
  recipients: number;
  subject: string;
  /** 'test' when it went only to the test address. */
  audience: 'test' | 'live';
  error?: string;
}

const runKey = (market: 'IN' | 'US', kind: 'digest' | 'nudge') =>
  `lifecycle.run.${kind}.${market.toLowerCase()}`;

export async function readRun(market: 'IN' | 'US', kind: 'digest' | 'nudge' = 'digest'): Promise<RunRecord | null> {
  try {
    const db = createServiceClient();
    const { data } = await db.from('crm_settings').select('value').eq('key', runKey(market, kind)).maybeSingle();
    const v = (data as { value?: { v?: RunRecord } } | null)?.value?.v;
    return v && typeof v.date === 'string' ? v : null;
  } catch {
    return null;
  }
}

export async function writeRun(market: 'IN' | 'US', rec: RunRecord, kind: 'digest' | 'nudge' = 'digest'): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from('crm_settings').upsert(
      { key: runKey(market, kind), value: { v: rec }, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );
  } catch {
    // A lost ledger write means at worst one duplicate send tomorrow; it must
    // never fail the send that already succeeded.
  }
}

/** The current hour (0–23) in a market's own clock. */
export function marketHour(market: 'IN' | 'US', now: Date = new Date()): number {
  const tz = market === 'US' ? 'America/New_York' : 'Asia/Kolkata';
  const h = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(now);
  const n = Number(h);
  return Number.isFinite(n) ? n % 24 : now.getUTCHours();
}

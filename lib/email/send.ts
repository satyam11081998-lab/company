/**
 * Email transport + unsubscribe-token helpers.
 *
 * Transactional (receipts) → Gmail / Google Workspace SMTP via nodemailer
 * (low volume, sent from your team@ address). Bulk (admin broadcasts) → Resend
 * HTTP API (better deliverability at volume). Both are graceful NO-OPS when
 * their env vars aren't set, so a deploy never breaks before email is configured.
 *
 * Server-only. Never import into a client component.
 */
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { upgradeReceiptEmail, type UpgradeReceiptData } from './templates';

const EMAIL_FROM = process.env.EMAIL_FROM || 'MECE <team@mece.in>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in';

export interface SendResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

/** Transactional send via Gmail / Workspace SMTP (App Password). */
export async function sendTransactional(msg: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn('[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping transactional email to', msg.to);
    return { sent: false, skipped: true };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
    return { sent: true };
  } catch (e: any) {
    console.error('[email] transactional send failed:', e?.message || e);
    return { sent: false, error: e?.message || 'send failed' };
  }
}

/** Compose + send the branded upgrade receipt. Never throws. */
export async function sendUpgradeReceipt(to: string, data: UpgradeReceiptData): Promise<SendResult> {
  if (!to) return { sent: false, skipped: true };
  const { subject, html, text } = upgradeReceiptEmail(data);
  return sendTransactional({ to, subject, html, text });
}

export interface BulkMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
export interface BulkResult {
  sent: number;
  failed: number;
  skipped?: boolean;
  error?: string;
}

/** Bulk send via Resend batch API (https://resend.com), 100 messages per request. */
export async function sendBulk(messages: BulkMessage[]): Promise<BulkResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping bulk send');
    return { sent: 0, failed: messages.length, skipped: true, error: 'RESEND_API_KEY not configured' };
  }
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100).map((m) => ({
      from: EMAIL_FROM,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      text: m.text,
    }));
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      if (res.ok) {
        sent += batch.length;
      } else {
        failed += batch.length;
        console.error('[email] resend batch failed:', res.status, await res.text().catch(() => ''));
      }
    } catch (e: any) {
      failed += batch.length;
      console.error('[email] resend batch error:', e?.message || e);
    }
  }
  return { sent, failed };
}

// ---------------------------------------------------------------------------
// Unsubscribe token — HMAC of the user id, so no DB token storage is needed.
// ---------------------------------------------------------------------------
function unsubSecret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.RAZORPAY_KEY_SECRET || 'mece-unsub-fallback-secret';
}

export function makeUnsubToken(userId: string): string {
  const sig = crypto.createHmac('sha256', unsubSecret()).update(userId).digest('hex').slice(0, 32);
  return `${Buffer.from(userId).toString('base64url')}.${sig}`;
}

export function verifyUnsubToken(token: string | null | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  const [b64, sig] = token.split('.');
  let userId: string;
  try {
    userId = Buffer.from(b64, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = crypto.createHmac('sha256', unsubSecret()).update(userId).digest('hex').slice(0, 32);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

export function unsubscribeUrl(userId: string): string {
  return `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(makeUnsubToken(userId))}`;
}

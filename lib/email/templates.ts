/**
 * Branded HTML email templates for MECE.
 * Table-based layout + inline styles for broad email-client compatibility.
 * Brand: navy #0F1C33, cardinal red #C8102E, warm off-white #FAF9F6, Inter.
 */

const NAVY = '#0F1C33';
const RED = '#C8102E';
const OFFWHITE = '#FAF9F6';
const INK = '#1A2233';
const MUTED = '#5B6472';
const BORDER = '#E7E3DC';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export interface EmailLayoutOptions {
  preheader?: string; // hidden inbox-preview text
  heading: string;
  contentHtml: string; // inner body HTML (already-safe markup)
  cta?: { label: string; url: string };
  footerNote?: string;
  unsubscribeUrl?: string; // present => render an unsubscribe link (promotional)
}

/** The shared shell every MECE email renders inside. */
export function baseEmailLayout(o: EmailLayoutOptions): string {
  const cta = o.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;"><tr><td>
         <a href="${o.cta.url}" style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:8px;">${escapeHtml(o.cta.label)}</a>
       </td></tr></table>`
    : '';
  const unsub = o.unsubscribeUrl
    ? `<br/><br/>You're receiving this because you have a MECE account. <a href="${o.unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a> from product updates.`
    : '';
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light only"/><title>${escapeHtml(o.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${OFFWHITE};-webkit-text-size-adjust:100%;">
${o.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${OFFWHITE};">${escapeHtml(o.preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OFFWHITE};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
      <tr><td style="background:${NAVY};padding:20px 28px;">
        <img src="${SITE_URL}/logo.png" height="28" alt="MECE" style="height:28px;display:block;border:0;outline:none;text-decoration:none;"/>
      </td></tr>
      <tr><td style="height:3px;background:${RED};line-height:3px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:32px 28px;font-family:Inter,Helvetica,Arial,sans-serif;color:${INK};">
        <h1 style="margin:0 0 8px;font-size:21px;line-height:1.3;color:${NAVY};font-weight:700;">${o.heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:${INK};">${o.contentHtml}</div>
        ${cta}
        ${o.footerNote ? `<p style="margin:22px 0 0;font-size:13px;color:${MUTED};line-height:1.55;">${o.footerNote}</p>` : ''}
      </td></tr>
      <tr><td style="padding:22px 28px;background:${OFFWHITE};border-top:1px solid ${BORDER};font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};line-height:1.6;">
        <strong style="color:${NAVY};">MECE</strong> — Placement interview prep for Indian MBA students.<br/>
        <a href="${SITE_URL}" style="color:${MUTED};text-decoration:underline;">mece.in</a> &middot; <a href="mailto:team@mece.in" style="color:${MUTED};text-decoration:underline;">team@mece.in</a>${unsub}
      </td></tr>
    </table>
    <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;color:#9AA1AC;padding:14px 0;">&copy; ${new Date().getFullYear()} MECE Prep. All rights reserved.</div>
  </td></tr>
</table>
</body></html>`;
}

export interface UpgradeReceiptData {
  name?: string | null;
  tierLabel: string; // 'Pro' | 'Lite'
  periodLabel: string; // 'Monthly' | '3 months' | 'Annual'
  amountInr: number; // rupees
  expiresAt?: string | null; // ISO
}

/** Transactional payment/upgrade confirmation. */
export function upgradeReceiptEmail(d: UpgradeReceiptData): { subject: string; html: string; text: string } {
  const firstName = d.name ? escapeHtml(d.name.split(' ')[0]) : null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const expiry = d.expiresAt
    ? new Date(d.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const row = (k: string, v: string, last = false) =>
    `<tr><td style="padding:12px 16px;${last ? '' : 'border-bottom:1px solid ' + BORDER + ';'}font-size:14px;color:${MUTED};">${k}</td><td style="padding:12px 16px;${last ? '' : 'border-bottom:1px solid ' + BORDER + ';'}font-size:14px;text-align:right;font-weight:600;color:${INK};">${v}</td></tr>`;
  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;">Your upgrade to <strong>MECE ${escapeHtml(d.tierLabel)}</strong> is confirmed — welcome aboard. Your account now has full access to everything in the ${escapeHtml(d.tierLabel)} plan.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border:1px solid ${BORDER};border-radius:10px;border-collapse:separate;">
      ${row('Plan', `${escapeHtml(d.tierLabel)} &middot; ${escapeHtml(d.periodLabel)}`)}
      ${row('Amount paid', `&#8377;${d.amountInr.toLocaleString('en-IN')}`, !expiry)}
      ${expiry ? row('Access until', expiry, true) : ''}
    </table>
    <p style="margin:0;">Jump back in and put it to work:</p>`;
  const html = baseEmailLayout({
    preheader: `Your MECE ${d.tierLabel} upgrade is confirmed.`,
    heading: `You're now on MECE ${escapeHtml(d.tierLabel)}`,
    contentHtml: content,
    cta: { label: 'Go to your dashboard', url: `${SITE_URL}/dashboard` },
    footerNote:
      'This is a payment confirmation for your records. Questions about your subscription? Just reply to this email.',
  });
  const text = `${firstName ? `Hi ${d.name},` : 'Hi there,'}

Your upgrade to MECE ${d.tierLabel} is confirmed.

Plan: ${d.tierLabel} (${d.periodLabel})
Amount paid: Rs ${d.amountInr.toLocaleString('en-IN')}${expiry ? `\nAccess until: ${expiry}` : ''}

Go to your dashboard: ${SITE_URL}/dashboard

— MECE · mece.in`;
  return { subject: `Your MECE ${d.tierLabel} upgrade is confirmed`, html, text };
}

export interface BroadcastData {
  heading: string;
  bodyHtml: string; // admin-authored
  ctaLabel?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
}

/** Promotional / announcement broadcast (always carries an unsubscribe link). */
export function broadcastEmail(d: BroadcastData): string {
  return baseEmailLayout({
    preheader: d.heading,
    heading: d.heading,
    contentHtml: d.bodyHtml,
    cta: d.ctaLabel && d.ctaUrl ? { label: d.ctaLabel, url: d.ctaUrl } : undefined,
    unsubscribeUrl: d.unsubscribeUrl,
  });
}

/**
 * Branded HTML email templates for MECE.
 * Table-based layout + inline styles for broad email-client compatibility.
 * Brand: navy #0F1C33, cardinal red #C8102E, warm off-white #FAF9F6, Inter.
 *
 * STATUTORY NOTE (2026-11-08). Companies Act 2013 s.12(3)(c) requires the
 * company name, registered office address and CIN — with telephone, e-mail and
 * (if any) website — on ALL business letters and billheads, not only on
 * invoices. That block therefore lives in `baseEmailLayout` and so appears on
 * every email this file can produce. Tax particulars under CGST Rule 46 are a
 * separate matter and appear only in the invoice section of the receipt.
 * Source of truth for every identifier: `lib/legal/company.ts`.
 */

import { statutoryIdentityLines } from '@/lib/legal/company';
import {
  formatInvoiceDate,
  formatMinor,
  type InvoiceDocument,
} from '@/lib/legal/invoice';

const NAVY = '#0F1C33';
const RED = '#C8102E';
const OFFWHITE = '#FAF9F6';
const INK = '#1A2233';
const MUTED = '#5B6472';
const BORDER = '#E7E3DC';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in';
// Email IMAGES must be absolute and always point at the live host. NEXT_PUBLIC_SITE_URL
// can resolve to localhost or a preview build when the mail is generated, which makes
// every logo break in the recipient's inbox — so images use this fixed production base.
const EMAIL_ASSETS = process.env.NEXT_PUBLIC_EMAIL_ASSETS_URL || 'https://mece.in';

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
  /** Line under "Team MECE" in the footer. Absent → the India line (unchanged output). */
  tagline?: string;
}

/** Footer line for India recipients (the line every email has always carried). */
export const EMAIL_TAGLINE_IN = 'Placement interview prep for Indian MBA students.';
/** Footer line for US + Europe recipients. */
export const EMAIL_TAGLINE_INTL = 'Case interview prep for consulting, finance and strategy recruiting.';

/** The footer line for a content market ('IN' | 'US'). */
export function emailTagline(content: 'IN' | 'US'): string {
  return content === 'US' ? EMAIL_TAGLINE_INTL : EMAIL_TAGLINE_IN;
}

/**
 * The Companies Act s.12(3)(c) identity block, rendered small and grey at the
 * foot of every email. Returns '' while `lib/legal/company.ts` has nothing to
 * print, so output is byte-identical to before until the registration details
 * are filled in — and `missingStatutoryFields()` is what surfaces the gap.
 */
function statutoryFooterHtml(): string {
  const lines = statutoryIdentityLines();
  if (lines.length === 0) return '';
  return `<div style="margin:0 0 10px;font-size:11px;color:${MUTED};line-height:1.6;">${lines
    .map((l) => escapeHtml(l))
    .join('<br/>')}</div>`;
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
<meta name="color-scheme" content="light only"/><meta name="supported-color-schemes" content="light"/><title>${escapeHtml(o.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${OFFWHITE};-webkit-text-size-adjust:100%;">
${o.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${OFFWHITE};">${escapeHtml(o.preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OFFWHITE};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
      <tr><td style="background:${NAVY};padding:18px 28px;">
        <img src="${EMAIL_ASSETS}/signature/hdr-logo.png" height="30" alt="MECE" style="height:30px;display:block;border:0;outline:none;text-decoration:none;"/>
      </td></tr>
      <tr><td style="height:3px;background:${RED};line-height:3px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:32px 28px;font-family:Inter,Helvetica,Arial,sans-serif;color:${INK};">
        <h1 style="margin:0 0 8px;font-size:21px;line-height:1.3;color:${NAVY};font-weight:700;">${o.heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:${INK};">${o.contentHtml}</div>
        ${cta}
        ${o.footerNote ? `<p style="margin:22px 0 0;font-size:13px;color:${MUTED};line-height:1.55;">${o.footerNote}</p>` : ''}
      </td></tr>
      <tr><td style="padding:24px 28px 8px;background:${OFFWHITE};border-top:1px solid ${BORDER};font-family:Inter,Helvetica,Arial,sans-serif;">
        <img src="${EMAIL_ASSETS}/signature/sig-logo.png" width="128" alt="MECE" style="width:128px;max-width:60%;display:block;border:0;outline:none;text-decoration:none;"/>
        <div style="margin:12px 0 2px;font-size:14px;font-weight:700;color:${NAVY};">Team MECE</div>
        <div style="margin:0 0 12px;font-size:13px;color:${MUTED};line-height:1.5;">${escapeHtml(o.tagline ?? EMAIL_TAGLINE_IN)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:14px;"><a href="mailto:team@mece.in"><img src="${EMAIL_ASSETS}/signature/sig-icon-email.png" width="22" height="22" alt="Email" style="display:block;border:0;outline:none;"/></a></td>
          <td style="padding-right:14px;"><a href="https://www.linkedin.com/company/mece-prep/"><img src="${EMAIL_ASSETS}/signature/sig-icon-linkedin.png" width="22" height="22" alt="LinkedIn" style="display:block;border:0;outline:none;"/></a></td>
          <td><a href="https://www.instagram.com/mece.in/"><img src="${EMAIL_ASSETS}/signature/sig-icon-instagram.png" width="22" height="22" alt="Instagram" style="display:block;border:0;outline:none;"/></a></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 28px 22px;background:${OFFWHITE};font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};line-height:1.6;">
        ${statutoryFooterHtml()}<a href="${SITE_URL}" style="color:${MUTED};text-decoration:underline;">mece.in</a>${unsub}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export interface UpgradeReceiptData {
  name?: string | null;
  tierLabel: string; // 'Pro' | 'Lite'
  periodLabel: string; // 'Monthly' | '3 months' | 'Annual'
  amountInr: number; // WHOLE units of `currency` (rupees unless currency says otherwise — name kept for back-compat)
  expiresAt?: string | null; // ISO
  /** International orders (2026-09-25). Absent → INR, byte-identical to before. */
  currency?: 'INR' | 'USD' | 'EUR';
  /**
   * The statutory invoice, when one could be issued (`lib/legal/issue-invoice.ts`).
   * Absent → the email stays the plain payment confirmation it has always been.
   * That is the deliberate fallback: a confirmation that does not call itself an
   * invoice breaks no rule, whereas an invoice short of its mandatory
   * particulars is a default on every copy sent.
   */
  invoice?: InvoiceDocument | null;
}

/**
 * The invoice, as the recipient sees it. Every row here is a particular that
 * CGST Rule 46 requires, or — while the company is not GST-registered — the
 * explanation of why the tax rows are absent. Renders nothing itself: the
 * caller decides where it sits in the email.
 */
function invoiceBlockHtml(doc: InvoiceDocument): string {
  const cur = doc.currency;
  const money = (minor: number) => formatMinor(minor, cur);
  const { tax } = doc;

  // [label, already-safe value HTML, emphasise?]
  const rows: Array<[string, string, boolean]> = [
    [`${doc.title} no.`, `<strong>${escapeHtml(doc.number)}</strong>`, false],
    ['Date of issue', escapeHtml(formatInvoiceDate(doc.issuedAt, cur)), false],
  ];

  if (doc.recipient.name) rows.push(['Billed to', escapeHtml(doc.recipient.name), false]);
  if (doc.recipient.gstin) rows.push(['Customer GSTIN', escapeHtml(doc.recipient.gstin), false]);

  // Rule 46 proviso for online services supplied to an unregistered recipient:
  // the recipient's State name goes on the invoice whatever the value.
  if (doc.recipient.stateCode && doc.kind === 'tax-invoice') {
    rows.push(['Recipient State code', escapeHtml(doc.recipient.stateCode), false]);
  }
  if (doc.placeOfSupply) rows.push(['Place of supply', escapeHtml(doc.placeOfSupply), false]);

  const sac = doc.line.sacCode ? ` (SAC ${doc.line.sacCode})` : '';
  rows.push(['Description', escapeHtml(doc.line.description + sac), false]);

  if (tax.cgstMinor + tax.sgstMinor + tax.igstMinor > 0) {
    const half = (tax.ratePercent / 2).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    rows.push(['Taxable value', money(tax.taxableMinor), false]);
    if (tax.igstMinor > 0) {
      rows.push([`IGST @ ${tax.ratePercent}%`, money(tax.igstMinor), false]);
    } else {
      rows.push([`CGST @ ${half}%`, money(tax.cgstMinor), false]);
      rows.push([`SGST @ ${half}%`, money(tax.sgstMinor), false]);
    }
  }
  rows.push(['Total paid', `<strong>${money(tax.grossMinor)}</strong>`, true]);
  rows.push(['Tax payable on reverse charge', doc.reverseCharge ? 'Yes' : 'No', false]);

  const html = rows
    .map(([label, value, strong], i) => {
      // No rule under the final row: it would cut across the rounded corner.
      const edge = i === rows.length - 1 ? '' : `border-bottom:1px solid ${BORDER};`;
      const base = `padding:9px 14px;${edge}font-size:13px;`;
      return (
        `<tr><td style="${base}color:${MUTED};">${escapeHtml(label)}</td>` +
        `<td style="${base}text-align:right;color:${INK};${strong ? 'font-weight:700;' : ''}">${value}</td></tr>`
      );
    })
    .join('\n      ');

  const notes = [doc.noTaxNote, doc.exportEndorsement, doc.signatureNote]
    .filter((n): n is string => Boolean(n))
    .map((text) => `<p style="margin:10px 0 0;font-size:11px;color:${MUTED};line-height:1.55;">${escapeHtml(text)}</p>`)
    .join('');

  return `
    <div style="margin:22px 0 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${NAVY};">${escapeHtml(doc.title)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border:1px solid ${BORDER};border-radius:10px;border-collapse:separate;">
      ${html}
    </table>
    ${notes}`;
}

/** Receipt amount labels. INR output is exactly what the template always printed. */
function receiptAmount(d: UpgradeReceiptData): { html: string; text: string } {
  if (d.currency === 'USD' || d.currency === 'EUR') {
    const sym = d.currency === 'USD' ? '$' : '&euro;';
    const txt = d.currency === 'USD' ? 'USD ' : 'EUR ';
    const n = d.amountInr.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return { html: `${sym}${n}`, text: `${txt}${n}` };
  }
  return { html: `&#8377;${d.amountInr.toLocaleString('en-IN')}`, text: `Rs ${d.amountInr.toLocaleString('en-IN')}` };
}

/** The same particulars as `invoiceBlockHtml`, for the plain-text alternative. */
function invoiceBlockText(doc: InvoiceDocument): string {
  const cur = doc.currency;
  const money = (minor: number) => formatMinor(minor, cur);
  const { tax } = doc;
  const lines: string[] = [
    doc.title.toUpperCase(),
    `${doc.title} no.: ${doc.number}`,
    `Date of issue: ${formatInvoiceDate(doc.issuedAt, cur)}`,
  ];
  if (doc.recipient.name) lines.push(`Billed to: ${doc.recipient.name}`);
  if (doc.recipient.gstin) lines.push(`Customer GSTIN: ${doc.recipient.gstin}`);
  if (doc.recipient.stateCode && doc.kind === 'tax-invoice') {
    lines.push(`Recipient State code: ${doc.recipient.stateCode}`);
  }
  if (doc.placeOfSupply) lines.push(`Place of supply: ${doc.placeOfSupply}`);
  lines.push(
    `Description: ${doc.line.description}${doc.line.sacCode ? ` (SAC ${doc.line.sacCode})` : ''}`,
  );
  if (tax.cgstMinor + tax.sgstMinor + tax.igstMinor > 0) {
    const half = tax.ratePercent / 2;
    lines.push(`Taxable value: ${money(tax.taxableMinor)}`);
    if (tax.igstMinor > 0) {
      lines.push(`IGST @ ${tax.ratePercent}%: ${money(tax.igstMinor)}`);
    } else {
      lines.push(`CGST @ ${half}%: ${money(tax.cgstMinor)}`);
      lines.push(`SGST @ ${half}%: ${money(tax.sgstMinor)}`);
    }
  }
  lines.push(`Total paid: ${money(tax.grossMinor)}`);
  lines.push(`Tax payable on reverse charge: ${doc.reverseCharge ? 'Yes' : 'No'}`);
  for (const n of [doc.noTaxNote, doc.exportEndorsement, doc.signatureNote]) {
    if (n) lines.push(n);
  }
  return lines.join('\n');
}

/** Transactional payment/upgrade confirmation, carrying the invoice when one was issued. */
export function upgradeReceiptEmail(d: UpgradeReceiptData): { subject: string; html: string; text: string } {
  const firstName = d.name ? escapeHtml(d.name.split(' ')[0]) : null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const intl = d.currency === 'USD' || d.currency === 'EUR';
  const expiry = d.expiresAt
    ? new Date(d.expiresAt).toLocaleDateString(intl ? 'en-US' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const amount = receiptAmount(d);
  const row = (k: string, v: string, last = false) =>
    `<tr><td style="padding:12px 16px;${last ? '' : 'border-bottom:1px solid ' + BORDER + ';'}font-size:14px;color:${MUTED};">${k}</td><td style="padding:12px 16px;${last ? '' : 'border-bottom:1px solid ' + BORDER + ';'}font-size:14px;text-align:right;font-weight:600;color:${INK};">${v}</td></tr>`;
  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;">Your upgrade to <strong>MECE ${escapeHtml(d.tierLabel)}</strong> is confirmed — welcome aboard. Your account now has full access to everything in the ${escapeHtml(d.tierLabel)} plan.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border:1px solid ${BORDER};border-radius:10px;border-collapse:separate;">
      ${row('Plan', `${escapeHtml(d.tierLabel)} &middot; ${escapeHtml(d.periodLabel)}`)}
      ${row('Amount paid', amount.html, !expiry)}
      ${expiry ? row('Access until', expiry, true) : ''}
    </table>
    ${d.invoice ? invoiceBlockHtml(d.invoice) : ''}
    <p style="margin:18px 0 0;">Jump back in and put it to work:</p>`;
  const html = baseEmailLayout({
    preheader: `Your MECE ${d.tierLabel} upgrade is confirmed.`,
    heading: `You're now on MECE ${escapeHtml(d.tierLabel)}`,
    contentHtml: content,
    cta: { label: 'Go to your dashboard', url: `${SITE_URL}/dashboard` },
    footerNote: d.invoice
      ? `${d.invoice.title} ${d.invoice.number} is reproduced above and is valid for your records and for reimbursement. Questions about your subscription? Just reply to this email.`
      : 'This is a payment confirmation for your records. Questions about your subscription? Just reply to this email.',
  });
  const text = `${firstName ? `Hi ${d.name},` : 'Hi there,'}

Your upgrade to MECE ${d.tierLabel} is confirmed.

Plan: ${d.tierLabel} (${d.periodLabel})
Amount paid: ${amount.text}${expiry ? `\nAccess until: ${expiry}` : ''}
${d.invoice ? `\n${invoiceBlockText(d.invoice)}\n` : ''}
Go to your dashboard: ${SITE_URL}/dashboard

— MECE · mece.in
${statutoryIdentityLines().join('\n')}`;
  const subject = d.invoice
    ? `Your MECE ${d.tierLabel} upgrade is confirmed — ${d.invoice.title.toLowerCase()} ${d.invoice.number}`
    : `Your MECE ${d.tierLabel} upgrade is confirmed`;
  return { subject, html, text };
}

/** Transactional welcome email, sent once when a user finishes onboarding. */
export function welcomeEmail(d: { name?: string | null; intl?: boolean }): { subject: string; html: string; text: string } {
  const firstName = d.name ? escapeHtml(d.name.split(' ')[0]) : null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  if (d.intl) return welcomeEmailIntl(firstName, greeting, d.name ?? null);
  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;">Welcome to <strong>MECE</strong> — you're all set. We built MECE to make case-interview and guesstimate prep something you do a little of every day, and get sharper each time.</p>
    <p style="margin:0 0 8px;">Here's where to start:</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:${INK};font-size:15px;line-height:1.7;">
      <li>Your <strong>daily case + guesstimate</strong> — a fresh one of each, every day.</li>
      <li>The <strong>AI interviewer</strong> that asks real follow-ups and scores your structure.</li>
      <li><strong>GD briefs</strong> on live business news and <strong>industry primers</strong> for context.</li>
    </ul>
    <p style="margin:0;">Your first case is waiting:</p>`;
  const html = baseEmailLayout({
    preheader: 'Welcome to MECE — your placement prep starts now.',
    heading: firstName ? `Welcome to MECE, ${firstName}!` : 'Welcome to MECE!',
    contentHtml: content,
    cta: { label: 'Start your first case', url: `${SITE_URL}/dashboard` },
    footerNote: 'Questions or feedback? Just reply to this email — a real person reads it.',
  });
  const text = `${greeting}

Welcome to MECE — you're all set. We built MECE to make case and guesstimate prep something you do a little of every day.

Start here:
- Your daily case + guesstimate, every day
- The AI interviewer that scores your structure
- GD briefs on live news + industry primers

Start your first case: ${SITE_URL}/dashboard

- MECE / mece.in`;
  return {
    subject: firstName ? `Welcome to MECE, ${firstName}` : 'Welcome to MECE',
    html,
    text,
  };
}

/** International (US + Europe) welcome — no GD briefs or primers; US recruiting voice. */
function welcomeEmailIntl(firstName: string | null, greeting: string, rawName: string | null) {
  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;">Welcome to <strong>MECE</strong> — you're all set. MECE is case interview practice with an AI interviewer that pushes back like a real one, built for consulting, finance and strategy recruiting.</p>
    <p style="margin:0 0 8px;">Here's where to start:</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:${INK};font-size:15px;line-height:1.7;">
      <li>Your <strong>daily case + market sizing question</strong> — a fresh pair every day.</li>
      <li>A <strong>case bank built for US recruiting</strong> — profitability, market entry, M&amp;A, pricing and more.</li>
      <li><strong>Scored feedback in about a minute</strong> on structure, math, synthesis and business judgment.</li>
    </ul>
    <p style="margin:0;">Your first case is waiting:</p>`;
  const html = baseEmailLayout({
    preheader: 'Welcome to MECE — your case interview prep starts now.',
    heading: firstName ? `Welcome to MECE, ${firstName}!` : 'Welcome to MECE!',
    contentHtml: content,
    cta: { label: 'Start your first case', url: `${SITE_URL}/dashboard` },
    footerNote: 'Questions or feedback? Just reply to this email — a real person reads it.',
    tagline: EMAIL_TAGLINE_INTL,
  });
  const text = `${rawName ? `Hi ${rawName.split(' ')[0]},` : 'Hi there,'}

Welcome to MECE — you're all set. Case interview practice with an AI interviewer, built for consulting, finance and strategy recruiting.

Start here:
- Your daily case + market sizing question, every day
- A case bank built for US recruiting
- Scored feedback in about a minute

Start your first case: ${SITE_URL}/dashboard

- MECE / mece.in`;
  return {
    subject: firstName ? `Welcome to MECE, ${firstName}` : 'Welcome to MECE',
    html,
    text,
  };
}

export interface BroadcastData {
  heading: string;
  bodyHtml: string; // admin-authored
  ctaLabel?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
  /** Footer line; absent → India (unchanged). See emailTagline(). */
  tagline?: string;
}

/** Promotional / announcement broadcast (always carries an unsubscribe link). */
export function broadcastEmail(d: BroadcastData): string {
  return baseEmailLayout({
    preheader: d.heading,
    heading: d.heading,
    contentHtml: d.bodyHtml,
    cta: d.ctaLabel && d.ctaUrl ? { label: d.ctaLabel, url: d.ctaUrl } : undefined,
    unsubscribeUrl: d.unsubscribeUrl,
    tagline: d.tagline,
  });
}


export interface PracticeCardData {
  label: string;   // small eyebrow, e.g. "Practice case" / "Practice guesstimate"
  title: string;
  hook?: string;   // one-line pull
  url: string;     // absolute link to the live scored case
  cta?: string;    // button label (default "Practice this")
}

/**
 * A branded "Practice this ->" card for broadcast emails. Renders identically to
 * the daily-digest card so a targeted case dropped into a campaign email matches
 * the rest of the product. The link points at a live, scored /cases/<id>.
 */
export function practiceCard(d: PracticeCardData): string {
  const cta = escapeHtml(d.cta || 'Practice this');
  const hook = d.hook
    ? `<p style="margin:0 0 12px;font-size:13px;color:${MUTED};line-height:1.5;">${escapeHtml(d.hook)}</p>`
    : '';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;border:1px solid ${BORDER};border-radius:12px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${RED};">${escapeHtml(d.label)}</p>
      <p style="margin:0 0 ${d.hook ? '4' : '12'}px;font-size:17px;font-weight:700;color:${NAVY};line-height:1.3;">${escapeHtml(d.title)}</p>
      ${hook}
      <a href="${d.url}" style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 18px;border-radius:8px;">${cta} &rarr;</a>
    </td></tr>
  </table>`;
}

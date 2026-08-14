/**
 * Live-project completion certificates, shared types, house style and helpers.
 *
 * Imported by the admin UI, the admin API routes and the public /verify page,
 * so it must stay free of server-only imports (no next/headers, no service
 * client) and free of client-only imports.
 *
 * House style is enforced in three places on purpose:
 *   1. here, so the admin sees the problem before saving;
 *   2. in the API route, so a crafted request cannot bypass the UI;
 *   3. in a CHECK constraint (migration 0046), so nothing reaches the table.
 * The rule that matters most: no em dashes and no en dashes, ever.
 */

// ── constants ────────────────────────────────────────────────────────────────

export const EN_DASH = '–';
export const EM_DASH = '—';

/** Every field that is printed on the paper and therefore style-checked. */
export const PRINTED_FIELDS = [
  'recipient_name', 'recipient_program', 'cert_title', 'role_title',
  'project_title', 'duration_label', 'engagement_mode', 'reporting_to',
  'scope_line', 'sig1_name', 'sig1_title', 'sig2_name', 'sig2_title',
] as const;

export const MAX_ROLE_TITLE_CHARS = 55;
export const MAX_SCOPE_LINE_CHARS = 200;

export const DEFAULT_CERT_TITLE = 'Certificate of Live Project Completion';

export const CERT_TITLE_PRESETS = [
  'Certificate of Live Project Completion',
  'Certificate of Internship Completion',
  'Certificate of Live Project Contribution',
  'Certificate of Live Project & Foundership',
] as const;

/** Matches MECE-LP-2026-K7QF2M. Crockford base32 suffix: no I, L, O or U. */
export const CERT_ID_RE = /^[A-Z]+(?:-[A-Z]+)*-\d{4}-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{6}$/;

// ── types ────────────────────────────────────────────────────────────────────

/** Exactly what is printed. Mirrors the return shape of verify_certificate(). */
export interface CertificatePrintable {
  cert_id: string;
  recipient_name: string;
  recipient_program: string | null;
  cert_title: string;
  role_title: string;
  project_title: string;
  start_date: string;
  end_date: string;
  duration_label: string | null;
  engagement_mode: string | null;
  reporting_to: string | null;
  scope_line: string;
  sig1_name: string;
  sig1_title: string;
  sig2_name: string;
  sig2_title: string;
  issued_at: string;
  is_revoked: boolean;
}

/** The admin's view. Adds the internal columns the public RPC never returns. */
export interface CertificateRow extends Omit<CertificatePrintable, 'is_revoked'> {
  id: string;
  recipient_email: string | null;
  work_notes: string | null;
  engagement_type: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  created_at: string;
  updated_at: string;
}

/** Admin form payload. `cert_id` is server-generated and never accepted. */
export interface CertificateInput {
  recipient_name: string;
  recipient_program?: string | null;
  recipient_email?: string | null;
  cert_title: string;
  role_title: string;
  project_title: string;
  start_date: string;
  end_date: string;
  duration_label?: string | null;
  engagement_mode?: string | null;
  reporting_to?: string | null;
  scope_line: string;
  work_notes?: string | null;
  engagement_type?: string | null;
  sig1_name: string;
  sig1_title: string;
  sig2_name: string;
  sig2_title: string;
}

export interface AiDraft {
  role_title: string;
  scope_line: string;
  alternatives: { role_title: string[]; scope_line: string[] };
}

// ── house style ──────────────────────────────────────────────────────────────

/**
 * Replace en/em dashes with house-legal punctuation instead of rejecting
 * outright. A dash between two dates becomes a hyphen; anywhere else it is
 * doing the job of a comma.
 */
export function stripDashes(value: string): string {
  // Deliberately does NOT trim: this runs on every keystroke in the admin form,
  // and trimming here makes it impossible to type a space between two words.
  // Trimming happens once, at the API boundary, before the row is written.
  return value
    // date or number range: "2025 - 27" becomes "2025-27"
    .replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2')
    // anywhere else a dash is doing the job of a comma
    .replace(/\s*[–—]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',');
}

export function hasDash(value: string | null | undefined): boolean {
  return !!value && /[–—]/.test(value);
}

export interface ValidationIssue {
  field: string;
  message: string;
}

/**
 * Validate an admin payload. Returns [] when the certificate may be issued.
 * Pure and synchronous so the UI can call it on every keystroke.
 */
export function validateCertificate(input: Partial<CertificateInput>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const required: (keyof CertificateInput)[] = [
    'recipient_name', 'cert_title', 'role_title', 'project_title',
    'start_date', 'end_date', 'scope_line', 'sig1_name', 'sig1_title',
    'sig2_name', 'sig2_title',
  ];

  for (const field of required) {
    if (!String(input[field] ?? '').trim()) {
      issues.push({ field, message: 'Required.' });
    }
  }

  for (const field of PRINTED_FIELDS) {
    const value = input[field as keyof CertificateInput];
    if (hasDash(typeof value === 'string' ? value : null)) {
      issues.push({
        field,
        message: 'No em dashes or en dashes. Use a comma, a colon, or a plain hyphen.',
      });
    }
  }

  const role = String(input.role_title ?? '').trim();
  if (role.length > MAX_ROLE_TITLE_CHARS) {
    issues.push({
      field: 'role_title',
      message: `${role.length} characters. Keep it to ${MAX_ROLE_TITLE_CHARS} or fewer.`,
    });
  }

  const scope = String(input.scope_line ?? '').trim();
  if (scope.length > MAX_SCOPE_LINE_CHARS) {
    issues.push({
      field: 'scope_line',
      message: `${scope.length} characters. Keep it to ${MAX_SCOPE_LINE_CHARS} or fewer.`,
    });
  }
  // One sentence. A trailing full stop is fine; an interior one is not.
  if (scope && scope.slice(0, -1).includes('. ')) {
    issues.push({ field: 'scope_line', message: 'One sentence only.' });
  }

  const { start_date: start, end_date: end } = input;
  if (start && end && end < start) {
    issues.push({ field: 'end_date', message: 'End date is before the start date.' });
  }

  const email = String(input.recipient_email ?? '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    issues.push({ field: 'recipient_email', message: 'Not a valid email address.' });
  }

  return issues;
}

// ── formatting ───────────────────────────────────────────────────────────────

/** "2026-03-01" -> "01 March 2026". Date-only, so parse as UTC, never local. */
export function formatCertDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(d);
}

/** Whole months between two dates, rendered as "5 months" / "1 month". */
export function durationLabelFor(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return '';
  const a = new Date(`${startIso.slice(0, 10)}T00:00:00Z`);
  const b = new Date(`${endIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return '';

  let months =
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  // An engagement ending on the 31st has served that month; ending on the 2nd
  // has not. Count the month only once most of it has elapsed.
  if (b.getUTCDate() < a.getUTCDate() - 2) months -= 1;

  if (months <= 0) {
    const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
    const weeks = Math.max(1, Math.round(days / 7));
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  return months === 1 ? '1 month' : `${months} months`;
}

/** Public verification URL. Absolute, because it is printed and QR-encoded. */
export function verifyUrlFor(certId: string, origin = 'https://mece.in'): string {
  return `${origin.replace(/\/+$/, '')}/verify/${encodeURIComponent(certId)}`;
}

/** Microprint band: repeats with the cert id so it differs per certificate. */
export function microprintFor(certId: string, repeats = 6): string {
  return `MECE·LIVE PROJECT·${certId}·AUTHENTIC·`.repeat(repeats);
}

/** "Satyam Kumar" -> "satyam-kumar", for the download filename. */
export function slugifyName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'recipient';
}

export function certificateFilename(certId: string, recipientName: string): string {
  return `MECE-${certId}-${slugifyName(recipientName)}.pdf`;
}

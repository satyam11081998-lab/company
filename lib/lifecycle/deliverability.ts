/**
 * Deliverability preflight.
 *
 * The reason MECE mail lands in Promotions or Spam is almost never the wording.
 * Rewriting copy is the one lever that feels like it should work and is the one
 * that moves the needle least. What actually decides placement:
 *
 *   1. AUTHENTICATION. Since February 2024 Gmail and Yahoo require bulk senders
 *      to publish SPF, DKIM *and* DMARC, with the DKIM or SPF domain aligned to
 *      the From domain. A missing DMARC record alone is enough to get mail
 *      filtered no matter how it reads. This is DNS, not code — so this module
 *      looks the records up and reports what is actually published.
 *   2. COMPLAINT RATE. Gmail's published threshold is 0.3%. One-click
 *      unsubscribe (already implemented in lib/email/send.ts) is what keeps
 *      people from reaching for "report spam" instead.
 *   3. STRUCTURE. A text/plain twin, few links, no image-only content, and no
 *      open-tracking pixel. See `structuralChecks` below.
 *
 * And the thing worth saying plainly: an open-tracking pixel is a bad trade. It
 * is a recognised bulk-mail marker, and since Apple Mail Privacy Protection
 * (2021) Apple pre-fetches remote images, so a large share of recorded "opens"
 * never happened. You pay deliverability for a number that is wrong. Clicks are
 * real — they are a human choosing to act — and they cost nothing extra. That is
 * why `lifecycle.open_pixel` defaults to false.
 *
 * Node runtime only (uses dns). Never import into an edge route.
 */
import { promises as dns } from 'dns';

export type Verdict = 'pass' | 'warn' | 'fail' | 'unknown';

export interface Check {
  id: string;
  label: string;
  verdict: Verdict;
  detail: string;
  /** What to do about it, when it isn't a pass. */
  fix?: string;
}

const FROM_HEADER = process.env.EMAIL_FROM || 'MECE <team@mece.in>';

/** The domain in EMAIL_FROM — the one that has to be authenticated. */
export function fromDomain(header: string = FROM_HEADER): string {
  const m = header.match(/<([^>]+)>/);
  const addr = (m ? m[1] : header).trim();
  const at = addr.lastIndexOf('@');
  return at > 0 ? addr.slice(at + 1).toLowerCase().replace(/[>\s]+$/, '') : '';
}

async function txt(name: string): Promise<string[]> {
  try {
    const rows = await dns.resolveTxt(name);
    return rows.map((r) => r.join(''));
  } catch {
    return [];
  }
}

async function checkMx(domain: string): Promise<Check> {
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx.length) throw new Error('none');
    return {
      id: 'mx',
      label: 'MX records',
      verdict: 'pass',
      detail: `${mx.length} host${mx.length > 1 ? 's' : ''} — ${mx.map((m) => m.exchange).slice(0, 3).join(', ')}`,
    };
  } catch {
    return {
      id: 'mx',
      label: 'MX records',
      verdict: 'fail',
      detail: `No MX record on ${domain}.`,
      fix: `Mail sent from @${domain} with nowhere to receive it is treated as suspicious, and replies bounce. Point MX at your mail provider.`,
    };
  }
}

async function checkSpf(domain: string): Promise<Check> {
  const records = (await txt(domain)).filter((r) => /^v=spf1\b/i.test(r));
  if (!records.length) {
    return {
      id: 'spf',
      label: 'SPF',
      verdict: 'fail',
      detail: `No v=spf1 record on ${domain}.`,
      fix: `Add a TXT record on ${domain}: v=spf1 include:_spf.google.com include:amazonses.com ~all — keep only the includes for services that actually send as you (Google Workspace for transactional, Resend for bulk). Resend's dashboard gives you the exact include for your account.`,
    };
  }
  if (records.length > 1) {
    return {
      id: 'spf',
      label: 'SPF',
      verdict: 'fail',
      detail: `${records.length} SPF records on ${domain}. More than one is invalid.`,
      fix: 'Merge them into a single TXT record. Two SPF records make SPF fail outright, which is worse than having none.',
    };
  }
  const rec = records[0];
  const hasSend = /include:|a[: ]|mx[: ]|ip4:|ip6:/i.test(rec);
  const all = rec.match(/([~\-+?])all\b/i)?.[1];
  if (!hasSend) {
    return { id: 'spf', label: 'SPF', verdict: 'warn', detail: rec, fix: 'The record authorises no sender. Add the include for your sending service.' };
  }
  if (all === '+') {
    return { id: 'spf', label: 'SPF', verdict: 'fail', detail: rec, fix: 'Ends in +all, which authorises the entire internet to send as you. Change it to ~all.' };
  }
  return {
    id: 'spf',
    label: 'SPF',
    verdict: all ? 'pass' : 'warn',
    detail: rec,
    ...(all ? {} : { fix: 'No all-qualifier. End the record with ~all so receivers know what to do with an unlisted sender.' }),
  };
}

async function checkDmarc(domain: string): Promise<Check> {
  const records = (await txt(`_dmarc.${domain}`)).filter((r) => /^v=DMARC1\b/i.test(r));
  if (!records.length) {
    return {
      id: 'dmarc',
      label: 'DMARC',
      verdict: 'fail',
      detail: `No DMARC record at _dmarc.${domain}.`,
      fix: `This is the single most likely reason your mail is being filtered. Gmail and Yahoo have required DMARC from bulk senders since February 2024. Add a TXT record at _dmarc.${domain}: v=DMARC1; p=none; rua=mailto:dmarc@${domain} — p=none changes nothing about delivery, it only starts the reports, which is the right first step. Tighten to quarantine later once the reports are clean.`,
    };
  }
  const rec = records[0];
  const policy = rec.match(/\bp=(none|quarantine|reject)\b/i)?.[1]?.toLowerCase();
  if (!policy) {
    return { id: 'dmarc', label: 'DMARC', verdict: 'fail', detail: rec, fix: 'The record has no p= policy tag, so it is ignored. Add p=none to begin with.' };
  }
  const rua = /\brua=/i.test(rec);
  return {
    id: 'dmarc',
    label: 'DMARC',
    verdict: 'pass',
    detail: `p=${policy}${rua ? ', reporting on' : ', no rua'}`,
    ...(rua ? {} : { fix: `Add rua=mailto:dmarc@${domain} so you can see who is sending as you and whether alignment is passing.` }),
  };
}

/**
 * DKIM selectors we can check without being told which one is in use. A miss is
 * not proof of absence — a provider can use any selector — so a failure here is
 * reported as a warning with instructions, never as a hard fail.
 */
const DKIM_SELECTORS: Array<{ sel: string; who: string }> = [
  { sel: 'resend', who: 'Resend' },
  { sel: 'google', who: 'Google Workspace' },
  { sel: 's1', who: 'Resend / SES' },
  { sel: 's2', who: 'Resend / SES' },
  { sel: 'k1', who: 'Mailchimp / Mandrill' },
  { sel: 'default', who: 'generic' },
];

async function checkDkim(domain: string): Promise<Check> {
  const found: string[] = [];
  await Promise.all(
    DKIM_SELECTORS.map(async ({ sel, who }) => {
      const recs = await txt(`${sel}._domainkey.${domain}`);
      if (recs.some((r) => /p=[A-Za-z0-9+/]/.test(r))) found.push(`${sel} (${who})`);
    }),
  );
  if (found.length) {
    return { id: 'dkim', label: 'DKIM', verdict: 'pass', detail: `Signing key published for selector${found.length > 1 ? 's' : ''}: ${found.join(', ')}.` };
  }
  return {
    id: 'dkim',
    label: 'DKIM',
    verdict: 'warn',
    detail: `No key found at the common selectors on ${domain}.`,
    fix: `Verify the domain in Resend and add the CNAME/TXT records it gives you, and turn on DKIM for Google Workspace (Admin → Apps → Gmail → Authenticate email). If your provider uses a selector not in the list this check can miss it — confirm in the provider's dashboard, and check a received message's Authentication-Results header for "dkim=pass".`,
  };
}

/** Does the From domain match the site domain? A mismatch hurts trust and alignment. */
function checkAlignment(domain: string): Check {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
  const root = (d: string) => d.split('.').slice(-2).join('.');
  if (!domain) {
    return { id: 'align', label: 'From address', verdict: 'fail', detail: `EMAIL_FROM is unparseable: ${FROM_HEADER}`, fix: 'Set EMAIL_FROM to something like "MECE <team@mece.in>".' };
  }
  const ok = root(domain) === root(site);
  return {
    id: 'align',
    label: 'From address',
    verdict: ok ? 'pass' : 'warn',
    detail: `${FROM_HEADER} → ${domain}${ok ? '' : ` (site is ${site})`}`,
    ...(ok ? {} : { fix: `The From domain and the site domain are different roots, so DMARC alignment and reader trust both suffer. Send as @${root(site)}.` }),
  };
}

export interface StructuralInput {
  openPixel: boolean;
  replyTo: string;
  hasResendKey: boolean;
  hasSmtp: boolean;
  unsubscribeHeader: boolean;
  textPart: boolean;
}

/** Everything that is decided by code and configuration rather than DNS. */
export function structuralChecks(i: StructuralInput): Check[] {
  const out: Check[] = [];

  out.push(
    i.openPixel
      ? {
          id: 'pixel',
          label: 'Open tracking',
          verdict: 'warn',
          detail: 'The 1×1 open pixel is ON.',
          fix: 'Turn it off. It is a recognised bulk-mail marker that pushes mail toward Promotions, and Apple Mail Privacy Protection pre-fetches images, so a large share of the opens it records never happened. Click-through to the case is a real measurement and costs nothing.',
        }
      : { id: 'pixel', label: 'Open tracking', verdict: 'pass', detail: 'No open pixel. Clicks are measured instead — a real signal rather than an inflated one.' },
  );

  out.push(
    i.unsubscribeHeader
      ? { id: 'unsub', label: 'One-click unsubscribe', verdict: 'pass', detail: 'List-Unsubscribe and List-Unsubscribe-Post are set (RFC 8058).' }
      : { id: 'unsub', label: 'One-click unsubscribe', verdict: 'fail', detail: 'Missing.', fix: 'Required of bulk senders by Gmail and Yahoo since February 2024.' },
  );

  out.push(
    i.textPart
      ? { id: 'text', label: 'Plain-text part', verdict: 'pass', detail: 'Every message carries a text/plain alternative.' }
      : { id: 'text', label: 'Plain-text part', verdict: 'warn', detail: 'HTML-only.', fix: 'HTML-only mail scores worse with filters. Send a text/plain alternative.' },
  );

  out.push(
    i.replyTo
      ? { id: 'replyto', label: 'Reply-To', verdict: 'pass', detail: i.replyTo }
      : {
          id: 'replyto',
          label: 'Reply-To',
          verdict: 'warn',
          detail: 'Not set.',
          fix: 'Set a Reply-To you actually read. Replies are the strongest positive engagement signal a mailbox provider can observe, and at your scale the answers are worth more than the open rate.',
        },
  );

  out.push(
    i.hasResendKey
      ? { id: 'transport', label: 'Bulk transport', verdict: 'pass', detail: 'Resend (shared IP pool with managed reputation).' }
      : i.hasSmtp
        ? {
            id: 'transport',
            label: 'Bulk transport',
            verdict: 'warn',
            detail: 'Gmail / Workspace SMTP fallback.',
            fix: 'Workable at your volume, but consumer Gmail caps near 500/day and Workspace near 2000, and bulk sent through a personal mailbox builds no sender reputation. Set RESEND_API_KEY before the list grows.',
          }
        : { id: 'transport', label: 'Bulk transport', verdict: 'fail', detail: 'No transport configured.', fix: 'Set RESEND_API_KEY, or GMAIL_USER + GMAIL_APP_PASSWORD.' },
  );

  return out;
}

/** Look up everything in DNS. Each lookup is independent; one failure never hides the others. */
export async function dnsChecks(domain = fromDomain()): Promise<Check[]> {
  if (!domain) return [checkAlignment(domain)];
  const [mx, spf, dmarc, dkim] = await Promise.all([checkMx(domain), checkSpf(domain), checkDmarc(domain), checkDkim(domain)]);
  return [checkAlignment(domain), spf, dkim, dmarc, mx];
}

export function worstVerdict(checks: Check[]): Verdict {
  if (checks.some((c) => c.verdict === 'fail')) return 'fail';
  if (checks.some((c) => c.verdict === 'warn')) return 'warn';
  if (checks.every((c) => c.verdict === 'pass')) return 'pass';
  return 'unknown';
}

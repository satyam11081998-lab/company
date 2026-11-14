/**
 * Print the live SPF / DKIM / DMARC / MX verdict for the sending domain.
 *
 *   npx tsx scripts/check-deliverability.ts
 *   npx tsx scripts/check-deliverability.ts mece.in
 *
 * This is the first thing to run when mail is landing in Promotions or Spam.
 * Authentication is what mailbox providers judge first, and it lives in DNS —
 * no amount of rewriting the copy changes it. Gmail and Yahoo have required
 * SPF, DKIM and DMARC from bulk senders since February 2024.
 *
 * Needs the network but no keys, no database and no deploy.
 */
import { dnsChecks, fromDomain, structuralChecks, worstVerdict, type Check } from '../lib/lifecycle/deliverability';

const MARK: Record<Check['verdict'], string> = { pass: '  OK  ', warn: ' WARN ', fail: ' FAIL ', unknown: '  ?   ' };

function show(c: Check) {
  console.log(`[${MARK[c.verdict]}] ${c.label}`);
  console.log(`          ${c.detail}`);
  if (c.fix) {
    for (const line of wrap(c.fix, 92)) console.log(`          → ${line}`);
  }
  console.log('');
}

function wrap(s: string, n: number): string[] {
  const words = s.split(/\s+/);
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if (line && line.length + w.length + 1 > n) {
      out.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) out.push(line);
  return out;
}

async function main() {
  const domain = process.argv[2]?.trim() || fromDomain() || 'mece.in';
  console.log(`\nDeliverability check — ${domain}`);
  console.log(`From header: ${process.env.EMAIL_FROM || 'MECE <team@mece.in>  (EMAIL_FROM not set here; this is the default)'}\n`);

  const dns = await dnsChecks(domain);
  console.log('DNS — what mailbox providers check first\n');
  for (const c of dns) show(c);

  // These two are read from the environment this script runs in, so locally they
  // reflect .env.local rather than production. The admin page shows the real
  // ones; the settings it reads are in the database, not here.
  const structural = structuralChecks({
    openPixel: false,
    replyTo: '',
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSmtp: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    unsubscribeHeader: true,
    textPart: true,
  });
  console.log('Transport — from this shell’s environment, not production\n');
  show(structural.find((c) => c.id === 'transport')!);

  const verdict = worstVerdict(dns);
  const failures = dns.filter((c) => c.verdict === 'fail');
  console.log('─'.repeat(100));
  if (verdict === 'pass') {
    console.log('DNS is clean. If mail is still being filtered, the cause is reputation or structure, not authentication:');
    console.log('keep the complaint rate under 0.3%, keep volume steady, and leave the open-tracking pixel off.');
  } else if (failures.length) {
    console.log(`${failures.length} hard failure${failures.length > 1 ? 's' : ''}: ${failures.map((c) => c.label).join(', ')}.`);
    console.log('Fix these before switching the daily email to auto — until they are fixed, filtering is expected');
    console.log('however well the email reads.');
  } else {
    console.log('No hard failures, but see the warnings above.');
  }
  console.log('');
  process.exitCode = failures.length ? 1 : 0;
}

main().catch((e) => {
  console.error('check failed:', e?.message || e);
  process.exitCode = 1;
});

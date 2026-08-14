import { cache } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/static';
import {
  CERT_ID_RE, formatCertDate, type CertificatePrintable,
} from '@/lib/certificates';

/**
 * PUBLIC certificate verification. mece.in/verify/<cert id>
 *
 * A recruiter scanning the QR is not a MECE user and never will be. If this
 * page asked them to sign in, the certificate would be worthless and the QR
 * decoration. So:
 *
 *   - '/verify' is in PUBLIC_ROUTES, so middleware never bounces it to /login;
 *   - it reads through the anon RPC verify_certificate(), which is exact match
 *     only and returns nothing but what is printed on the paper. There is no
 *     table grant and no listable view, so the certificate register cannot be
 *     enumerated;
 *   - it is server-rendered with real metadata, so the link previews correctly
 *     when pasted into an ATS or an email;
 *   - an unknown or revoked id gets a plain explanation, never a 404 and never
 *     a redirect.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE = 'https://mece.in';

/**
 * Best-effort per-IP throttle.
 *
 * Honest about what this is: serverless instances do not share memory, so a
 * determined attacker spread across instances is not stopped by it. The PRIMARY
 * defence against walking the register is that cert ids are random, not
 * sequential (6 Crockford base32 characters, ~1.07e9), and that a malformed id
 * is rejected before the database is touched. This just makes the cheap version
 * of the attack pointless. Swap in a shared store if that ever stops being true.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function throttled(): boolean {
  const ip = (headers().get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) HITS.clear();   // crude ceiling; this is a cache, not a ledger
  return recent.length > MAX_PER_WINDOW;
}

/**
 * `cache()` dedupes within a single render pass, so generateMetadata and the
 * page body share one RPC call instead of making two.
 */
const lookup = cache(async (certId: string): Promise<CertificatePrintable | null> => {
  // Reject anything not shaped like a certificate id before touching the
  // database, so this page cannot be used as a general query surface.
  const candidate = certId.trim().toUpperCase();
  if (!CERT_ID_RE.test(candidate)) return null;
  if (throttled()) return null;

  const supabase = createStaticClient();
  const { data, error } = await supabase.rpc('verify_certificate', { p_cert_id: candidate });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as CertificatePrintable;
});

export async function generateMetadata(
  { params }: { params: { certId: string } },
): Promise<Metadata> {
  const cert = await lookup(params.certId);
  if (!cert) {
    return {
      title: 'Certificate not found | MECE',
      description: 'This certificate id does not match any certificate issued by MECE.',
      robots: { index: false, follow: false },
    };
  }
  const title = `${cert.recipient_name} | ${cert.cert_title} | MECE`;
  const periodMeta = cert.duration_label === 'Ongoing'
    ? `${formatCertDate(cert.start_date)} - Ongoing`
    : `${formatCertDate(cert.start_date)} to ${formatCertDate(cert.end_date)}`;
  const description = cert.is_revoked
    ? `This MECE certificate (${cert.cert_id}) has been revoked and is no longer valid.`
    : `${cert.recipient_name} completed a live project at MECE as ${cert.role_title}, `
      + `${periodMeta}. `
      + `Verified against MECE's issuance record.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/verify/${cert.cert_id}` },
    robots: { index: false, follow: true },
    openGraph: { title, description, url: `${SITE}/verify/${cert.cert_id}`, type: 'article' },
    twitter: { card: 'summary', title, description },
  };
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 sm:flex-row sm:gap-6">
      <dt className="w-full shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-52">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="MECE" className="h-7 w-auto" />
        </Link>
        {children}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Verification is provided by MECE (mece.in). Questions about a certificate?
          Write to <a className="underline" href="mailto:team@mece.in">team@mece.in</a>.
        </p>
      </div>
    </main>
  );
}

export default async function VerifyCertificatePage(
  { params }: { params: { certId: string } },
) {
  const cert = await lookup(params.certId);

  if (!cert) {
    return (
      <Shell>
        <div className="rounded-xl border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Certificate check
          </p>
          <h1 className="mt-2 text-2xl font-bold text-navy">Not a valid MECE certificate</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            No certificate was issued with the id{' '}
            <span className="font-mono font-semibold text-foreground">
              {params.certId.slice(0, 40)}
            </span>
            . Check for a typo, or ask the holder to resend the verification link.
          </p>
        </div>
      </Shell>
    );
  }

  const period = cert.duration_label === 'Ongoing'
    ? `${formatCertDate(cert.start_date)} - Ongoing`
    : `${formatCertDate(cert.start_date)} to ${formatCertDate(cert.end_date)}`;

  return (
    <Shell>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className={`px-8 py-6 ${cert.is_revoked ? 'bg-destructive' : 'bg-navy'}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {cert.is_revoked ? 'Revoked certificate' : 'Verified certificate'}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">{cert.recipient_name}</h1>
          <p className="mt-1 text-sm text-white/80">{cert.cert_title}</p>
        </div>

        {cert.is_revoked && (
          <div className="border-b border-border bg-destructive/10 px-8 py-4 text-sm text-destructive">
            This certificate was issued by MECE and has since been <strong>revoked</strong>.
            It should not be relied on.
          </div>
        )}

        <dl className="px-8 py-2">
          <Row label="Certificate ID" value={cert.cert_id} />
          <Row label="Role" value={cert.role_title} />
          <Row label="Programme" value={cert.recipient_program} />
          <Row label="Project" value={cert.project_title} />
          <Row label="Engagement period" value={period} />
          <Row label="Duration" value={cert.duration_label} />
          <Row label="Mode" value={cert.engagement_mode} />
          <Row label="Reported to" value={cert.reporting_to} />
          <Row label="Scope of work" value={cert.scope_line} />
          <Row label="Issued on" value={formatCertDate(cert.issued_at)} />
          <Row label="Signed by" value={`${cert.sig1_name} (${cert.sig1_title}), ${cert.sig2_name} (${cert.sig2_title})`} />
        </dl>

        <div className="border-t border-border bg-muted/40 px-8 py-4 text-xs text-muted-foreground">
          This page is generated from MECE&rsquo;s issuance record at the moment you loaded it.
          It shows only what is printed on the certificate.
        </div>
      </div>
    </Shell>
  );
}

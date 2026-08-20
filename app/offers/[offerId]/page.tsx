import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/static';

/**
 * PUBLIC offer-letter verification. mece.in/offers/<offer id>
 *
 * Same principle as /verify for completion certificates: the person scanning
 * the QR on an offer letter is the candidate or someone the candidate showed
 * it to. They have no MECE account. The page must resolve without auth.
 *
 *   - '/offers' is in PUBLIC_ROUTES (see lib/constants.ts)
 *   - reads through the anon RPC verify_offer(), exact match only
 *   - returns nothing beyond what is printed on the letter
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE = 'https://mece.in';

/** Matches MECE-OL-2026-001 style IDs. */
const OFFER_ID_RE = /^MECE-OL-\d{4}-\d{3}$/;

interface OfferRecord {
  offer_id: string;
  candidate_name: string;
  role_title: string;
  engagement_type: string;
  duration: string;
  start_date: string;
  issued_date: string;
  signatory_name: string;
  signatory_title: string;
  is_active: boolean;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(d);
}

const lookup = cache(async (offerId: string): Promise<OfferRecord | null> => {
  const candidate = offerId.trim().toUpperCase();
  if (!OFFER_ID_RE.test(candidate)) return null;

  const supabase = createStaticClient();
  const { data, error } = await supabase.rpc('verify_offer', { p_offer_id: candidate });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as OfferRecord;
});

export async function generateMetadata(
  { params }: { params: { offerId: string } },
): Promise<Metadata> {
  const offer = await lookup(params.offerId);
  if (!offer) {
    return {
      title: 'Offer not found | MECE',
      description: 'This offer letter ID does not match any offer issued by MECE.',
      robots: { index: false, follow: false },
    };
  }
  const title = `Offer Letter: ${offer.candidate_name} | ${offer.role_title} | MECE`;
  const description = `${offer.candidate_name} has been offered the role of ${offer.role_title} at MECE. Issued ${formatDate(offer.issued_date)}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/offers/${offer.offer_id}` },
    robots: { index: false, follow: true },
    openGraph: { title, description, url: `${SITE}/offers/${offer.offer_id}`, type: 'article' },
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
          Verification is provided by MECE (mece.in). Questions about an offer letter?
          Write to <a className="underline" href="mailto:team@mece.in">team@mece.in</a>.
        </p>
      </div>
    </main>
  );
}

export default async function VerifyOfferPage(
  { params }: { params: { offerId: string } },
) {
  const offer = await lookup(params.offerId);

  if (!offer) {
    return (
      <Shell>
        <div className="rounded-xl border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Offer verification
          </p>
          <h1 className="mt-2 text-2xl font-bold text-navy">Not a valid MECE offer letter</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            No offer letter was issued with the ID{' '}
            <span className="font-mono font-semibold text-foreground">
              {params.offerId.slice(0, 30)}
            </span>
            . Check for a typo, or contact the issuing team.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className={`px-8 py-6 ${offer.is_active ? 'bg-navy' : 'bg-muted'}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {offer.is_active ? 'Verified offer letter' : 'Withdrawn offer'}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">{offer.candidate_name}</h1>
          <p className="mt-1 text-sm text-white/80">{offer.role_title}</p>
        </div>

        {!offer.is_active && (
          <div className="border-b border-border bg-destructive/10 px-8 py-4 text-sm text-destructive">
            This offer letter was issued by MECE and has since been <strong>withdrawn</strong>.
          </div>
        )}

        <dl className="px-8 py-2">
          <Row label="Offer ID" value={offer.offer_id} />
          <Row label="Candidate" value={offer.candidate_name} />
          <Row label="Role" value={offer.role_title} />
          <Row label="Engagement" value={offer.engagement_type} />
          <Row label="Duration" value={offer.duration} />
          <Row label="Start date" value={formatDate(offer.start_date)} />
          <Row label="Issued on" value={formatDate(offer.issued_date)} />
          <Row label="Signed by" value={`${offer.signatory_name} (${offer.signatory_title})`} />
        </dl>

        <div className="border-t border-border bg-muted/40 px-8 py-4 text-xs text-muted-foreground">
          This page is generated from MECE&rsquo;s issuance record at the moment you loaded it.
          It confirms only that this offer letter was issued by MECE.
        </div>
      </div>
    </Shell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo';
import { getPublishedSeoPages } from '@/lib/seo-pages';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Insights — business stories for MBA interviews and GDs — MECE',
  description:
    'A business story a day, with sourced facts and figures, turned into case-interview and group-discussion practice for MBA placements.',
  alternates: { canonical: `${SITE_URL}/insights` },
};

export default async function InsightsIndex() {
  const pages = await getPublishedSeoPages(200);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between text-sm">
        <Link href="/" className="font-semibold text-navy hover:text-primary">MECE</Link>
        <Link href="/signup" className="text-muted-foreground hover:text-foreground">Practise free</Link>
      </div>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Insights</h1>
      <p className="mt-2 text-body text-muted-foreground">
        A business story a day, with sourced facts and figures, turned into case-interview and group-discussion
        practice: what happened, why it matters, and how it can come up in your interview.
      </p>

      {pages.length === 0 ? (
        <p className="mt-8 text-muted-foreground">New breakdowns are on the way. In the meantime,{' '}
          <Link href="/learn/mece-framework" className="text-navy underline hover:text-primary">learn the MECE method</Link>.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {pages.map((p) => (
            <li key={p.id}>
              <Link
                href={`/insights/${p.slug}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <p className="text-xs text-muted-foreground">
                  {new Date(p.published_at ?? p.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
                  })}
                </p>
                <p className="mt-0.5 text-strong font-semibold text-foreground">{p.title}</p>
                {p.dek && <p className="mt-1 text-small text-muted-foreground">{p.dek}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

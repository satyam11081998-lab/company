import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import { SITE_URL } from '@/lib/seo';
import { Download, ExternalLink } from 'lucide-react';

/**
 * Public, unauthenticated cheat-sheet viewer: mece.in/s/<id>.
 *
 * The whole point of the link is that a stranger can open it, so this page is
 * in PUBLIC_ROUTES and reads through the service role. It renders the branded,
 * watermarked PDF inline and puts a signup CTA underneath — the sheet is the
 * ad, this page is the landing.
 */
export const dynamic = 'force-dynamic';

interface SheetRow {
  id: string;
  point_count: number;
  created_at: string;
  revoked_at: string | null;
  view_count: number;
}

async function loadSheet(id: string): Promise<SheetRow | null> {
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(id)) return null;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const { data } = await createServiceClient()
      .from('shared_cheat_sheets')
      .select('id, point_count, created_at, revoked_at, view_count')
      .eq('id', id)
      .maybeSingle();
    const row = data as SheetRow | null;
    return row && !row.revoked_at ? row : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sheet = await loadSheet(params.id);
  if (!sheet) return { title: 'Cheat sheet not found · MECE', robots: { index: false } };

  const title = `GD Cheat Sheet · ${sheet.point_count} data points · MECE`;
  const description =
    'A group-discussion cheat sheet built on MECE — real data points, organised by domain, ready to use in your next GD.';
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/s/${sheet.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/s/${sheet.id}`,
      siteName: 'MECE',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharedCheatSheetPage({ params }: { params: { id: string } }) {
  const sheet = await loadSheet(params.id);
  if (!sheet) notFound();

  // Fire-and-forget view counter — never blocks the render.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await createServiceClient()
        .from('shared_cheat_sheets')
        .update({ view_count: (sheet.view_count ?? 0) + 1 })
        .eq('id', sheet.id);
    } catch { /* a counter is not worth a 500 */ }
  }

  const fileUrl = `/s/${sheet.id}/file`;
  const made = new Date(sheet.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-wide text-navy" aria-label="MECE home">
            MECE<span className="text-primary">.</span>
          </Link>
          <Link href="/signup" className="btn-primary px-5 py-2 text-sm">
            Build your own
          </Link>
        </div>
      </header>

      <main className="container max-w-5xl py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">GD Cheat Sheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sheet.point_count} data point{sheet.point_count === 1 ? '' : 's'} · shared {made} · built on mece.in
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={fileUrl} target="_blank" rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <ExternalLink className="h-4 w-4" /> Open PDF
          </a>
          <a href={fileUrl} download
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="h-4 w-4" /> Download
          </a>
        </div>

        {/* Inline viewer. Mobile browsers often refuse to render PDFs in an
            embed, so the buttons above are the reliable path and this is the
            enhancement, not the only way in. */}
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-background">
          <object data={fileUrl} type="application/pdf" className="h-[75vh] w-full">
            <div className="p-10 text-center text-sm text-muted-foreground">
              Your browser can&apos;t display PDFs inline.{' '}
              <a href={fileUrl} target="_blank" rel="noreferrer noopener" className="font-medium text-primary hover:underline">
                Open it in a new tab
              </a>
              .
            </div>
          </object>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">Make your own in a few minutes</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            MECE turns the day&apos;s business news into GD briefs. Star the data points that matter,
            and your cheat sheet builds itself — then export it exactly like this one.
          </p>
          <Link href="/signup" className="btn-primary mt-5 inline-block px-6 py-2.5 text-sm">
            Start free
          </Link>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { searchAll } from '@/lib/crm/server/data';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const q = String(searchParams.q ?? '').slice(0, 100);
  const groups = q.length >= 2 ? await searchAll(ctx, await loadMeta(), q) : [];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Search: “{q}”</h1>
      {!groups.length && <p className="text-sm text-muted-foreground">{q.length < 2 ? 'Type at least two characters.' : 'Nothing you can see matches.'}</p>}
      {groups.map((g) => (
        <section key={g.module} className="rounded-lg border border-border bg-card">
          <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">{g.label}</h2>
          <ul className="divide-y divide-border text-sm">
            {g.rows.map((r) => (
              <li key={r.id} className="px-4 py-2">
                <Link href={`/crm/m/${g.module}/${r.id}`} className="text-navy hover:underline">{r.name || '(no name)'}</Link>
                {typeof r.data.email === 'string' && <span className="ml-2 text-xs text-muted-foreground">{r.data.email}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

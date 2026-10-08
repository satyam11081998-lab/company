import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { createServiceClient } from '@/lib/crm/server/svc';
import MarkReadButton from '@/components/crm/mark-read-button';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const { data } = await createServiceClient().from('crm_notifications').select('id, kind, title, body, link, read_at, created_at')
    .eq('user_id', ctx.userId).order('created_at', { ascending: false }).limit(100);
  const rows = (data ?? []) as Array<{ id: string; kind: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string }>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        {rows.some((r) => !r.read_at) && <MarkReadButton />}
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
        {rows.map((n) => (
          <li key={n.id} className={`px-4 py-3 ${n.read_at ? '' : 'bg-navy/5'}`}>
            {n.link ? <Link href={n.link} className="font-medium text-navy hover:underline">{n.title}</Link> : <p className="font-medium">{n.title}</p>}
            {n.body && <p className="text-muted-foreground">{n.body}</p>}
            <p className="text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString('en-IN')}</p>
          </li>
        ))}
        {!rows.length && <li className="px-4 py-8 text-center text-muted-foreground">No notifications.</li>}
      </ul>
    </div>
  );
}

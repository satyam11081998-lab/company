'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { FeedbackReportRow, FeedbackStatus } from '@/lib/types';
import { FEEDBACK_STATUSES, categoryLabel } from '@/lib/feedback';
import { updateFeedbackStatus } from './actions';

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  triaged: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  dismissed: 'bg-muted text-muted-foreground',
};

export function FeedbackAdminClient({ initialReports }: { initialReports: FeedbackReportRow[] }) {
  const [reports, setReports] = useState<FeedbackReportRow[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter)),
    [reports, statusFilter],
  );

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of reports) m.set(r.status, (m.get(r.status) ?? 0) + 1);
    return m;
  }, [reports]);

  async function setStatus(r: FeedbackReportRow, status: FeedbackStatus) {
    setSavingId(r.id);
    const prev = reports;
    setReports((cur) => cur.map((x) => (x.id === r.id ? { ...x, status } : x)));
    const res = await updateFeedbackStatus(r.id, status, r.admin_note ?? undefined);
    setSavingId(null);
    if (!res.success) {
      setReports(prev);
      toast.error(res.error ?? 'Update failed');
    } else {
      toast.success('Updated');
    }
  }

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', ...FEEDBACK_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'all' ? `All (${reports.length})` : `${s.replace(/_/g, ' ')} (${counts.get(s) ?? 0})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No reports{statusFilter !== 'all' ? ` with status “${statusFilter}”` : ''}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {categoryLabel(r.category)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                  {r.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                {r.user_id ? null : (
                  <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">
                    anonymous
                  </span>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm text-foreground">{r.message}</p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {r.path ? <span>path: <code className="text-foreground">{r.path}</code></span> : null}
                {typeof r.context?.entity_type === 'string' ? (
                  <span>
                    entity: <code className="text-foreground">{String(r.context.entity_type)}</code>
                    {typeof r.context?.entity_id === 'string' ? <> · <code className="text-foreground">{String(r.context.entity_id)}</code></> : null}
                  </span>
                ) : null}
                {r.contact_email ? <span>email: <a className="text-primary underline" href={`mailto:${r.contact_email}`}>{r.contact_email}</a></span> : null}
              </div>

              {/* Status actions */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {FEEDBACK_STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={savingId === r.id || s === r.status}
                    onClick={() => setStatus(r, s)}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
                      s === r.status ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

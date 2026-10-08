'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { repExport } from '@/app/(app)/crm/insight-actions';
import type { ReportConfig } from '@/lib/crm/reports';
import type { ReportResult } from '@/lib/crm/server/reports';
import { Button, Card } from '../ui';
import ReportBuilder, { download, type BuilderModule } from './report-builder';
import ReportView from './report-view';

export default function SavedReport({ id, name, shared, config, result, error, canEdit, canShare, modules }: {
  id: string; name: string; shared: boolean; config: Partial<ReportConfig>; result: ReportResult | null; error: string | null;
  canEdit: boolean; canShare: boolean; modules: BuilderModule[];
}) {
  const [editing, setEditing] = useState(false);
  const exportCsv = async () => {
    const r = await repExport(config);
    if (!r.ok) return toast.error(r.error);
    download(`${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`, r.data);
  };
  if (editing) return <ReportBuilder modules={modules} canShare={canShare} initial={{ id, name, shared, config }} onCancel={() => setEditing(false)} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/crm/reports" className="text-xs text-muted-foreground hover:underline">← Reports</Link>
          <h1 className="text-xl font-semibold">{name}</h1>
          {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCsv}>Export CSV</Button>
          {canEdit && <Button primary onClick={() => setEditing(true)}>Edit</Button>}
        </div>
      </div>
      <Card>{error ? <p className="text-sm text-destructive">{error}</p> : result ? <ReportView result={result} /> : null}</Card>
    </div>
  );
}

'use client';

import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Upload, Link2, CheckCircle2, XCircle, Plus, Loader2 } from 'lucide-react';
import type { TestimonialRow, TestimonialStatus } from '@/lib/types';
import {
  createTestimonial, setTestimonialStatus, deleteTestimonial, fetchOgPreview,
} from './actions';

type Tab = 'all' | 'pending' | 'published' | 'rejected';
const field = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function TestimonialsAdminClient({ initialRows }: { initialRows: TestimonialRow[] }) {
  const [rows, setRows] = useState<TestimonialRow[]>(initialRows);
  const [tab, setTab] = useState<Tab>('all');
  const [showForm, setShowForm] = useState(false);

  const counts = useMemo(() => {
    const m = { all: rows.length, pending: 0, published: 0, rejected: 0 } as Record<Tab, number>;
    for (const r of rows) m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, [rows]);

  const filtered = tab === 'all' ? rows : rows.filter((r) => r.status === tab);

  async function changeStatus(id: string, status: TestimonialStatus) {
    const prev = rows;
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await setTestimonialStatus(id, status);
    if (!res.success) { setRows(prev); toast.error(res.error ?? 'Failed'); }
    else toast.success('Updated');
  }

  async function remove(id: string) {
    const prev = rows;
    setRows((cur) => cur.filter((r) => r.id !== id));
    const res = await deleteTestimonial(id);
    if (!res.success) { setRows(prev); toast.error(res.error ?? 'Failed'); }
    else toast.success('Deleted');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'published', 'rejected'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t} ({counts[t] ?? 0})
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add testimonial
        </button>
      </div>

      {showForm && <AddForm onAdded={(row) => { setRows((c) => [row, ...c]); setShowForm(false); }} />}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Nothing here yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-border">
                  {r.avatar_url && <AvatarImage src={r.avatar_url} alt={r.name} className="object-cover" />}
                  <AvatarFallback className="bg-navy text-navy-foreground">{r.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{r.name}</span>
                    <StatusPill status={r.status} />
                    {r.source === 'user' && <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">user-submitted</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.school}{r.school && r.placement ? ' · ' : ''}{r.placement}</p>
                  <p className="mt-1.5 text-sm italic text-foreground">&ldquo;{r.quote}&rdquo;</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    {r.linkedin_url && <a href={r.linkedin_url} target="_blank" rel="noreferrer" className="text-primary underline">LinkedIn</a>}
                    {r.submitted_email && <a href={`mailto:${r.submitted_email}`} className="text-primary underline">{r.submitted_email}</a>}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.status !== 'published' && (
                  <button onClick={() => changeStatus(r.id, 'published')} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Publish
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => changeStatus(r.id, 'rejected')} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
                <button onClick={() => remove(r.id)} className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: TestimonialStatus }) {
  const map: Record<TestimonialStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    rejected: 'bg-muted text-muted-foreground',
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}

function AddForm({ onAdded }: { onAdded: (row: TestimonialRow) => void }) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [placement, setPlacement] = useState('');
  const [quote, setQuote] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/testimonials/upload', { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Upload failed');
      setAvatar(d.url);
      toast.success('Photo uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function tryFetch() {
    if (!linkedin) { toast.error('Paste a profile URL first.'); return; }
    setFetching(true);
    const r = await fetchOgPreview(linkedin);
    setFetching(false);
    if (r.image) { setAvatar(r.image); toast.success('Found a photo.'); }
    else toast.message(r.error || 'No photo found — upload one instead.');
  }

  async function save() {
    if (!name.trim() || !quote.trim()) { toast.error('Name and quote are required.'); return; }
    setBusy(true);
    const res = await createTestimonial({
      name, school, placement, quote,
      avatar_url: avatar || null,
      linkedin_url: linkedin || null,
    });
    setBusy(false);
    if (!res.success || !res.id) { toast.error(res.error ?? 'Failed'); return; }
    onAdded({
      id: res.id, name, school, placement, quote,
      avatar_url: avatar || null, linkedin_url: linkedin || null,
      status: 'published', source: 'admin', submitted_email: null,
      position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    toast.success('Added & published');
  }

  return (
    <Card className="p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" />
        <input className={field} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="College / programme" />
        <input className={field} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="Role / internship (e.g. Summer Intern @ Bain)" />
        <div className="flex gap-2">
          <input className={field} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
          <button onClick={tryFetch} disabled={fetching} title="Best-effort — usually blocked for LinkedIn" className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground">
            {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} Try fetch
          </button>
        </div>
      </div>

      <textarea
        className="mt-3 w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Quote *" maxLength={600}
      />

      <div className="mt-3 flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-border">
          {avatar && <AvatarImage src={avatar} className="object-cover" />}
          <AvatarFallback className="bg-muted text-xs">IMG</AvatarFallback>
        </Avatar>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload photo
        </button>
        <input className={`${field} flex-1`} value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="…or paste an image URL" />
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={busy} className="btn-primary rounded-lg px-4 py-2 text-sm disabled:opacity-60">
          {busy ? 'Saving…' : 'Add & publish'}
        </button>
      </div>
    </Card>
  );
}

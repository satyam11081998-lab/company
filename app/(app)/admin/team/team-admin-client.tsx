'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Upload, Link2, Plus, Loader2 } from 'lucide-react';
import type { TeamMemberRow } from '@/lib/types';
import { createTeamMember, deleteTeamMember } from './actions';
import { fetchOgPreview } from '../testimonials/actions';

const field = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function TeamAdminClient({ initialRows }: { initialRows: TeamMemberRow[] }) {
  const [rows, setRows] = useState<TeamMemberRow[]>(initialRows);
  const [showForm, setShowForm] = useState(false);

  async function remove(id: string) {
    const prev = rows;
    setRows((c) => c.filter((r) => r.id !== id));
    const res = await deleteTeamMember(id);
    if (!res.success) { setRows(prev); toast.error(res.error ?? 'Failed'); }
    else toast.success('Removed');
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add person
        </button>
      </div>

      {showForm && <AddForm onAdded={(row) => { setRows((c) => [...c, row]); setShowForm(false); }} />}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No team members yet.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <Card key={r.id} className="flex items-start gap-4 p-4">
              <Avatar className="h-14 w-14 border-2 border-border">
                {r.avatar_url && <AvatarImage src={r.avatar_url} alt={r.name} className="object-cover" />}
                <AvatarFallback className="bg-navy text-navy-foreground">{r.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  {r.linkedin_url && <a href={r.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">LinkedIn</a>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.school}</p>
                <p className="mt-0.5 text-xs text-primary">{r.placement}</p>
              </div>
              <button onClick={() => remove(r.id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddForm({ onAdded }: { onAdded: (row: TeamMemberRow) => void }) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [placement, setPlacement] = useState('');
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
    if (!name.trim()) { toast.error('Name is required.'); return; }
    setBusy(true);
    const res = await createTeamMember({ name, school, placement, linkedin_url: linkedin || null, avatar_url: avatar || null });
    setBusy(false);
    if (!res.success || !res.id) { toast.error(res.error ?? 'Failed'); return; }
    onAdded({
      id: res.id, name, school, placement, quote: '',
      avatar_url: avatar || null, linkedin_url: linkedin || null,
      position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    toast.success('Added');
  }

  return (
    <Card className="p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" />
        <input className={field} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="College / programme" />
        <input className={field} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="Role / where doing internship" />
        <div className="flex gap-2">
          <input className={field} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
          <button onClick={tryFetch} disabled={fetching} title="Best-effort — usually blocked for LinkedIn" className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground">
            {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} Try fetch
          </button>
        </div>
      </div>

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
          {busy ? 'Saving…' : 'Add person'}
        </button>
      </div>
    </Card>
  );
}

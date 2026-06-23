'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Eye, EyeOff, Trash2, Plus, Loader2, Upload } from 'lucide-react';
import type { EndorsementRow } from '@/lib/types';
import {
  createEndorsement,
  deleteEndorsement,
  setEndorsementStatus,
  setEndorsementVerified,
} from './actions';

const field =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function EndorsementsAdminClient({ initialRows }: { initialRows: EndorsementRow[] }) {
  const [rows, setRows] = useState<EndorsementRow[]>(initialRows);
  const [busy, setBusy] = useState(false);

  // add form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [org, setOrg] = useState('');
  const [credential, setCredential] = useState('');
  const [quote, setQuote] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState('');
  const [verified, setVerified] = useState(true);
  const [position, setPosition] = useState('0');
  const [uploading, setUploading] = useState(false);

  function resetForm() {
    setName(''); setRole(''); setOrg(''); setCredential(''); setQuote('');
    setLinkedin(''); setAvatar(''); setVerified(true); setPosition('0');
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/testimonials/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setAvatar(data.url);
      toast.success('Photo uploaded.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function add() {
    if (!name.trim() || !quote.trim()) { toast.error('Name and quote are required.'); return; }
    setBusy(true);
    const res = await createEndorsement({
      name, role, organization: org, credential, quote,
      avatar_url: avatar || null, linkedin_url: linkedin || null,
      verified, position: parseInt(position, 10) || 0,
    });
    setBusy(false);
    if (!res.success) { toast.error(res.error || 'Failed to add.'); return; }
    setRows((r) => [
      {
        id: res.id as string, name, role, organization: org, credential, quote,
        avatar_url: avatar || null, linkedin_url: linkedin || null, verified,
        status: 'published', position: parseInt(position, 10) || 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      ...r,
    ]);
    resetForm();
    toast.success('Endorsement added.');
  }

  async function toggleStatus(row: EndorsementRow) {
    const next = row.status === 'published' ? 'hidden' : 'published';
    const res = await setEndorsementStatus(row.id, next);
    if (!res.success) { toast.error(res.error || 'Failed.'); return; }
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, status: next } : x)));
  }

  async function toggleVerified(row: EndorsementRow) {
    const res = await setEndorsementVerified(row.id, !row.verified);
    if (!res.success) { toast.error(res.error || 'Failed.'); return; }
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, verified: !row.verified } : x)));
  }

  async function remove(row: EndorsementRow) {
    if (!confirm(`Delete endorsement from ${row.name}?`)) return;
    const res = await deleteEndorsement(row.id);
    if (!res.success) { toast.error(res.error || 'Failed.'); return; }
    setRows((r) => r.filter((x) => x.id !== row.id));
  }

  return (
    <div className="space-y-8">
      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" /> Add an endorsement
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" />
          <input className={field} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. Engagement Manager)" />
          <input className={field} value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Organization (e.g. Bain & Company)" />
          <input className={field} value={credential} onChange={(e) => setCredential(e.target.value)} placeholder="Credential (e.g. IIM-A '21 | CAT 99.8)" />
          <input className={field} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
          <input className={field} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position (0 = first)" />
        </div>
        <textarea
          className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Quote * — keep it specific (what changed, a number, a moment)."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 h-10 text-sm cursor-pointer hover:bg-muted">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>Upload photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </label>
          <input className={`${field} flex-1 min-w-[12rem]`} value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="…or paste an image URL" />
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 accent-primary" />
            Verified badge
          </label>
          <button onClick={add} disabled={busy} className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-4 h-10 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {busy ? 'Adding…' : 'Add endorsement'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No endorsements yet. Add real, verifiable ones above.</p>
        )}
        {rows.map((row) => (
          <div key={row.id} className={`flex items-start gap-4 rounded-xl border p-4 ${row.status === 'hidden' ? 'border-border bg-muted/40 opacity-70' : 'border-border bg-card'}`}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">{row.name}</span>
                {row.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                {row.status === 'hidden' && <span className="text-xs text-muted-foreground">(hidden)</span>}
              </div>
              <p className="text-xs text-primary">{[row.role, row.organization].filter(Boolean).join(' · ')}</p>
              {row.credential && <p className="text-xs text-muted-foreground">{row.credential}</p>}
              <p className="mt-1 text-sm text-foreground italic line-clamp-2">&ldquo;{row.quote}&rdquo;</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button onClick={() => toggleVerified(row)} title={row.verified ? 'Unverify' : 'Mark verified'} className={`rounded-md p-2 hover:bg-muted ${row.verified ? 'text-primary' : 'text-muted-foreground'}`}>
                <BadgeCheck className="h-4 w-4" />
              </button>
              <button onClick={() => toggleStatus(row)} title={row.status === 'published' ? 'Hide' : 'Publish'} className="rounded-md p-2 text-muted-foreground hover:bg-muted">
                {row.status === 'published' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => remove(row)} title="Delete" className="rounded-md p-2 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

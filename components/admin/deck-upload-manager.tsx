'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UploadCloud,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  ExternalLink,
  Globe,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';
import type { VaultDeckRow } from '@/app/(app)/admin/decks/page';

const CASE_TYPES = [
  'marketing', 'strategy', 'finance', 'operations', 'product',
  'sustainability', 'hr', 'general management', 'guesstimate', 'other',
];
const RESULTS = [
  'National Winner', 'National Runner Up', 'National Finalist',
  'National Semi Finalist', 'Campus Winner', 'Problem Statement', 'Template', 'Other',
];

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export default function DeckUploadManager({ initialDecks }: { initialDecks: VaultDeckRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [sourceKind, setSourceKind] = useState('corporate');
  const [competition, setCompetition] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState('National Finalist');
  const [caseType, setCaseType] = useState('strategy');
  const [roundType, setRoundType] = useState('finale');
  const [freePages, setFreePages] = useState('');
  const [description, setDescription] = useState('');

  // Expandable summary state
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setFreePages('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Choose a file first.'); return; }
    if (!title.trim() || !competition.trim()) { toast.error('Title and competition are required.'); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error('File too large (max 100MB).'); return; }

    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
    const mimeType = file.type || MIME_BY_EXT[ext] || 'application/pdf';
    const safeBase = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
    const storedName = `${sourceKind}--${Date.now()}-${safeBase}.${ext}`;

    try {
      setBusy(true);

      // 1. Mint an upload session on the server (admin-gated).
      setProgress('Starting upload…');
      const sessionRes = await fetch('/api/skeletons/upload-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: storedName, mimeType }),
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(sessionData.error || 'Could not start upload');

      // 2. PUT the bytes directly to the storage session — bypasses
      //    serverless request-body limits, works up to 100MB+.
      setProgress('Uploading file…');
      const putRes = await fetch(sessionData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        credentials: 'omit',
        body: file,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => '');
        throw new Error(`File upload failed (${putRes.status}): ${errText}`);
      }
      const uploaded = await putRes.json();
      if (!uploaded?.id) throw new Error('Storage did not return a file id');

      // 3. Insert the catalogue row (admin table policy).
      setProgress('Saving to catalogue…');
      const freePagesNum = freePages.trim() ? parseInt(freePages.trim(), 10) : null;
      const { error: insertError } = await supabase.from('deck_skeletons').insert({
        title: title.trim(),
        source_kind: sourceKind,
        competition: competition.trim(),
        result,
        case_type: caseType,
        round_type: roundType,
        file_type: ext,
        description: description.trim(),
        storage_path: `gdrive:${uploaded.id}`,
        is_active: true,
        is_indexable: true,
        free_pages: freePagesNum,
        year: /^\d{4}$/.test(year.trim()) ? Number(year.trim()) : null,
        organizer: organizer.trim(),
      });
      if (insertError) {
        throw new Error(`Catalogue insert failed: ${insertError.message} — the uploaded file is orphaned; re-upload after fixing.`);
      }

      toast.success(`"${title.trim()}" is live in the Vault.`);
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const toggleActive = async (deck: VaultDeckRow) => {
    const { error } = await supabase
      .from('deck_skeletons')
      .update({ is_active: !deck.is_active })
      .eq('id', deck.id);
    if (error) toast.error(error.message);
    else { toast.success(deck.is_active ? 'Hidden from the Vault.' : 'Visible in the Vault.'); router.refresh(); }
  };

  const toggleIndexable = async (deck: VaultDeckRow) => {
    const nextVal = !deck.is_indexable;
    const { error } = await supabase
      .from('deck_skeletons')
      .update({ is_indexable: nextVal })
      .eq('id', deck.id);
    if (error) toast.error(error.message);
    else {
      toast.success(nextVal ? 'Deck is now indexable (in sitemap).' : 'Deck pulled from search (noindex).');
      router.refresh();
    }
  };

  const handleUpdateFreePages = async (deck: VaultDeckRow) => {
    const input = window.prompt(
      `Set free preview pages for "${deck.title}" (Enter a number, or leave empty for computed 25% default):`,
      deck.free_pages !== null ? String(deck.free_pages) : ''
    );
    if (input === null) return;
    const trimmed = input.trim();
    const val = trimmed ? parseInt(trimmed, 10) : null;
    if (val !== null && (!Number.isFinite(val) || val < 0)) {
      toast.error('Free pages must be a non-negative number.');
      return;
    }
    const { error } = await supabase
      .from('deck_skeletons')
      .update({ free_pages: val })
      .eq('id', deck.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Free pages set to ${val === null ? 'computed default (25%)' : val}.`);
      router.refresh();
    }
  };

  /**
   * Rasterise the deck's pages and generate its verified summary.
   *
   * This is the step that was missing entirely: the backend endpoints existed
   * and nothing ever called them, so every deck sat at "Not rendered / No
   * summary" forever and no public page could work.
   *
   * Goes straight to the FastAPI backend (not a Next route) because the work is
   * there — pypdfium2 rasterisation and the number-verified summary. Needs the
   * caller's Supabase JWT; the backend re-checks is_admin and fails closed.
   */
  const handleProcess = async (deck: VaultDeckRow, mode: 'process' | 'render' | 'summarize' = 'process') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      toast.error('NEXT_PUBLIC_API_URL is not set — cannot reach the backend.');
      return;
    }
    setProcessingId(deck.id);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Not signed in.');

      const res = await fetch(`${apiUrl}/decks/${deck.id}/${mode}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.detail || `Failed (${res.status})`);

      toast.success(
        mode === 'render' ? `Rendered ${body?.page_count ?? '?'} pages.`
          : mode === 'summarize' ? 'Summary generated.'
          : `Processed — ${body?.page_count ?? '?'} pages rendered, summary ready.`,
      );
      router.refresh();
    } catch (e) {
      // Rendering a large deck is slow and the summary can be rejected by the
      // number guard, so surface the real reason rather than a generic failure.
      toast.error(e instanceof Error ? e.message : 'Processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (deck: VaultDeckRow) => {
    if (!window.confirm(`Delete "${deck.title}" and its file permanently?`)) return;
    try {
      const res = await fetch('/api/skeletons/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', deckId: deck.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast.success('Deleted.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload form */}
      <Card className="ui-card p-6">
        <h2 className="text-h3 text-foreground mb-4 flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-primary" /> Upload a deck
        </h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="deck-file">File (PDF / PPTX / XLSX, max 100MB)</Label>
            <Input
              id="deck-file"
              type="file"
              accept=".pdf,.pptx,.ppt,.xlsx"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f && !title.trim()) {
                  setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim());
                }
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="deck-title">Title (what buyers see)</Label>
            <Input id="deck-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="HUL L.I.M.E. — National Winner deck" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="deck-competition">Competition</Label>
            <Input id="deck-competition" value={competition} onChange={(e) => setCompetition(e.target.value)}
              placeholder="HUL L.I.M.E. / Kritva 25 · Arthneeti" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="deck-organizer">Organizer (company / college)</Label>
            <Input id="deck-organizer" value={organizer} onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Hindustan Unilever / IIM Lucknow" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="deck-year">Year</Label>
            <Input id="deck-year" value={year} onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="2026" inputMode="numeric" className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={sourceKind} onValueChange={setSourceKind}>
              {/* @ts-ignore */}
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              {/* @ts-ignore */}
              <SelectContent>
                {/* @ts-ignore */}
                <SelectItem value="corporate">Corporate competition</SelectItem>
                {/* @ts-ignore */}
                <SelectItem value="bschool">B-school competition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Result / type</Label>
            <Select value={result} onValueChange={setResult}>
              {/* @ts-ignore */}
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              {/* @ts-ignore */}
              <SelectContent>
                {RESULTS.map((r) => (
                  // @ts-ignore
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Domain</Label>
            <Select value={caseType} onValueChange={setCaseType}>
              {/* @ts-ignore */}
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              {/* @ts-ignore */}
              <SelectContent>
                {CASE_TYPES.map((t) => (
                  // @ts-ignore
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Round</Label>
            <Select value={roundType} onValueChange={setRoundType}>
              {/* @ts-ignore */}
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              {/* @ts-ignore */}
              <SelectContent>
                {/* @ts-ignore */}
                <SelectItem value="screening">Screening / submission</SelectItem>
                {/* @ts-ignore */}
                <SelectItem value="finale">Finale</SelectItem>
                {/* @ts-ignore */}
                <SelectItem value="problem-statement">Problem statement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="deck-freepages">Free Preview Pages (Optional)</Label>
            <Input id="deck-freepages" value={freePages} onChange={(e) => setFreePages(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              placeholder="Default: auto 25% (1 to 4 pages)" inputMode="numeric" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="deck-desc">Description (one line, optional)</Label>
            <Input id="deck-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="GTM for self-repairing tyres — won against 2,400 teams" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy} className="gap-2">
              <UploadCloud className="h-4 w-4" />
              {busy ? (progress || 'Uploading…') : 'Upload to Vault'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing decks */}
      <div>
        <h2 className="text-h3 text-foreground mb-4">In the Vault ({initialDecks.length})</h2>
        <div className="space-y-3">
          {initialDecks.map((deck) => (
            <Card key={deck.id} className={`ui-card p-4 space-y-3 ${deck.is_active ? '' : 'opacity-60'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-strong font-semibold text-foreground truncate">{deck.title}</p>
                      {deck.slug && (
                        <Link
                          href={`/decks/${deck.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                        >
                          /decks/{deck.slug}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <p className="text-small text-muted-foreground truncate">
                      {deck.source_kind === 'corporate' ? 'Corporate' : 'B-school'} · {deck.competition} · {deck.result} · {deck.case_type} · {deck.file_type.toUpperCase()}
                    </p>
                    {/* Paywall & SEO tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        {deck.free_pages !== null ? `${deck.free_pages} free pages (override)` : 'Auto 25% free'}
                      </Badge>
                      <Badge variant="outline" className={deck.is_indexable ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}>
                        <Globe className="w-3 h-3 mr-1" />
                        {deck.is_indexable ? 'Indexed' : 'Noindex'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Layers className="w-3 h-3 mr-1" />
                        {deck.pages_rendered_at ? `${deck.page_count || '?'}p rendered` : 'Not rendered'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {deck.summary ? 'Summary ready' : 'No summary'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={processingId === deck.id}
                    onClick={() => handleProcess(deck, 'process')}
                    title="Rasterise every page and generate the number-verified summary"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {processingId === deck.id
                      ? 'Processing…'
                      : deck.pages_rendered_at || deck.summary
                        ? 'Re-process'
                        : 'Process'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateFreePages(deck)}>
                    Edit Free Pages
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleIndexable(deck)}>
                    {deck.is_indexable ? 'Hide from SEO' : 'Show in SEO'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toggleActive(deck)}>
                    {deck.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                  </Button>
                  {deck.summary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSummaryId(expandedSummaryId === deck.id ? null : deck.id)}
                    >
                      {expandedSummaryId === deck.id ? 'Close Summary' : 'View Summary'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleDelete(deck)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>

              {/* Summary accordion */}
              {expandedSummaryId === deck.id && deck.summary && (
                <div className="p-3 bg-muted/40 rounded-lg text-xs text-foreground/90 whitespace-pre-line border border-border/60">
                  <p className="font-semibold mb-1 text-primary">AI Executive Summary:</p>
                  {deck.summary}
                </div>
              )}
            </Card>
          ))}
          {initialDecks.length === 0 && (
            <Card className="ui-card p-8 text-center">
              <p className="text-body text-muted-foreground">Nothing uploaded yet — the form above is your starting line.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
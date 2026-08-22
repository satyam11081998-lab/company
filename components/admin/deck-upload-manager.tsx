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
  Play,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { VaultDeckRow } from '@/app/(app)/admin/decks/page';

// EXHAUSTIVE on purpose. These strings end up on a public, indexed page and
// they are exactly what a searcher types ("national 1st runner up deck",
// "zonal finalist", "semi final"). A short list forces the admin into "Other",
// which erases the precise term the page could have ranked for.
const CASE_TYPES = [
  'strategy', 'marketing', 'finance', 'operations', 'supply chain',
  'product', 'technology', 'digital transformation', 'analytics',
  'consulting', 'market entry', 'growth', 'pricing', 'M&A',
  'sustainability', 'ESG', 'hr', 'general management',
  'social impact', 'healthcare', 'retail', 'BFSI', 'guesstimate', 'other',
];

const RESULTS = [
  'National Winner', 'National 1st Runner Up', 'National 2nd Runner Up',
  'National Finalist', 'National Semi Finalist',
  'Zonal Winner', 'Zonal Runner Up', 'Zonal Finalist',
  'Regional Winner', 'Regional Finalist',
  'Campus Winner', 'Campus Runner Up', 'Campus Finalist',
  'Top 5', 'Top 10', 'Top 25', 'Shortlisted', 'Participant',
  'Problem Statement', 'Template', 'Other',
];

// Ordered the way a competition actually progresses.
const ROUND_TYPES: Array<{ value: string; label: string }> = [
  { value: 'screening', label: 'Screening / submission' },
  { value: 'campus', label: 'Campus round' },
  { value: 'zonal', label: 'Zonal round' },
  { value: 'regional', label: 'Regional round' },
  { value: 'quarter-final', label: 'Quarter final' },
  { value: 'semi-final', label: 'Semi final' },
  { value: 'final', label: 'Final' },
  { value: 'finale', label: 'Grand finale' },
  { value: 'live-round', label: 'Live / on-stage round' },
  { value: 'case-submission', label: 'Case submission' },
  { value: 'problem-statement', label: 'Problem statement' },
  { value: 'other', label: 'Other' },
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
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [processingDeckId, setProcessingDeckId] = useState<string | null>(null);

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
      const { data: insertedDeck, error: insertError } = await supabase
        .from('deck_skeletons')
        .insert({
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
        })
        .select('id')
        .single();

      if (insertError || !insertedDeck) {
        throw new Error(`Catalogue insert failed: ${insertError?.message || 'Unknown error'} — re-upload after fixing.`);
      }

      toast.success(`"${title.trim()}" uploaded. Processing slides & AI summary…`);

      // 4. Trigger background processing (render + AI summary)
      try {
        setProgress('Rendering slides & generating summary…');
        await fetch('/api/admin/decks/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deckId: insertedDeck.id, action: 'process' }),
        });
      } catch {
        // Background processing can be retried manually if offline
      }

      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleProcessDeck = async (deckId: string, action: 'process' | 'render' | 'summarize' = 'process') => {
    try {
      setProcessingDeckId(deckId);
      toast.loading(action === 'render' ? 'Rendering slides…' : action === 'summarize' ? 'Generating AI summary…' : 'Rendering slides and generating AI summary…', { id: `proc-${deckId}` });

      const res = await fetch('/api/admin/decks/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Processing failed');

      toast.success(
        action === 'render'
          ? `Rendered ${data.page_count} pages.`
          : action === 'summarize'
          ? 'AI summary generated.'
          : `Rendered ${data.page_count} pages & generated summary!`,
        { id: `proc-${deckId}` }
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Processing failed.', { id: `proc-${deckId}` });
    } finally {
      setProcessingDeckId(null);
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
    // Route through the admin server endpoint so it can revalidate the public
    // /decks/[slug] ISR cache — a direct client update leaves the public page
    // stale for up to an hour, which is why a lowered limit "did not lock".
    const res = await fetch('/api/skeletons/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_free_pages', deckId: deck.id, freePages: val }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data?.error || 'Could not update free pages.');
    } else {
      toast.success(
        `Free pages set to ${val === null ? 'computed default (25%)' : val} — live now.`,
      );
      router.refresh();
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
                // Deliberately does NOT auto-fill the title from the filename.
                // That silently published names like "flipkart wired final v3
                // compressed" as the public <h1>, because a pre-filled field
                // looks answered and gets skipped. The heading is the single
                // most important string on an indexed page — type it on purpose.
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
                {ROUND_TYPES.map((r) => (
                  /* @ts-ignore */
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
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
          {initialDecks.map((deck) => {
            const isProcessing = processingDeckId === deck.id;
            const isRendered = Boolean(deck.pages_rendered_at);
            const hasSummary = Boolean(deck.summary);

            return (
              <Card key={deck.id} className={`ui-card p-4 space-y-3 ${deck.is_active ? '' : 'opacity-60 bg-muted/20'}`}>
                {/* 1-2 lines of clean details across full width */}
                <div className="space-y-1.5 min-w-0">
                  {/* Line 1: Title + Slug + Status Badges inline */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-base font-semibold text-foreground truncate">{deck.title}</p>
                      {deck.slug && (
                        <Link
                          href={`/decks/${deck.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono bg-primary/10 px-2 py-0.5 rounded shrink-0"
                        >
                          /decks/{deck.slug}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {/* Badges inline */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        {deck.free_pages !== null ? `${deck.free_pages} free` : 'Auto 25% free'}
                      </Badge>
                      <Badge variant="outline" className={deck.is_indexable ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}>
                        <Globe className="w-3 h-3 mr-1" />
                        {deck.is_indexable ? 'Indexed' : 'Noindex'}
                      </Badge>
                      <Badge variant="outline" className={isRendered ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'}>
                        <Layers className="w-3 h-3 mr-1" />
                        {isRendered ? `${deck.page_count || '?'}p rendered` : 'Unrendered'}
                      </Badge>
                      <Badge variant="outline" className={hasSummary ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        {hasSummary ? 'Summary' : 'No summary'}
                      </Badge>
                    </div>
                  </div>

                  {/* Line 2: Structured Metadata */}
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">{deck.source_kind === 'corporate' ? 'Corporate' : 'B-school'}</span>
                    {deck.competition && <> · <span className="text-foreground/90 font-medium">{deck.competition}</span></>}
                    {deck.organizer && <> ({deck.organizer})</>}
                    {deck.year && <> · <span>{deck.year}</span></>}
                    {deck.result && <> · <span className="font-medium text-primary">{deck.result}</span></>}
                    {deck.case_type && <> · <span>{deck.case_type}</span></>}
                    {deck.file_type && <> · <span className="uppercase text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{deck.file_type}</span></>}
                    {deck.description && <> · <span className="italic text-muted-foreground/80">{deck.description}</span></>}
                  </p>
                </div>

                {/* Horizontal Action Bar below details */}
                <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Render / Process Trigger */}
                    <Button
                      variant={isRendered && hasSummary ? 'outline' : 'default'}
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleProcessDeck(deck.id, 'process')}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {isProcessing ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
                      ) : isRendered ? (
                        <><RefreshCw className="h-3.5 w-3.5" /> Re-process</>
                      ) : (
                        <><Play className="h-3.5 w-3.5" /> Render Slides</>
                      )}
                    </Button>

                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleUpdateFreePages(deck)}>
                      Edit Free
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toggleIndexable(deck)}>
                      {deck.is_indexable ? 'Hide SEO' : 'Show SEO'}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => toggleActive(deck)}>
                      {deck.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                    </Button>
                    {deck.summary && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setExpandedSummaryId(expandedSummaryId === deck.id ? null : deck.id)}
                      >
                        {expandedSummaryId === deck.id ? 'Hide Summary' : 'View Summary'}
                      </Button>
                    )}
                  </div>

                  <div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(deck)}>
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
            );
          })}
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
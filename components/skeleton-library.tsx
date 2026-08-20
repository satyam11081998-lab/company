'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/user-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, ShieldCheck, Filter, Building2, GraduationCap, Layers, Eye, Rocket, Search, CalendarDays, Award } from 'lucide-react';

export interface VaultDeck {
  id: string;
  /** Public deck-page slug. Optional: rows created before 0047/0048 may lack one. */
  slug?: string | null;
  title: string;
  source_kind: string;   // 'corporate' | 'bschool'
  competition: string;
  result: string;
  case_type: string;
  round_type: string;
  file_type: string;
  description: string;
  tags: string[];
  year: number | null;    // 0042 — structured filters
  organizer: string;      // company (corporate) or college (bschool); '' = unknown
}

interface DeckVaultProps {
  decks: VaultDeck[];
  hasAccess: boolean;
}

type KindTab = 'all' | 'corporate' | 'bschool';
const ALL_TYPES = '__all__';
const PRICE_INR = 500;

export default function DeckVault({ decks, hasAccess }: DeckVaultProps) {
  const { user } = useUser();
  const router = useRouter();
  const [kindTab, setKindTab] = useState<KindTab>('all');
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [yearFilter, setYearFilter] = useState<string>(ALL_TYPES);
  const [orgFilter, setOrgFilter] = useState<string>(ALL_TYPES);
  const [resultFilter, setResultFilter] = useState<string>(ALL_TYPES);
  const [query, setQuery] = useState('');

  // Deck Vault is LIVE for all signed-in users. The catalogue is open to everyone;
  // free/lite users click through to the PUBLIC deck page (preview + paywall).
  // Pro users and admins get the full DRM reader. hasAccess controls DRM only.
  const isVaultUnlocked = true;

  const caseTypes = useMemo(
    () => Array.from(new Set(decks.map((d) => d.case_type))).sort((a, b) => a.localeCompare(b)),
    [decks]
  );
  const years = useMemo(
    () => Array.from(new Set(decks.map((d) => d.year).filter((y): y is number => !!y))).sort((a, b) => b - a),
    [decks]
  );
  const organizers = useMemo(
    () => Array.from(new Set(decks.map((d) => d.organizer).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [decks]
  );
  const results = useMemo(
    () => Array.from(new Set(decks.map((d) => d.result).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [decks]
  );

  const hasActiveFilters =
    kindTab !== 'all' || typeFilter !== ALL_TYPES || yearFilter !== ALL_TYPES ||
    orgFilter !== ALL_TYPES || resultFilter !== ALL_TYPES || query.trim() !== '';

  const clearFilters = () => {
    setKindTab('all');
    setTypeFilter(ALL_TYPES);
    setYearFilter(ALL_TYPES);
    setOrgFilter(ALL_TYPES);
    setResultFilter(ALL_TYPES);
    setQuery('');
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return decks.filter((d) =>
      (kindTab === 'all' || d.source_kind === kindTab) &&
      (typeFilter === ALL_TYPES || d.case_type === typeFilter) &&
      (yearFilter === ALL_TYPES || String(d.year ?? '') === yearFilter) &&
      (orgFilter === ALL_TYPES || d.organizer === orgFilter) &&
      (resultFilter === ALL_TYPES || d.result === resultFilter) &&
      (q === '' ||
        d.title.toLowerCase().includes(q) ||
        d.competition.toLowerCase().includes(q) ||
        d.organizer.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q))
    );
  }, [decks, kindTab, typeFilter, yearFilter, orgFilter, resultFilter, query]);

  const counts = useMemo(() => ({
    corporate: decks.filter((d) => d.source_kind === 'corporate').length,
    bschool: decks.filter((d) => d.source_kind === 'bschool').length,
  }), [decks]);


  // The "in the workshop" screen is retained but no longer reachable in normal
  // operation: the vault is live, and every signed-in user gets the catalogue.
  // Free and Lite click through to the PUBLIC deck page (preview + paywall);
  // Pro and admins get the full DRM reader. Rendering a coming-soon screen over
  // decks that exist, and whose public pages are already indexed by Google, was
  // Empty-state fallback: only shows when the database query returns zero decks.
  // Now that the vault is live, this is purely a safety net — not a dev gate.
  if (decks.length === 0) {
    return (
      <>
        <Card className="ui-card max-w-2xl mx-auto p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-h2 text-foreground">No decks available yet</h2>
          <p className="mt-3 text-body text-muted-foreground max-w-lg mx-auto">
            We&apos;re adding verified case-competition decks from national winners, finalists and
            semi-finalists. Check back soon.
          </p>
        </Card>
      </>
    );
  }

  /* ── Vault ────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <KindButton active={kindTab === 'all'} onClick={() => setKindTab('all')} icon={<Layers className="w-4 h-4" />}>
            All ({decks.length})
          </KindButton>
          <KindButton active={kindTab === 'corporate'} onClick={() => setKindTab('corporate')} icon={<Building2 className="w-4 h-4" />}>
            Corporate ({counts.corporate})
          </KindButton>
          <KindButton active={kindTab === 'bschool'} onClick={() => setKindTab('bschool')} icon={<GraduationCap className="w-4 h-4" />}>
            B-School ({counts.bschool})
          </KindButton>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search competition, company, college…"
            aria-label="Search decks"
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
        </div>
      </div>

      {/* Structured filters — Year / Organizer / Result / Domain (0042) */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          {/* @ts-ignore */}
          <SelectTrigger className="h-10 w-[130px]" aria-label="Filter by year">
            <div className="flex items-center gap-2 truncate">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All years" />
            </div>
          </SelectTrigger>
          {/* @ts-ignore */}
          <SelectContent>
            {/* @ts-ignore */}
            <SelectItem value={ALL_TYPES}>All years</SelectItem>
            {years.map((y) => (
              // @ts-ignore
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={orgFilter} onValueChange={setOrgFilter}>
          {/* @ts-ignore */}
          <SelectTrigger className="h-10 w-[210px]" aria-label="Filter by company or college">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All companies & colleges" />
            </div>
          </SelectTrigger>
          {/* @ts-ignore */}
          <SelectContent>
            {/* @ts-ignore */}
            <SelectItem value={ALL_TYPES}>All companies &amp; colleges</SelectItem>
            {organizers.map((o) => (
              // @ts-ignore
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resultFilter} onValueChange={setResultFilter}>
          {/* @ts-ignore */}
          <SelectTrigger className="h-10 w-[190px]" aria-label="Filter by result">
            <div className="flex items-center gap-2 truncate">
              <Award className="h-4 w-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All results" />
            </div>
          </SelectTrigger>
          {/* @ts-ignore */}
          <SelectContent>
            {/* @ts-ignore */}
            <SelectItem value={ALL_TYPES}>All results</SelectItem>
            {results.map((r) => (
              // @ts-ignore
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          {/* @ts-ignore */}
          <SelectTrigger className="h-10 w-[160px]" aria-label="Filter by domain">
            <div className="flex items-center gap-2 truncate">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All domains" />
            </div>
          </SelectTrigger>
          {/* @ts-ignore */}
          <SelectContent>
            {/* @ts-ignore */}
            <SelectItem value={ALL_TYPES}>All domains</SelectItem>
            {caseTypes.map((t) => (
              // @ts-ignore
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="link" onClick={clearFilters} className="h-10 px-2 text-primary">
            Clear all
          </Button>
        )}
      </div>

      {decks.length === 0 ? (
        <Card className="ui-card p-10 text-center">
          <p className="text-body text-muted-foreground">
            The first decks are being uploaded — you have lifetime access, so everything that lands here is yours.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((d) => {
            return (
              <Link
                key={d.id}
                // Everyone opens the public deck page (/decks/<slug>): free users
                  // get the preview + paywall, Pro/admin get every slide inline
                  // (unlocked client-side, enforced server-side in the image route).
                  // Only a legacy deck with no slug falls back to the admin reader.
                  href={d.slug ? `/decks/${d.slug}` : `/skeletons/view/${d.id}`}
                className="block outline-none"
              >
                <Card className="ui-card flex flex-col p-5 h-full transition-colors hover:border-primary/50 group">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="tag-navy px-2 py-1 rounded text-micro uppercase tracking-wide font-medium">
                      {d.source_kind === 'corporate' ? 'Corporate' : 'B-School'} · {d.case_type}
                    </span>
                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                  <h3 className="text-strong font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{d.title}</h3>
                  <p className="text-small text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                    {d.competition}{d.result ? ` · ${d.result}` : ''}{d.year ? ` · ${d.year}` : ''}
                  </p>
                  {d.description && (
                    <p className="text-body text-muted-foreground line-clamp-2">{d.description}</p>
                  )}
                  <div className="mt-auto pt-3 flex justify-between items-center">
                    <span className="text-micro font-medium text-muted-foreground bg-muted px-2 py-1 rounded uppercase">
                      {d.file_type}
                    </span>
                    <span className="text-micro font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Read online →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
          {visible.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-body text-muted-foreground">No decks match these filters.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KindButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 md:py-2 rounded-full text-small font-semibold transition-all ${
        active ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

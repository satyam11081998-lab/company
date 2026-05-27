'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CaseRow } from '@/lib/types';
import { CASE_TYPES, DIFFICULTIES, CASE_TYPE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';

/** Client-side filter UI + case grid for /cases. */
export default function CasesBrowser({ cases }: { cases: CaseRow[] }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (selectedType && c.type !== selectedType) return false;
      if (selectedDifficulty && c.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [cases, selectedType, selectedDifficulty]);

  return (
    <div>
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold uppercase text-muted-foreground">Type</span>
          <Chip label="All" active={selectedType === null} onClick={() => setSelectedType(null)} />
          {CASE_TYPES.map((type) => (
            <Chip key={type} label={CASE_TYPE_LABELS[type]} active={selectedType === type} onClick={() => setSelectedType(type)} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold uppercase text-muted-foreground">Difficulty</span>
          <Chip label="All" active={selectedDifficulty === null} onClick={() => setSelectedDifficulty(null)} />
          {DIFFICULTIES.map((d) => (
            <Chip key={d} label={DIFFICULTY_LABELS[d]} active={selectedDifficulty === d} onClick={() => setSelectedDifficulty(d)} />
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-base text-muted-foreground">No cases match these filters.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`} className="hover:-translate-y-0.5 transition-all duration-200">
              <div className="bg-card rounded-xl border border-border shadow-sm flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap gap-2">
                  <span className="tag tag-navy">{CASE_TYPE_LABELS[c.type] || c.type}</span>
                  <DifficultyTag difficulty={c.difficulty} label={DIFFICULTY_LABELS[c.difficulty] || c.difficulty} />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-base text-muted-foreground">{c.content}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Maps difficulty to appropriate tag class. */
function DifficultyTag({ difficulty, label }: { difficulty: string; label: string }) {
  const cls =
    difficulty === 'easy'
      ? 'tag tag-green'
      : difficulty === 'medium'
      ? 'tag tag-amber'
      : difficulty === 'hard'
      ? 'tag tag-red'
      : 'tag tag-navy';
  return <span className={cls}>{label}</span>;
}

/** Selectable filter chip. */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const base = 'rounded-full border px-4 md:px-3 py-2 md:py-1 text-base font-medium transition-colors touch-target';
  const cls = active
    ? 'border-primary bg-primary text-primary-foreground'
    : 'border-border bg-card text-foreground/80 hover:border-slate-300 hover:bg-muted';
  return (
    <button type="button" className={`${base} ${cls}`} onClick={onClick}>{label}</button>
  );
}

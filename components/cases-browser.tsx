'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CaseRow } from '@/lib/types';
import { CASE_TYPES, DIFFICULTIES, CASE_TYPE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import { Card } from '@/components/ui/card';

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
          <span className="text-xs font-semibold uppercase text-slate-500">Type</span>
          <Chip label="All" active={selectedType === null} onClick={() => setSelectedType(null)} />
          {CASE_TYPES.map((type) => (
            <Chip key={type} label={CASE_TYPE_LABELS[type]} active={selectedType === type} onClick={() => setSelectedType(type)} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Difficulty</span>
          <Chip label="All" active={selectedDifficulty === null} onClick={() => setSelectedDifficulty(null)} />
          {DIFFICULTIES.map((d) => (
            <Chip key={d} label={DIFFICULTY_LABELS[d]} active={selectedDifficulty === d} onClick={() => setSelectedDifficulty(d)} />
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-slate-500">No cases match these filters.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`}>
              <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">{CASE_TYPE_LABELS[c.type] || c.type}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[c.difficulty] || ''}`}>{DIFFICULTY_LABELS[c.difficulty] || c.difficulty}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{c.content}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Selectable filter chip. */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const base = 'rounded-full border px-3 py-1 text-sm font-medium transition-colors';
  const cls = active
    ? 'border-amber-500 bg-amber-500 text-white'
    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
  return (
    <button type="button" className={`${base} ${cls}`} onClick={onClick}>{label}</button>
  );
}

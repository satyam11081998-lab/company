'use client';

import { useState } from 'react';

export default function SurveyClient(p: { token: string; question: string; followUp: string; thankYou: string; min: number; max: number; low: string; high: string; preselect: number | null }) {
  const valid = (n: number | null) => n !== null && n >= p.min && n <= p.max;
  const [score, setScore] = useState<number | null>(valid(p.preselect) ? p.preselect : null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const scale = Array.from({ length: p.max - p.min + 1 }, (_, i) => p.min + i);

  const submit = async () => {
    if (score === null) return setMsg('Please pick a score.');
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/crm/survey/${encodeURIComponent(p.token)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ score, comment }) });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (j.ok) setDone(true); else setMsg(j.message ?? 'Please try again.');
    } catch {
      setMsg('Could not send. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) return <p className="text-sm" role="status">{p.thankYou}</p>;
  return (
    <div>
      <h1 className="text-lg font-semibold">{p.question}</h1>
      <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label={p.question}>
        {scale.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={score === n} onClick={() => setScore(n)}
            className={`h-10 min-w-[2.5rem] rounded-md border text-sm font-semibold ${score === n ? 'border-navy bg-navy text-navy-foreground' : 'border-border bg-background hover:bg-muted'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{p.low}</span><span>{p.high}</span></div>
      <label className="mt-5 block text-sm">
        <span className="font-medium">{p.followUp}</span> <span className="text-muted-foreground">(optional)</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={4} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </label>
      {msg && <p className="mt-2 text-sm text-destructive" role="alert">{msg}</p>}
      <button type="button" onClick={submit} disabled={busy} className="mt-4 h-10 w-full rounded-md bg-navy text-sm font-semibold text-navy-foreground disabled:opacity-60">{busy ? 'Sending…' : 'Submit'}</button>
    </div>
  );
}

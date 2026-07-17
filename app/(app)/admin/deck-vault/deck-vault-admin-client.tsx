'use client';

/**
 * Deck Vault Rewards — admin review UI.
 * Pending cards expose: open deck / open certificate (signed URLs), an editable
 * discount %, Approve (mints the coupon) and Reject (note required, shown to user).
 */

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  FileText, BadgeCheck, XCircle, ExternalLink, Clock3, Building2, GraduationCap, Ticket,
} from 'lucide-react';
import { approveDeckSubmission, rejectDeckSubmission } from './actions';

export interface AdminSubmission {
  id: string;
  userName: string;
  userEmail: string;
  competitionName: string;
  organizer: string;
  competitionType: 'corporate' | 'bschool';
  position: string;
  year: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  discountPct: number | null;
  createdAt: string;
  reviewedAt: string | null;
  deckUrl: string | null;
  certUrl: string | null;
}

const DEFAULT_PCT: Record<'corporate' | 'bschool', number> = { corporate: 60, bschool: 40 };

const POSITION_LABEL: Record<string, string> = {
  winner: 'Winner',
  runner_up: 'Runner-up',
  second_runner_up: '2nd Runner-up',
};

export default function DeckVaultAdminClient({ submissions }: { submissions: AdminSubmission[] }) {
  const pending = submissions.filter((s) => s.status === 'pending');
  const reviewed = submissions.filter((s) => s.status !== 'pending');

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            All clear — nothing waiting for review.
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((s) => (
              <PendingCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reviewed ({reviewed.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">Who</th>
                  <th className="px-4 py-2.5 font-semibold">Competition</th>
                  <th className="px-4 py-2.5 font-semibold">Result</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">%</th>
                  <th className="px-4 py-2.5 font-semibold">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{s.userName}</p>
                      <p className="text-xs text-muted-foreground">{s.userEmail}</p>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {s.competitionName} ({s.year})
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {POSITION_LABEL[s.position] || s.position}
                    </td>
                    <td className="px-4 py-2.5">
                      {s.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                          <BadgeCheck className="h-3.5 w-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {s.discountPct ? `${s.discountPct}%` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {s.reviewedAt ? new Date(s.reviewedAt).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function PendingCard({ s }: { s: AdminSubmission }) {
  const [pct, setPct] = useState<number>(DEFAULT_PCT[s.competitionType]);
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const approve = () => {
    startTransition(async () => {
      const res = await approveDeckSubmission(s.id, pct);
      if (res.success) {
        toast.success(`Approved — coupon ${res.couponCode} (${pct}% off) issued.`);
      } else {
        toast.error(res.error || 'Approval failed');
      }
    });
  };

  const reject = () => {
    if (note.trim().length < 5) {
      toast.error('Add a short reason — the user sees it.');
      return;
    }
    startTransition(async () => {
      const res = await rejectDeckSubmission(s.id, note.trim());
      if (res.success) toast.success('Submission rejected.');
      else toast.error(res.error || 'Rejection failed');
    });
  };

  const TypeIcon = s.competitionType === 'corporate' ? Building2 : GraduationCap;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{s.competitionName}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <TypeIcon className="h-3 w-3" />
              {s.competitionType === 'corporate' ? 'Corporate' : 'B-school'}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {POSITION_LABEL[s.position] || s.position} · {s.year}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {s.userName} · {s.userEmail}
            {s.organizer ? <> · organizer: {s.organizer}</> : null}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/80">
            <Clock3 className="h-3 w-3" />
            submitted {new Date(s.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {s.deckUrl && (
            <a
              href={s.deckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <FileText className="h-3.5 w-3.5" /> Deck <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {s.certUrl && (
            <a
              href={s.certUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <BadgeCheck className="h-3.5 w-3.5" /> Certificate <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-border pt-4">
        {!rejecting ? (
          <>
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Ticket className="h-3.5 w-3.5" />
              Discount
              <input
                type="number"
                min={1}
                max={90}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="h-8 w-16 rounded-md border border-border bg-background px-2 text-center font-mono text-sm text-foreground outline-none focus:border-primary"
              />
              %
            </label>
            <button
              onClick={approve}
              disabled={isPending || pct < 1 || pct > 90}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-success px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              {isPending ? 'Working…' : 'Approve & issue coupon'}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/40 px-3.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
          </>
        ) : (
          <>
            <input
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason (shown to the user) — e.g. certificate doesn't show your name"
              maxLength={500}
              className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
            />
            <button
              onClick={reject}
              disabled={isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-destructive px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Working…' : 'Confirm reject'}
            </button>
            <button
              onClick={() => setRejecting(false)}
              disabled={isPending}
              className="h-8 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

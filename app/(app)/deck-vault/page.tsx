'use client';

/**
 * Deck Vault Rewards — /deck-vault
 *
 * Upload a winning case-competition deck + certificate -> manual verification
 * (typically 5–6 hours, admin gets a Telegram ping) -> personal single-use
 * coupon: corporate comp podium 60% off Pro, b-school podium 40% off Pro.
 *
 * The page is state-driven off GET /deck-vault/status:
 *   none      -> submission form
 *   pending   -> "under review" card
 *   approved  -> coupon code card (copy + Use on upgrade)
 *   rejected  -> reason + the form again (resubmission allowed)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Trophy, Upload, FileText, BadgeCheck, Clock3, XCircle, Copy,
  ChevronDown, ShieldCheck, ArrowRight, Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  submitDeckVault,
  fetchDeckVaultStatus,
  DECK_VAULT_PCT,
  type DeckVaultState,
  type DeckCompetitionType,
  type DeckPosition,
} from '@/lib/deck-vault-api';

const MAX_DECK_MB = 20;
const MAX_CERT_MB = 10;

const POSITIONS: { value: DeckPosition; label: string }[] = [
  { value: 'winner', label: 'Winner' },
  { value: 'runner_up', label: 'Runner-up' },
  { value: 'second_runner_up', label: '2nd Runner-up' },
];

const TERMS = `By submitting materials to MECE's Deck Vault Rewards programme you confirm and agree that:

1. Ownership & permission — you created the submitted deck (alone or as a named team member) and have the right to share it. It contains no confidential client data, no material you are bound to keep private, and nothing that infringes any third party's rights.

2. Accuracy — the competition name, organiser, year and result you enter are true, and the certificate you upload is genuine and relates to this deck. False or doctored submissions lead to rejection, revocation of any issued coupon or discount (including after purchase), and possible account action.

3. Licence to MECE — you retain ownership of your work, and you grant MECE a worldwide, royalty-free, perpetual, irrevocable, non-exclusive, sublicensable and transferable licence to store, reproduce, adapt, edit, anonymise, translate, publish, distribute and create derivative works from the submitted deck, in whole or in part, for any purpose — including the MECE Deck Vault library, teaching material, product features, research and marketing. Personal details on the certificate are used for verification only and are not published.

4. Verification & discounts — verification is manual and typically takes 5–6 hours. Approval, the discount percentage (up to 60% for corporate competitions, up to 40% for B-school competitions) and coupon issuance are at MECE's sole discretion. Coupons are single-use, non-transferable, tied to your account, and expire 30 days after issue.

5. No compensation — other than the discount coupon, no payment or royalty is due for the submission or its use.`;

type FormState = {
  competition_name: string;
  organizer: string;
  competition_type: DeckCompetitionType;
  position: DeckPosition;
  year: number;
};

export default function DeckVaultPage() {
  const [state, setState] = useState<DeckVaultState | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await createClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const s = await fetchDeckVaultStatus(token);
      setState(s);
    } catch {
      // Show the form; submit will surface any real error.
      setState({ submission: null, coupon: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sub = state?.submission ?? null;
  const coupon = state?.coupon ?? null;

  return (
    <div className="min-h-screen bg-muted py-10 px-4">
      <main className="container mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Deck Vault Rewards
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Turn your winning deck into up to 60% off Pro.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Placed in a case competition? Upload your deck and certificate. We verify it
            (typically 5–6 hours) and send a personal coupon —{' '}
            <span className="font-semibold text-foreground">60% off</span> for corporate
            competitions, <span className="font-semibold text-foreground">40% off</span> for
            B-school competitions.
          </p>
        </div>

        {loading ? (
          <div className="ui-card flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your status…
          </div>
        ) : !authed ? (
          <div className="ui-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Please log in to claim your discount.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Log in
            </Link>
          </div>
        ) : (
          <>
            {sub?.status === 'pending' && <PendingCard sub={sub} />}
            {sub?.status === 'approved' && <ApprovedCard coupon={coupon} pct={sub.discount_pct} />}
            {sub?.status === 'rejected' && <RejectedCard note={sub.admin_note} />}
            {(!sub || sub.status === 'rejected') && <SubmitForm onDone={refresh} />}
          </>
        )}
      </main>
    </div>
  );
}

/* ── Status cards ──────────────────────────────────────────────────────────── */

function PendingCard({ sub }: { sub: NonNullable<DeckVaultState['submission']> }) {
  return (
    <div className="ui-card p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <Clock3 className="h-5 w-5 text-amber-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Verification in progress</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            We&apos;ve received your deck for{' '}
            <span className="font-medium text-foreground">{sub.competition_name}</span> ({sub.year}).
            Verification typically takes <span className="font-semibold text-foreground">5–6 hours</span>.
            Your coupon code will appear right here once approved — no need to keep the tab open.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApprovedCard({
  coupon,
  pct,
}: {
  coupon: DeckVaultState['coupon'];
  pct: number | null;
}) {
  const copy = async () => {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success('Coupon code copied!');
    } catch {
      toast.error('Could not copy — long-press / select the code instead.');
    }
  };

  const effectivePct = coupon?.discount_pct ?? pct ?? 0;
  const redeemed = coupon?.status === 'redeemed';

  return (
    <div className="ui-card border-primary/40 p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10">
          <BadgeCheck className="h-5 w-5 text-success" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">
            Verified — {effectivePct}% off unlocked!
          </h2>
          {redeemed ? (
            <p className="mt-1 text-sm text-muted-foreground">
              This coupon has been used. Enjoy Pro!
            </p>
          ) : coupon ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Apply this code on the upgrade page. Single-use, valid until{' '}
                {new Date(coupon.expires_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="rounded-lg border border-dashed border-primary/50 bg-primary/[0.04] px-4 py-2 font-mono text-base font-bold tracking-wider text-primary">
                  {coupon.code}
                </code>
                <button
                  onClick={copy}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <Link
                  href="/upgrade"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Use it now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Your submission was approved — the coupon is being issued. Check back in a bit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RejectedCard({ note }: { note: string }) {
  return (
    <div className="ui-card border-destructive/30 p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-5 w-5 text-destructive" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Submission not approved</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {note || 'We couldn’t verify this submission.'} You&apos;re welcome to submit
            again below with clearer proof (e.g. a certificate that shows your name and result).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Submission form ───────────────────────────────────────────────────────── */

function SubmitForm({ onDone }: { onDone: () => Promise<void> }) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - 2015 + 1 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const [form, setForm] = useState<FormState>({
    competition_name: '',
    organizer: '',
    competition_type: 'corporate',
    position: 'winner',
    year: currentYear,
  });
  const [deck, setDeck] = useState<File | null>(null);
  const [cert, setCert] = useState<File | null>(null);
  const [tnc, setTnc] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const deckRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const pct = DECK_VAULT_PCT[form.competition_type];

  const pickFile = (f: File | null, maxMb: number, label: string, set: (f: File | null) => void) => {
    if (!f) return set(null);
    if (f.size > maxMb * 1024 * 1024) {
      toast.error(`${label} must be under ${maxMb} MB.`);
      return set(null);
    }
    set(f);
  };

  const canSubmit =
    form.competition_name.trim().length >= 3 && !!deck && !!cert && tnc && !submitting;

  const submit = async () => {
    if (!canSubmit || !deck || !cert) return;
    setSubmitting(true);
    try {
      const { data } = await createClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Please log in again.');
      const res = await submitDeckVault(
        {
          competition_name: form.competition_name.trim(),
          organizer: form.organizer.trim(),
          competition_type: form.competition_type,
          position: form.position,
          year: form.year,
          deck,
          certificate: cert,
        },
        token,
      );
      toast.success(res.message || 'Deck received! Verification takes 5–6 hours.');
      await onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ui-card p-6 sm:p-8 animate-slide-up">
      <div className="space-y-5">
        {/* Competition type — the choice that sets the discount */}
        <div>
          <Label>Competition type</Label>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {(
              [
                { v: 'corporate', title: 'Corporate', sub: 'Run by a company (e.g. HUL LIME, TAS, XLRI-RBI…)' },
                { v: 'bschool', title: 'B-school', sub: 'Run by a college / IIM fest or club' },
              ] as { v: DeckCompetitionType; title: string; sub: string }[]
            ).map(({ v, title, sub }) => {
              const active = form.competition_type === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, competition_type: v }))}
                  aria-pressed={active}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    active
                      ? 'border-primary bg-primary/[0.05] shadow-sm'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                        active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {DECK_VAULT_PCT[v]}% off
                    </span>
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name + organizer */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dv-name">Competition name *</Label>
            <input
              id="dv-name"
              value={form.competition_name}
              onChange={(e) => setForm((f) => ({ ...f, competition_name: e.target.value }))}
              maxLength={120}
              placeholder="e.g. HUL L.I.M.E. Season 15"
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
            />
          </div>
          <div>
            <Label htmlFor="dv-org">Organizer</Label>
            <input
              id="dv-org"
              value={form.organizer}
              onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
              maxLength={120}
              placeholder="e.g. Hindustan Unilever"
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
            />
          </div>
        </div>

        {/* Position + year */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dv-pos">Your result *</Label>
            <select
              id="dv-pos"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as DeckPosition }))}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="dv-year">Year *</Label>
            <select
              id="dv-year"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Files */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FilePick
            label="Winning deck *"
            hint={`PDF / PPTX / PPT · up to ${MAX_DECK_MB} MB`}
            accept=".pdf,.pptx,.ppt"
            file={deck}
            inputRef={deckRef}
            icon={<Upload className="h-4 w-4" />}
            onPick={(f) => pickFile(f, MAX_DECK_MB, 'Deck', setDeck)}
          />
          <FilePick
            label="Certificate *"
            hint={`PDF / PNG / JPG · up to ${MAX_CERT_MB} MB`}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            file={cert}
            inputRef={certRef}
            icon={<FileText className="h-4 w-4" />}
            onPick={(f) => pickFile(f, MAX_CERT_MB, 'Certificate', setCert)}
          />
        </div>

        {/* T&C */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={tnc}
              onChange={(e) => setTnc(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 text-primary accent-current"
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              I confirm this is my own work, the certificate is genuine, and I grant MECE the
              rights to store, reproduce, adapt, anonymise and publish this deck (including in
              the Deck Vault library).{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms((s) => !s);
                }}
                className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
              >
                Full terms <ChevronDown className={`h-3 w-3 transition-transform ${showTerms ? 'rotate-180' : ''}`} />
              </button>
            </span>
          </label>
          {showTerms && (
            <pre className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 font-sans text-[11px] leading-relaxed text-muted-foreground">
              {TERMS}
            </pre>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>Submit for verification — get {pct}% off</>
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Stored in a private vault · manual verification in ~5–6 hours · coupon valid 30 days
        </p>
      </div>
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

function FilePick({
  label, hint, accept, file, onPick, icon, inputRef,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onPick: (f: File | null) => void;
  icon: React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`mt-1.5 flex w-full items-center gap-2.5 rounded-md border border-dashed p-3 text-left transition-colors ${
          file ? 'border-success/50 bg-success/[0.04]' : 'border-border bg-background hover:border-primary/50'
        }`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${file ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
          {file ? <BadgeCheck className="h-4 w-4" /> : icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium text-foreground">
            {file ? file.name : 'Click to choose a file'}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB — tap to replace` : hint}
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

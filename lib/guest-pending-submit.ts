/**
 * A guest's finished answer, waiting for their account (2026-10-07).
 *
 * A guest presses "See my score" on /cases/<id>, and the save wall asks them to
 * create an account. The answer must survive that detour to be scored:
 *   - Google / LinkedIn: a full-page redirect in the SAME tab — sessionStorage
 *     (PENDING_REC_KEY in ConversationalSolve) has always covered this.
 *   - Email + password, when the project requires email confirmation: the
 *     confirmation link opens a NEW tab. sessionStorage is per tab, so the
 *     answer was invisible there, nothing was submitted, and the new account
 *     finished onboarding on the dashboard with its score never produced.
 * localStorage is shared by every tab of the same site, so this copy is what
 * the confirmation tab reads.
 *
 * Guards, because localStorage outlives the tab:
 *   - bound to the auth user id that wrote it (the same id after conversion —
 *     anonymous sign-up upgrades the SAME auth.users row), so another account
 *     signing in on this browser never sees or submits it — it is dropped;
 *   - bound to the case AND the attempt it belongs to, so it can only ever
 *     finish the attempt it came from;
 *   - expires after 24 hours, and is removed as soon as the submit succeeds.
 * It holds only what the guest already typed into this browser.
 */

const KEY = 'mece:pending-submit';

/**
 * The per-tab copy (sessionStorage), kept by the solve screen since guest mode
 * shipped: survives the Google / LinkedIn redirect, which returns to the same
 * tab. Per case so two tabs on different cases cannot clobber each other.
 */
export const pendingRecSessionKey = (caseId: string) => `mece:pending-rec:${caseId}`;

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingSubmit {
  caseId: string;
  attemptId: string;
  userId: string;
  rec: string;
  ts: number;
}

function isPendingSubmit(v: unknown): v is PendingSubmit {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.caseId === 'string' &&
    typeof p.attemptId === 'string' &&
    typeof p.userId === 'string' &&
    typeof p.rec === 'string' &&
    typeof p.ts === 'number'
  );
}

export function savePendingSubmit(p: Omit<PendingSubmit, 'ts'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, ts: Date.now() }));
  } catch {
    /* private mode / storage disabled — the same-tab paths still work */
  }
}

/**
 * The waiting answer for THIS case and THIS user, or null. Anything stale,
 * malformed or written by another account is removed on sight; an entry for a
 * different case is left alone (it may still be on its way there).
 */
export function readPendingSubmit(caseId: string, userId: string): PendingSubmit | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* malformed */
  }
  if (
    !isPendingSubmit(parsed) ||
    parsed.userId !== userId ||
    Date.now() - parsed.ts > MAX_AGE_MS ||
    Date.now() < parsed.ts - 60_000 ||
    !parsed.rec.trim()
  ) {
    clearPendingSubmit();
    return null;
  }
  return parsed.caseId === caseId ? parsed : null;
}

export function clearPendingSubmit(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Remove the copy only if it belongs to this case (another case's is left alone). */
export function clearPendingSubmitFor(caseId: string): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      /* malformed — remove below */
    }
    if (!isPendingSubmit(parsed) || parsed.caseId === caseId) localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

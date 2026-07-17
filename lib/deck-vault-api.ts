/**
 * Deck Vault Rewards — client helpers for the FastAPI backend.
 * Upload a winning case-comp deck + certificate; poll status; surface the coupon.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type DeckCompetitionType = 'corporate' | 'bschool';
export type DeckPosition = 'winner' | 'runner_up' | 'second_runner_up';

/** Default discount matrix — mirrors backend routes/deck_vault.py DEFAULT_PCT. */
export const DECK_VAULT_PCT: Record<DeckCompetitionType, number> = {
  corporate: 60,
  bschool: 40,
};

export interface DeckSubmissionStatus {
  id: string;
  competition_name: string;
  competition_type: DeckCompetitionType;
  position: DeckPosition;
  year: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  discount_pct: number | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface DeckVaultCoupon {
  code: string;
  discount_pct: number;
  tier_scope: string;
  status: 'active' | 'redeemed';
  expires_at: string;
}

export interface DeckVaultState {
  submission: DeckSubmissionStatus | null;
  coupon: DeckVaultCoupon | null;
}

export interface DeckVaultSubmitFields {
  competition_name: string;
  organizer: string;
  competition_type: DeckCompetitionType;
  position: DeckPosition;
  year: number;
  deck: File;
  certificate: File;
}

export async function submitDeckVault(
  fields: DeckVaultSubmitFields,
  token: string,
): Promise<{ submission_id: string; message: string }> {
  const form = new FormData();
  form.append('deck', fields.deck);
  form.append('certificate', fields.certificate);
  form.append('competition_name', fields.competition_name);
  form.append('organizer', fields.organizer);
  form.append('competition_type', fields.competition_type);
  form.append('position', fields.position);
  form.append('year', String(fields.year));
  form.append('tnc_accepted', 'true'); // the page disables submit until the box is ticked

  const res = await fetch(`${API_URL}/deck-vault/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.detail || `Upload failed (${res.status})`);
  }
  return json;
}

export async function fetchDeckVaultStatus(token: string): Promise<DeckVaultState> {
  const res = await fetch(`${API_URL}/deck-vault/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Could not load status (${res.status})`);
  }
  return res.json();
}

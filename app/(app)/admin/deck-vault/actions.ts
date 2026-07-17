'use server';

/**
 * Deck Vault Rewards — admin review actions.
 *
 * approveDeckSubmission: marks the submission approved and mints the user's
 *   single-use coupon (MECE-DECK-XXXXXX, 30-day expiry, Pro scope). The %
 *   defaults to the matrix (corporate 60 / bschool 40) but the admin can
 *   override per case from the review UI.
 * rejectDeckSubmission: marks it rejected with a note shown to the user
 *   (resubmission is allowed).
 *
 * All writes run on the service client AFTER an is_admin check on the session.
 */

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isDrivePath, driveFileId, fetchFileName } from '@/lib/google-drive';
import type { UserRow } from '@/lib/types';

const COUPON_VALID_DAYS = 30;

/** file_type values the Deck Vault library understands for decks. */
const DECK_EXTS = ['pdf', 'pptx', 'ppt'];

/**
 * Derive the deck's file type for the library row. Bucket paths carry a real
 * extension; Drive paths (`gdrive:<id>`) don't — ask Drive for the stored
 * filename (submission_<id>_deck.<ext>) instead. Unknown -> 'pdf'.
 */
async function deckFileType(deckPath: string): Promise<string> {
  let candidate = '';
  if (isDrivePath(deckPath)) {
    const name = await fetchFileName(driveFileId(deckPath));
    candidate = (name || '').split('.').pop()?.toLowerCase() || '';
  } else {
    candidate = (deckPath.split('.').pop() || '').toLowerCase();
  }
  return DECK_EXTS.includes(candidate) ? candidate : 'pdf';
}

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!(userData as Partial<UserRow>)?.is_admin) {
    throw new Error('Forbidden: Admins only');
  }
}

/** Unambiguous alphabet (no 0/O/1/I/L) so codes survive being read out loud. */
function generateCouponCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += alphabet[bytes[i] % alphabet.length];
  return `MECE-DECK-${suffix}`;
}

/** Map submission position to a human-readable result label for the Deck Vault library. */
const POSITION_TO_RESULT: Record<string, string> = {
  winner: 'National Winner',
  runner_up: 'National Runner Up',
  second_runner_up: 'National Semi Finalist',
};

export async function approveDeckSubmission(
  submissionId: string,
  discountPct: number,
): Promise<{ success: boolean; couponCode?: string; error?: string }> {
  try {
    await requireAdmin();

    const pct = Math.round(Number(discountPct));
    if (!Number.isFinite(pct) || pct < 1 || pct > 90) {
      return { success: false, error: 'Discount must be between 1 and 90 percent' };
    }

    const svc = createServiceClient();

    // Fetch full submission data — we need deck_path and competition details
    // to auto-publish into the public Deck Vault library.
    const { data: sub } = await svc
      .from('deck_submissions')
      .select('id, user_id, status, competition_name, organizer, competition_type, position, year, deck_path')
      .eq('id', submissionId)
      .maybeSingle();
    const s = sub as {
      id: string; user_id: string; status: string;
      competition_name: string; organizer: string;
      competition_type: 'corporate' | 'bschool';
      position: string; year: number; deck_path: string;
    } | null;
    if (!s) return { success: false, error: 'Submission not found' };
    if (s.status !== 'pending') return { success: false, error: `Already ${s.status}` };

    // Mint the coupon first (unique partial index enforces one live deck-vault
    // coupon per user — a conflict means they somehow already have one).
    const code = generateCouponCode();
    const expiresAt = new Date(Date.now() + COUPON_VALID_DAYS * 24 * 60 * 60 * 1000);
    const { data: coupon, error: couponError } = await svc
      .from('discount_coupons')
      .insert({
        code,
        user_id: s.user_id,
        discount_pct: pct,
        tier_scope: 'pro',
        source: 'deck_vault',
        submission_id: s.id,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();
    if (couponError || !coupon) {
      return {
        success: false,
        error: couponError?.message?.includes('discount_coupons_one_active')
          ? 'This user already has an active deck-vault coupon'
          : couponError?.message || 'Could not create the coupon',
      };
    }

    const { error: subError } = await svc
      .from('deck_submissions')
      .update({
        status: 'approved',
        discount_pct: pct,
        coupon_id: (coupon as { id: string }).id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', s.id)
      .eq('status', 'pending'); // race-safe vs a double-click / second tab
    if (subError) return { success: false, error: subError.message };

    // ── Auto-publish to the public Deck Vault library ──────────────
    // NOTE: deck_path may be `gdrive:<fileId>` (no extension) — deckFileType()
    // resolves the real type via Drive metadata; naive split('.') would write
    // garbage into file_type and break the vault viewer's content-type mapping.
    const ext = await deckFileType(s.deck_path);
    const resultLabel = POSITION_TO_RESULT[s.position] || 'Other';
    const competitionLabel = s.organizer
      ? `${s.competition_name} · ${s.organizer}`
      : s.competition_name;
    const title = `${s.competition_name} ${s.year} — ${resultLabel} Deck`;

    const { error: skeletonError } = await svc
      .from('deck_skeletons')
      .insert({
        title,
        source_kind: s.competition_type,
        competition: competitionLabel,
        result: resultLabel,
        case_type: 'strategy',      // safe default; admin can edit later
        round_type: 'finale',       // winners typically submit finale decks
        file_type: ext,
        description: `Verified ${resultLabel.toLowerCase()} deck from ${s.competition_name} (${s.year}).`,
        storage_path: s.deck_path,
        is_active: true,
      });
    // Log but don't fail the approval if the skeleton insert fails — the
    // coupon is already issued and the submission is approved.
    if (skeletonError) {
      console.error('Auto-publish to Deck Vault failed:', skeletonError.message);
    }

    revalidatePath('/admin/deck-vault');
    revalidatePath('/admin/decks');
    revalidatePath('/skeletons');
    return { success: true, couponCode: code };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function rejectDeckSubmission(
  submissionId: string,
  note: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const svc = createServiceClient();
    const { error } = await svc
      .from('deck_submissions')
      .update({
        status: 'rejected',
        admin_note: (note || '').trim().slice(0, 500),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .eq('status', 'pending');
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/deck-vault');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

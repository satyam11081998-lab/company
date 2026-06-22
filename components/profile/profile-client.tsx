'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import {
  PLACEMENT_FOCUS_OPTIONS,
  REFERRAL_SOURCES,
  batchYearOptions,
  type CollegeRow,
  type PlacementFocus,
} from '@/lib/types-onboarding';
import type { UserRow, SubmissionRow, BadgeRow } from '@/lib/types';
import BadgePill from '@/components/badge-pill';

interface Props {
  user: UserRow | null;
  authEmail: string;
  colleges: CollegeRow[];
  submissions: SubmissionRow[];
  badges: Array<{ id: string; earned_at: string; badges: BadgeRow }>;
}

/**
 * Profile page client. Three sections:
 *   1. Identity card — avatar, full name, college, email-verification CTA
 *   2. Profile details — editable form (mirrors onboarding fields)
 *   3. Activity — badges + recent submissions
 *
 * Avatar upload writes to the `avatars` Supabase Storage bucket at path
 * `<user.id>/<filename>`. The Storage policies in migration 0005 only let
 * the owner upload to their own folder; public read for the rendered URL.
 */
export default function ProfileClient({
  user,
  authEmail,
  colleges,
  submissions,
  badges,
}: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>((user as any)?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);

  // Editable form state — mirror current values from the user row.
  const [form, setForm] = useState({
    full_name: user?.full_name ?? user?.name ?? '',
    college_id: (user as any)?.college_id ?? '',
    college_other: (user as any)?.college_other ?? '',
    batch_year: (user as any)?.batch_year ?? null,
    placement_focus: ((user as any)?.placement_focus as PlacementFocus | null) ?? null,
    linkedin_url: (user as any)?.linkedin_url ?? '',
    show_linkedin: (user as any)?.show_linkedin ?? true,
    referral_source: (user as any)?.referral_source ?? '',
    weekly_hours_target: (user as any)?.weekly_hours_target ?? null,
    goal_text: (user as any)?.goal_text ?? '',
    college_email: (user as any)?.college_email ?? '',
  });

  const college = useMemo(
    () => colleges.find((c) => c.id === form.college_id) ?? null,
    [colleges, form.college_id],
  );
  const collegeEmailVerified = !!(user as any)?.college_email_verified_at;
  const points = (user as any)?.points ?? 0;

  /* ── Avatar upload ────────────────────────────────────────────── */
  const onAvatarPicked = async (file: File) => {
    if (!user?.id) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (max 2MB). Try a smaller file.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache-bust so the new image shows immediately.
      const urlWithBust = `${pub.publicUrl}?v=${Date.now()}`;

      const { error: updateErr } = await supabase
        .from('users')
        .update({ avatar_url: urlWithBust, avatar_uploaded_at: new Date().toISOString() })
        .eq('id', user.id);
      if (updateErr) throw updateErr;

      setAvatarUrl(urlWithBust);
      toast.success('New avatar saved.');
      router.refresh();
    } catch (err: any) {
      toast.error(`Upload failed: ${err?.message ?? 'unknown'}`);
    } finally {
      setUploading(false);
    }
  };

  /* ── Save profile ─────────────────────────────────────────────── */
  const onSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const supabase = createBrowserClient();
      const isOther = form.college_id === '__other__' || !form.college_id;
      const { error } = await supabase
        .from('users')
        .update({
          full_name: form.full_name.trim(),
          name: form.full_name.trim(),
          college_id: isOther ? null : form.college_id,
          college_other: isOther ? form.college_other.trim() || null : null,
          batch_year: form.batch_year,
          placement_focus: form.placement_focus,
          linkedin_url: form.linkedin_url.trim() || null,
          show_linkedin: form.show_linkedin,
          referral_source: form.referral_source || null,
          weekly_hours_target: form.weekly_hours_target,
          goal_text: form.goal_text.trim() || null,
        })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated.');
      router.refresh();
    } catch (err: any) {
      toast.error(`Save failed: ${err?.message ?? 'unknown'}`);
    } finally {
      setSaving(false);
    }
  };

  /* ── Verify college email ─────────────────────────────────────── */
  const onSendVerify = async () => {
    if (!form.college_email.trim()) {
      toast.error('Enter your college email first.');
      return;
    }
    setSendingVerify(true);
    try {
      const res = await fetch('/api/college-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.college_email.trim() }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? `Failed (HTTP ${res.status})`);
      toast.success('Verification link sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not send verification email');
    } finally {
      setSendingVerify(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── 1. Identity card ───────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 999,
              background: 'var(--bg-2)',
              border: '2px solid var(--line)',
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: 'var(--ink-3)',
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (form.full_name || authEmail).charAt(0).toUpperCase()
            )}
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            style={{
              position: 'absolute',
              right: -4,
              bottom: -4,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: 'white',
              background: 'var(--red)',
              border: '2px solid var(--card)',
              borderRadius: 999,
              cursor: uploading ? 'wait' : 'pointer',
            }}
          >
            {uploading ? '…' : 'Change'}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAvatarPicked(f);
              e.target.value = '';
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="serif" style={{ fontSize: 26, margin: 0, color: 'var(--ink)' }}>
            {form.full_name || authEmail.split('@')[0]}
          </h1>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>
            {authEmail}
            <span style={{ marginLeft: 6, color: 'var(--ink-4)', fontSize: 11 }}>(login)</span>
          </div>
          {college && (
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)' }}>
              {college.short_name ?? college.name}
              {college.city ? ` · ${college.city}` : ''}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          <Stat label="Points" value={points.toLocaleString('en-IN')} />
          <Stat label="Submissions" value={submissions.length} />
        </div>
      </section>

      {/* ── 2. College email verification ──────────────────────────── */}
      <section
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="eyebrow" style={{ color: 'var(--red)' }}>College email</span>
          {collegeEmailVerified ? (
            <span className="chip" style={{ background: 'rgba(31,122,58,0.10)', color: 'var(--green)', fontSize: 10.5, fontWeight: 700 }}>
              ✓ VERIFIED
            </span>
          ) : (
            <span className="chip" style={{ background: 'var(--bg-2)', color: 'var(--ink-3)', fontSize: 10.5 }}>
              not verified yet
            </span>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '4px 0 12px', lineHeight: 1.5 }}>
          Verifying your college email unlocks <b style={{ color: 'var(--ink)' }}>real cohort GDs</b> —
          you&apos;ll be matched with verified students from your batch. You can do this
          now or later when you become a Pro member.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={form.college_email}
            onChange={(e) => setForm({ ...form, college_email: e.target.value })}
            placeholder="your.name@iimx.ac.in"
            style={{
              flex: 1,
              minWidth: 220,
              padding: '10px 12px',
              fontSize: 13.5,
              border: '1.5px solid var(--line)',
              borderRadius: 10,
              background: 'var(--card)',
              color: 'var(--ink)',
            }}
          />
          <button
            type="button"
            onClick={onSendVerify}
            disabled={sendingVerify || collegeEmailVerified}
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              color: 'white',
              background: collegeEmailVerified ? 'var(--ink-4)' : 'var(--red)',
              border: 'none',
              borderRadius: 10,
              cursor: sendingVerify || collegeEmailVerified ? 'not-allowed' : 'pointer',
              opacity: sendingVerify ? 0.6 : 1,
            }}
          >
            {collegeEmailVerified ? 'Already verified' : sendingVerify ? 'Sending…' : 'Send verification link'}
          </button>
        </div>
      </section>

      {/* ── 3. Editable profile fields ─────────────────────────────── */}
      <section
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Profile details</h2>

        <FieldRow label="Full name">
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            style={textInputStyle}
          />
        </FieldRow>

        <FieldRow label="College / B-school">
          <select
            value={form.college_id || ''}
            onChange={(e) => setForm({ ...form, college_id: e.target.value })}
            style={textInputStyle}
          >
            <option value="">— select —</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short_name ?? c.name}
                {c.city ? ` · ${c.city}` : ''}
              </option>
            ))}
            <option value="__other__">Other / not listed</option>
          </select>
          {form.college_id === '__other__' && (
            <input
              type="text"
              value={form.college_other}
              onChange={(e) => setForm({ ...form, college_other: e.target.value })}
              placeholder="Type your college"
              style={{ ...textInputStyle, marginTop: 8 }}
            />
          )}
        </FieldRow>

        <FieldRow label="Graduation year">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {batchYearOptions().map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setForm({ ...form, batch_year: y })}
                style={chipBtn(form.batch_year === y)}
              >
                {y}
              </button>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Placement focus">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLACEMENT_FOCUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setForm({ ...form, placement_focus: o.value })}
                style={chipBtn(form.placement_focus === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="LinkedIn URL" optional>
          <input
            type="url"
            value={form.linkedin_url}
            onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            placeholder="https://www.linkedin.com/in/…"
            style={textInputStyle}
          />
        </FieldRow>

        <FieldRow label="Show LinkedIn on leaderboard" optional>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            <input
              type="checkbox"
              checked={form.show_linkedin}
              onChange={(e) => setForm({ ...form, show_linkedin: e.target.checked })}
              style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--red)', cursor: 'pointer' }}
            />
            <span>Display a LinkedIn link next to your name on the leaderboard so other aspirants can connect. Turn this off to stay anonymous there.</span>
          </label>
        </FieldRow>

        <FieldRow label="How did you hear about us?" optional>
          <select
            value={form.referral_source}
            onChange={(e) => setForm({ ...form, referral_source: e.target.value })}
            style={textInputStyle}
          >
            <option value="">— pick one —</option>
            {REFERRAL_SOURCES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="Weekly prep hours" optional>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={form.weekly_hours_target ?? 0}
            onChange={(e) => setForm({ ...form, weekly_hours_target: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--red)' }}
          />
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {form.weekly_hours_target ? `${form.weekly_hours_target} hrs/week target` : 'No target set'}
          </div>
        </FieldRow>

        <FieldRow label="What does success look like for you?" optional>
          <textarea
            value={form.goal_text}
            onChange={(e) => setForm({ ...form, goal_text: e.target.value })}
            rows={3}
            style={{ ...textInputStyle, resize: 'vertical', minHeight: 80 }}
          />
        </FieldRow>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={saving}
            style={{
              padding: '11px 20px',
              fontSize: 13.5,
              fontWeight: 700,
              color: 'white',
              background: 'var(--red)',
              border: 'none',
              borderRadius: 10,
              cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </section>

      {/* ── 4. Badges + submissions ────────────────────────────────── */}
      {badges.length > 0 && (
        <section
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 10 }}>Badges earned ({badges.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {badges.map((ub) => (
              <BadgePill key={ub.id} badge={ub.badges} size="md" />
            ))}
          </div>
        </section>
      )}

      <section
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 10 }}>Recent submissions</div>
        {submissions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            No submissions yet —{' '}
            <Link href="/practice" style={{ color: 'var(--red)', fontWeight: 600 }}>
              try a case
            </Link>
            .
          </p>
        ) : (
          submissions.map((s) => (
            <Link
              key={s.id}
              href={`/results/${s.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderTop: '1px solid var(--line)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  {new Date(s.created_at).toLocaleString()}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.answer_text.slice(0, 140)}…
                </div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginLeft: 12 }}>
                {s.score ?? '—'}
                <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>/100</span>
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function FieldRow({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{label}</label>
        {optional && (
          <span style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>
            Optional
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const textInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 13.5,
  fontFamily: 'inherit',
  color: 'var(--ink)',
  background: 'var(--card)',
  border: '1.5px solid var(--line)',
  borderRadius: 10,
  outline: 'none',
  boxSizing: 'border-box',
};

function chipBtn(selected: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: 'var(--ff-mono)',
    color: selected ? 'white' : 'var(--ink)',
    background: selected ? 'var(--red)' : 'var(--card)',
    border: `1.5px solid ${selected ? 'var(--red)' : 'var(--line)'}`,
    borderRadius: 999,
    cursor: 'pointer',
  };
}

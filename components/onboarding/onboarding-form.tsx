'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  EMPTY_ONBOARDING_FORM,
  PLACEMENT_FOCUS_OPTIONS,
  REFERRAL_SOURCES,
  batchYearOptions,
  validateOnboarding,
  type CollegeRow,
  type OnboardingFormData,
} from '@/lib/types-onboarding';

interface Props {
  colleges: CollegeRow[];
  prefill?: Partial<OnboardingFormData>;
}

/**
 * Single-scroll onboarding form.
 *
 * UX rules (owner directive 2026-06-08):
 *   - Required fields show a red asterisk + inline "Required" label on miss
 *   - Optional fields are clearly tagged so users know they can skip
 *   - College dropdown is a searchable combobox with "Other" as the last
 *     option; selecting "Other" reveals a free-text input (also required)
 *   - Submit button gates on validation; failed fields scroll into view
 *   - Branded styling — cream cards, var(--red) accents, no third-party UI
 */
export default function OnboardingForm({ colleges, prefill = {} }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<OnboardingFormData>({
    ...EMPTY_ONBOARDING_FORM,
    ...prefill,
  });
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');

  // Group colleges by tier for the dropdown. Tier 1 first, then 2, then 3.
  const filteredColleges = useMemo(() => {
    const q = collegeSearch.toLowerCase().trim();
    if (!q) return colleges;
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.short_name ?? '').toLowerCase().includes(q) ||
        (c.city ?? '').toLowerCase().includes(q),
    );
  }, [colleges, collegeSearch]);

  const update = <K extends keyof OnboardingFormData>(k: K, v: OnboardingFormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      const n = new Set(e);
      n.delete(k as string);
      return n;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = validateOnboarding(form);
    if (missing.length > 0) {
      setErrors(new Set(missing));
      // Scroll the first missing field into view so users don't have to hunt.
      const first = document.querySelector<HTMLElement>(`[data-field="${missing[0]}"]`);
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      toast.error('Please fill the required fields highlighted in red.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error ?? `Failed (HTTP ${res.status})`);
      }
      toast.success("You're in. Let's get to the dashboard.");
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong. Try again?');
    } finally {
      setSubmitting(false);
    }
  };

  const isOther = form.college_id === '__other__';

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        fontSize: 14,
        color: 'var(--ink)',
      }}
    >
      <header style={{ marginBottom: 8 }}>
        <h1
          className="serif"
          style={{ fontSize: 'clamp(28px, 3vw, 36px)', lineHeight: 1.15, margin: 0 }}
        >
          One quick set-up, then you&apos;re in.
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-3)', maxWidth: 540 }}>
          We use this to personalise your cases, your cohort, and the GD feature
          coming next. It takes about 30 seconds.
        </p>
      </header>

      {/* ── Full name ──────────────────────────────────────────────── */}
      <Field
        label="Full name"
        required
        error={errors.has('full_name') ? 'Required' : undefined}
        dataField="full_name"
      >
        <input
          type="text"
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          placeholder="As it appears on your CV"
          autoComplete="name"
          style={inputStyle(errors.has('full_name'))}
        />
      </Field>

      {/* ── College ────────────────────────────────────────────────── */}
      <Field
        label="College / B-school"
        required
        error={errors.has('college_id') ? 'Required' : undefined}
        hint="Type to search. Pick 'Other' if you don't see yours."
        dataField="college_id"
      >
        <input
          type="text"
          value={collegeSearch}
          onChange={(e) => setCollegeSearch(e.target.value)}
          placeholder="Type to search — e.g. IIM Ahmedabad, ISB, XLRI…"
          style={{ ...inputStyle(false), marginBottom: 8 }}
        />
        <div
          style={{
            maxHeight: 240,
            overflowY: 'auto',
            border: `1px solid ${errors.has('college_id') ? 'var(--red)' : 'var(--line)'}`,
            borderRadius: 10,
            background: 'var(--card)',
          }}
        >
          {filteredColleges.length === 0 ? (
            <div style={{ padding: '12px 14px', color: 'var(--ink-4)', fontSize: 13 }}>
              No matches. Try a different search, or pick &quot;Other&quot; below.
            </div>
          ) : (
            filteredColleges.map((c) => (
              <CollegeRowItem
                key={c.id}
                college={c}
                selected={form.college_id === c.id}
                onSelect={() => {
                  update('college_id', c.id);
                  setCollegeSearch(c.short_name ?? c.name);
                }}
              />
            ))
          )}
          <CollegeOtherRow
            selected={isOther}
            onSelect={() => {
              update('college_id', '__other__');
              setCollegeSearch('Other');
            }}
          />
        </div>
        {isOther && (
          <input
            type="text"
            value={form.college_other}
            onChange={(e) => update('college_other', e.target.value)}
            placeholder="Type your college name"
            style={{ ...inputStyle(errors.has('college_other')), marginTop: 10 }}
            data-field="college_other"
          />
        )}
      </Field>

      {/* ── Batch year ─────────────────────────────────────────────── */}
      <Field
        label="Graduation year"
        required
        error={errors.has('batch_year') ? 'Required' : undefined}
        hint="The year you finish your MBA."
        dataField="batch_year"
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {batchYearOptions().map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => update('batch_year', y)}
              style={chipStyle(form.batch_year === y, errors.has('batch_year'))}
            >
              {y}
            </button>
          ))}
        </div>
      </Field>

      {/* ── Placement focus ────────────────────────────────────────── */}
      <Field
        label="What are you prepping for?"
        required
        error={errors.has('placement_focus') ? 'Required' : undefined}
        dataField="placement_focus"
      >
        <div style={{ display: 'grid', gap: 10 }}>
          {PLACEMENT_FOCUS_OPTIONS.map((o) => {
            const selected = form.placement_focus === o.value;
            return (
              <label
                key={o.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${
                    selected ? 'var(--red)' : errors.has('placement_focus') ? 'var(--red)' : 'var(--line)'
                  }`,
                  background: selected ? 'rgba(200,16,46,0.04)' : 'var(--card)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="placement_focus"
                  checked={selected}
                  onChange={() => update('placement_focus', o.value)}
                  style={{ accentColor: 'var(--red)', marginTop: 3 }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{o.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{o.hint}</div>
                </div>
              </label>
            );
          })}
        </div>
      </Field>

      {/* ── Optional section ───────────────────────────────────────── */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 16,
          borderTop: '1px dashed var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
          Optional — helps us personalise (skip if you want)
        </div>

        <Field label="LinkedIn URL" optional dataField="linkedin_url">
          <input
            type="url"
            value={form.linkedin_url}
            onChange={(e) => update('linkedin_url', e.target.value)}
            placeholder="https://www.linkedin.com/in/…"
            style={inputStyle(false)}
            autoComplete="url"
          />
        </Field>

        <Field label="Show LinkedIn on the leaderboard" optional dataField="show_linkedin">
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, lineHeight: 1.45 }}>
            <input
              type="checkbox"
              checked={form.show_linkedin}
              onChange={(e) => update('show_linkedin', e.target.checked)}
              style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--red)', cursor: 'pointer' }}
            />
            <span>Show a LinkedIn link next to your name on the leaderboard so other aspirants can connect. You can change this anytime in your profile.</span>
          </label>
        </Field>

        <Field label="How did you hear about us?" optional dataField="referral_source">
          <select
            value={form.referral_source}
            onChange={(e) => update('referral_source', e.target.value)}
            style={inputStyle(false)}
          >
            <option value="">— pick one —</option>
            {REFERRAL_SOURCES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>

        <Field
          label="Prep hours per week (target)"
          optional
          hint={form.weekly_hours_target ? `${form.weekly_hours_target} hrs/week` : 'Move the slider to set a goal'}
          dataField="weekly_hours_target"
        >
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={form.weekly_hours_target ?? 0}
            onChange={(e) => update('weekly_hours_target', Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--red)' }}
          />
        </Field>

        <Field label="What does success look like for you?" optional dataField="goal_text">
          <textarea
            value={form.goal_text}
            onChange={(e) => update('goal_text', e.target.value)}
            placeholder="e.g. PPO from BCG by Day 1, or top decile in summers."
            rows={3}
            style={{ ...inputStyle(false), resize: 'vertical', minHeight: 80 }}
          />
        </Field>
      </div>

      {/* ── Submit ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <button
          type="submit"
          className="btn primary pulse-soft"
          disabled={submitting}
          style={{
            padding: '14px 26px',
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 10,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Setting up your dashboard…' : "Let's go →"}
        </button>
        <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
          You can update any of this later on your profile.
        </span>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function Field({
  label,
  required,
  optional,
  hint,
  error,
  dataField,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  dataField: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={dataField}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
          {label}
          {required && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
        </label>
        {optional && (
          <span style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>
            Optional
          </span>
        )}
        {error && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>
            {error}
          </span>
        )}
      </div>
      {hint && !error && (
        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 8 }}>{hint}</div>
      )}
      {children}
    </div>
  );
}

function inputStyle(invalid: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--card)',
    border: `1.5px solid ${invalid ? 'var(--red)' : 'var(--line)'}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function chipStyle(selected: boolean, invalid: boolean): React.CSSProperties {
  return {
    padding: '9px 16px',
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: 'var(--ff-mono)',
    color: selected ? 'white' : 'var(--ink)',
    background: selected ? 'var(--red)' : 'var(--card)',
    border: `1.5px solid ${selected ? 'var(--red)' : invalid ? 'var(--red)' : 'var(--line)'}`,
    borderRadius: 999,
    cursor: 'pointer',
  };
}

function CollegeRowItem({
  college,
  selected,
  onSelect,
}: {
  college: CollegeRow;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        width: '100%',
        background: selected ? 'rgba(200,16,46,0.06)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--line)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
          {college.short_name ?? college.name}
        </div>
        {college.city && (
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>
            {college.city}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 10,
          padding: '3px 8px',
          borderRadius: 999,
          background: college.tier === 1 ? 'rgba(200,16,46,0.10)' : 'var(--bg-2)',
          color: college.tier === 1 ? 'var(--red)' : 'var(--ink-3)',
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}
      >
        T{college.tier}
      </span>
    </button>
  );
}

function CollegeOtherRow({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        width: '100%',
        background: selected ? 'rgba(200,16,46,0.06)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--ink)',
      }}
    >
      ＋ Other / not listed
    </button>
  );
}

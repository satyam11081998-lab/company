/**
 * Types for the onboarding + profile flow.
 * Kept separate from lib/types.ts so the onboarding feature can iterate
 * without merge churn against the broader user/case type surface.
 */

export interface CollegeRow {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  type: 'iim' | 'mba' | 'engineering' | 'other';
  tier: 1 | 2 | 3;
  city: string | null;
  state_code: string | null;
  is_active: boolean;
}

export type PlacementFocus = 'summer' | 'final' | 'both';

export const PLACEMENT_FOCUS_OPTIONS: { value: PlacementFocus; label: string; hint: string }[] = [
  { value: 'summer', label: 'Summer Internships',  hint: 'SIP prep — typically Year 1' },
  { value: 'final',  label: 'Final Placements',    hint: 'FPP prep — typically Year 2' },
  { value: 'both',   label: 'Both',                hint: "I'll prep for either as it comes up" },
];

export const REFERRAL_SOURCES = [
  { value: 'friend',    label: 'A friend or batchmate' },
  { value: 'social',    label: 'Instagram / LinkedIn / X' },
  { value: 'search',    label: 'Google / search' },
  { value: 'college',   label: 'College placement cell' },
  { value: 'newsletter',label: 'Newsletter or blog' },
  { value: 'other',     label: 'Somewhere else' },
];

// Batch years offered in the dropdown — current year ±2.
export function batchYearOptions(now: Date = new Date()): number[] {
  const y = now.getFullYear();
  return [y - 1, y, y + 1, y + 2, y + 3];
}

export interface OnboardingFormData {
  full_name: string;
  college_id: string | null;     // null when 'other'
  college_other: string;         // free text when 'other'
  batch_year: number | null;
  placement_focus: PlacementFocus | null;
  // Optional / analytics
  linkedin_url: string;
  referral_source: string;
  weekly_hours_target: number | null;
  goal_text: string;
}

export const EMPTY_ONBOARDING_FORM: OnboardingFormData = {
  full_name: '',
  college_id: null,
  college_other: '',
  batch_year: null,
  placement_focus: null,
  linkedin_url: '',
  referral_source: '',
  weekly_hours_target: null,
  goal_text: '',
};

/** Required-field check for the onboarding form. Returns an array of field
 *  keys that failed. UI maps these to red borders + inline errors. */
export function validateOnboarding(form: OnboardingFormData): (keyof OnboardingFormData)[] {
  const errors: (keyof OnboardingFormData)[] = [];
  if (!form.full_name.trim()) errors.push('full_name');
  if (!form.college_id && !form.college_other.trim()) errors.push('college_id');
  if (form.college_id === '__other__' && !form.college_other.trim()) errors.push('college_other');
  if (!form.batch_year) errors.push('batch_year');
  if (!form.placement_focus) errors.push('placement_focus');
  return errors;
}

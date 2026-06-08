/**
 * Database row types matching the existing Supabase schema.
 */

export type SubscriptionTier = 'free' | 'lite' | 'pro';

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  points: number;
  created_at: string;
  is_admin: boolean;
  subscription_tier: SubscriptionTier;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  streak_count: number;
  streak_last_date: string | null;
  // Onboarding + profile (migration 0005, 2026-06-08). All nullable so
  // existing readers don't break before the user has run through onboarding.
  full_name?: string | null;
  college_id?: string | null;
  college_other?: string | null;
  batch_year?: number | null;
  placement_focus?: 'summer' | 'final' | 'both' | null;
  college_email?: string | null;
  college_email_verified_at?: string | null;
  onboarding_completed_at?: string | null;
  linkedin_url?: string | null;
  referral_source?: string | null;
  weekly_hours_target?: number | null;
  goal_text?: string | null;
  avatar_uploaded_at?: string | null;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  tier: 'lite' | 'pro';
  amount_paise: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  paid_at: string | null;
}

export interface CaseRow {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  content: string;
  hint: string | null;
  is_active: boolean;
  created_at: string;
  solution?: string | null;
  code?: string | null;
  skill_node?: string | null;
  skill_cluster?: string | null;
  interview_meta?: {
    firm?: string;
    round?: string;
    est_minutes?: number;
    points_reward?: number;
  } | null;
  mcq?: {
    options: { label: string; value: string; is_correct: boolean }[];
    explainer?: string;
  } | null;
  source_brief_id?: string | null;
}

export interface FeedbackJson {
  breakdown?: Record<string, number>;
  strengths?: string[];
  improvements?: string[];
  summary?: string;
  rubric?: string;
  backstop?: Record<string, unknown>;
}

export interface SubmissionRow {
  id: string;
  user_id: string;
  case_id: string;
  answer_text: string;
  score: number | null;
  feedback_json: FeedbackJson | null;
  created_at: string;
}

export interface GdBriefRow {
  id: string;
  topic: string;
  summary: string;
  points_for: string[];
  points_against: string[];
  smart_angles: string[];
  data_points: string[];
  how_to_open: string;
  how_to_close: string;
  source_url: string | null;
  created_at: string;
}

export interface LearnContentRow {
  id: string;
  case_type: string;
  title: string;
  body: string;
  display_order: number;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  points: number;
  submission_count: number;
}
/** A news headline curated for GD-worthiness. */
export interface NewsHeadline {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  source_url: string;
  source_name: string;
  published_at: string;
  keywords: string[];
  category: string;
  is_star: boolean;
  has_brief: boolean;
}

/** A fully-generated GD brief, returned by /news/briefs/{id}. */
export interface GeneratedBriefData {
  id: string;
  headline_id: string;
  headline_title: string;
  headline_source_name: string;
  headline_source_url: string;
  headline_thumbnail_url: string | null;
  summary: string;
  gd_type: string;
  likely_questions: string[];
  smart_angles: string[];
  data_points: string[];
  opening_lines: string[];
  counter_arguments: string[];
  closing_lines: string[];
  created_at: string;
}

/** A row from the daily_schedule table — the pre-filled queue of daily cases/guesstimates. */
export interface DailyScheduleRow {
  id: string;
  scheduled_date: string;           // YYYY-MM-DD format
  case_id: string | null;
  guesstimate_code: string | null;
  brief_headline_id: string | null;
  created_at: string;
  notes: string | null;
}

/** Today's daily schedule with joined case info (from the today_daily_schedule view). */
export interface TodayDailyData {
  id: string;
  scheduled_date: string;
  case_id: string | null;
  guesstimate_code: string | null;
  brief_headline_id: string | null;
  case_title: string | null;
  case_type: string | null;
  case_difficulty: string | null;
}

/** A row from the case_attempts table — tracks attempt order per (user, case). */
export interface CaseAttemptRow {
  id: string;
  user_id: string;
  case_id: string;
  submission_id: string;
  attempt_number: number;
  is_first_attempt: boolean;
  counted_for_daily: boolean;
  daily_date: string | null;
  created_at: string;
}

/** A single entry on the daily leaderboard — top scorers on today's daily case. */
export interface DailyLeaderboardEntry {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  score: number;
  submission_id: string;
  submitted_at: string;
}

/** A badge definition from the badges catalog. */
export interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;          // Lucide icon name as string
  category: 'milestone' | 'streak' | 'mastery' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  created_at: string;
}

/** A badge earned by a user, joined with badge details. */
export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  trigger_submission_id: string | null;
  badge?: BadgeRow;       // populated by joined queries
}

/** A user's difficulty rating for a case. */
export interface CaseRatingRow {
  id: string;
  case_id: string;
  user_id: string;
  rating: 'easier' | 'right' | 'harder';
  submission_id: string | null;
  created_at: string;
}

/** Aggregated rating distribution for a case (used in display). */
export interface CaseRatingAggregate {
  case_id: string;
  total: number;
  easier_count: number;
  right_count: number;
  harder_count: number;
  perceived_difficulty: 'easier' | 'right' | 'harder' | null;
}

export interface CheatSheetRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export type CheatSheetItemKind =
  | 'data_point' | 'smart_angle' | 'counter_argument' | 'opening_line' | 'closing_line';

export interface CheatSheetItemRow {
  id: string;
  sheet_id: string;
  user_id: string;
  source_headline_id: string | null;
  source_topic: string;
  source_kind: CheatSheetItemKind;
  content: string;
  note: string | null;
  position: number;
  created_at: string;
}

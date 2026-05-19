/**
 * Database row types matching the existing Supabase schema.
 */

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  points: number;
  created_at: string;
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
}

export interface FeedbackJson {
  breakdown?: Record<string, number>;
  did_well?: string[];
  improve?: string[];
  summary?: string;
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

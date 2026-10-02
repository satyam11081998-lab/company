/**
 * Interview Intelligence — response shapes of the INDEPENDENT II service (REST v1).
 * Mirrors consilio-interview-intelligence/docs/C_API_CONTRACT.md §2. Nothing here is
 * shared with the case-interview product's types.
 */

export type SessionStatus =
  | 'created' | 'uploading' | 'analyzing' | 'ready' | 'active' | 'paused'
  | 'completed' | 'abandoned' | 'expired' | 'failed';

export type EvidenceState = 'strong' | 'moderate' | 'weak' | 'contradictory' | 'not_sufficiently_tested';
export type Confidence = 'high' | 'moderate' | 'low';
export type AssessmentConfidence = 'high' | 'moderate' | 'limited';

export interface IIErrorBody {
  error: { code: string; message: string; [k: string]: unknown };
}

export interface IIMe {
  user: { id: string; email: string };
  access: { allowed: boolean; via: string | null; reason: string | null };
  is_admin: boolean;
  limits: {
    max_active_sessions: number;
    active_count: number;
    active_sessions: { id: string; status: SessionStatus; role_title: string }[];
    sessions_last_24h: number;
    max_sessions_per_day: number;
    allowed_durations: number[];
    max_upload_mb: number;
  };
  flags: { voice: boolean; voice_engine?: 'realtime' | 'standard'; company_intel: boolean; advanced_technical: boolean };
}

export interface IIDocument {
  id: string;
  kind: 'cv' | 'jd';
  source: 'upload' | 'paste';
  label: string;
  file_name: string;
  ext: string;
  size_bytes: number;
  version: number;
  page_count: number | null;
  parse_status: 'pending' | 'parsed' | 'unreadable';
  parse_error: string | null;
  warnings: string[];
  storage_status: string;
  created_at: string;
  analysis_status: 'pending' | 'running' | 'ready' | 'failed' | 'unreadable';
  analysis?: Record<string, any>;
}

export interface IIProgress {
  status: SessionStatus;
  ended_reason: string | null;
  section?: string;
  section_title?: string;
  elapsed_s?: number;
  remaining_s?: number;
  duration_s?: number;
  questions_asked?: number;
  questions_planned?: number;
}

export interface PreInterviewSummary {
  competencies_identified: number;
  strong_in_cv: number;
  need_validation: number;
  competencies: { id: string; name: string; importance: string; cv_strength: string }[];
  role: { title: string; family: string; seniority: string; industry: string };
  jd_quality: string;
  jd_warnings: string[];
  cv_warnings: string[];
  sections: { kind: string; title: string; minutes: number; questions: number }[];
  claims_to_investigate: number;
  company_context: boolean;
  not_planned?: string[];
}

export interface IISession {
  id: string;
  status: SessionStatus;
  status_reason: string | null;
  mode: string;
  mode_label: string;
  difficulty: string;
  duration_minutes: number;
  role_title: string;
  role_family: string;
  company_name: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  ended_reason: string | null;
  active_seconds: number;
  assessment_status: 'none' | 'pending' | 'processing' | 'ready' | 'partial' | 'failed' | string;
  assessment_confidence: AssessmentConfidence | null;
  source_session_id: string | null;
  config?: Record<string, any>;
  cv_document_id?: string;
  jd_document_id?: string;
  pre_interview_summary?: PreInterviewSummary;
  progress?: IIProgress;
}

export interface IIMessage {
  id: string;
  seq: number;
  role: 'interviewer' | 'candidate';
  content: string;
  kind: string;
  created_at: string;
  exchange_ref?: string | null;
}

export interface TurnResponse {
  messages: IIMessage[];
  session: IIProgress;
  replayed?: boolean;
}

export interface EvidenceRef {
  ref: string;
  quote: string;
  polarity: 'positive' | 'negative' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
  exchange_id: string;
  interpretation: string;
}

export interface CompetencyAssessment {
  competency_id: string;
  canonical_competency_id: string;
  name: string;
  category: string;
  importance: string;
  evidence_state: EvidenceState;
  score: number | null;
  band: string;
  confidence: Confidence;
  confidence_basis: Record<string, any>;
  rationale: string;
  strengths: string[];
  gaps: string[];
  missing_evidence: string[];
  anomaly_flags: string[];
  cv_strength: string;
  requirement_ids: string[];
  evidence: EvidenceRef[];
}

export interface DevelopmentArea {
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  competency_ids: string[];
  observed_problem: string;
  example_refs: string[];
  example_quote: string;
  why_it_matters: string;
  what_to_do: string;
  practice: string;
  measured_basis: string[];
}

export interface LearnedItem { text: string; refs: string[] }

export interface QuestionReview {
  exchange_id: string;
  ref: string;
  seq: number;
  section: string;
  question: string;
  competencies: string[];
  status: string;
  probes: number;
  why_asked: string;
  response_summary: Record<string, string>;
  dimensions: Record<string, { applicable?: boolean; rating?: number; note?: string }>;
  what_worked: string[];
  what_was_missing: string[];
  looking_for: string;
  better_direction: string;
  exposing_follow_up: string;
  evidence_status: string;
  importance: 'high' | 'normal';
  evidence_refs: string[];
}

export interface IIReport {
  version: string;
  header: {
    session_id: string; role_title: string; company: string; role_family: string; seniority: string;
    mode: string; difficulty: string; depth: string; duration_planned_min: number; duration_actual_s: number;
    ended_reason: string | null; date: string;
  };
  headline: {
    role_alignment: string;
    coverage: { tested: number; total: number };
    development_areas: number;
    assessment_confidence: AssessmentConfidence;
    confidence_reasons: string[];
  };
  executive_assessment: string;
  health: { category: string; assessment: string; score: number | null; tested: number; of: number; competency_ids: string[] }[];
  competencies: CompetencyAssessment[];
  role_alignment: {
    requirement_id: string; text: string; importance: string; cv_evidence: string;
    interview_evidence: string; assessment: string; competency_ids: string[];
  }[];
  strengths: { title: string; competency_ids: string[]; evidence_refs: string[]; why_it_matters: string }[];
  development_areas: DevelopmentArea[];
  interviewer_learned: {
    strong_signals?: LearnedItem[]; weak_signals?: LearnedItem[]; unproven_claims?: LearnedItem[];
    missing_evidence?: LearnedItem[]; potential_concerns?: LearnedItem[];
  };
  critical_moments: {
    type: 'strong_evidence' | 'gap' | 'contradiction'; exchange_ref?: string; question?: string; quote: string;
    note: string; competency_id?: string; evidence_ref?: string; status?: string;
  }[];
  cv_claims: { claim_id: string; text: string; status: string; exchange_refs: string[]; priority: number }[];
  functional_assessment: CompetencyAssessment[];
  behavioral_assessment: CompetencyAssessment[];
  communication: {
    assessment: CompetencyAssessment | null;
    metrics: { id: string; label: string; value: number }[];
    observations: DevelopmentArea[];
  };
  questions: QuestionReview[];
  coverage_map: {
    section: string; title: string; planned_s: number; actual_s: number; questions_asked: number;
    questions_planned: number; competencies_sufficient: number; competencies_total: number;
  }[];
  next_questions: { question: string; gap: string; refs: string[] }[];
  preparation_plan: {
    headline?: string;
    items?: { action: string; count: number; competency_ids: string[]; how: string }[];
    topics_to_revise?: string[];
    reattempt_competencies?: string[];
  };
  reattempt: { suggested_competencies: string[] };
  not_tested: { competency_id: string; name: string }[];
  transparency: { versions: Record<string, string>; rubric_hash: string; note: string };
  partial_sections: string[];
  progress?: IIProgressHistory;
}

export interface ReportResponse {
  status: 'ready' | 'partial' | 'pending' | 'processing' | 'failed';
  message?: string;
  report?: IIReport;
}

export interface IIProgressHistory {
  trajectories: {
    competency_id: string; name: string; comparable_points: number; latest_delta: number | null;
    points: { session_id: string; date: string; score: number | null; state: EvidenceState; confidence: Confidence;
              role_family: string; comparable: boolean }[];
  }[];
  deltas: { competency_id: string; name: string; previous: number; current: number; delta: number;
            previous_session_id: string }[];
  recurring: { category: string; label: string; occurrences: number; of_last: number; session_ids: string[];
               examples: string[] }[];
}

export interface InterviewConfigInput {
  mode: string;
  depth: 'standard' | 'deep' | 'extreme';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'grill';
  duration_minutes: number;
  focus_areas?: string[];
  company_name?: string;
  company_notes?: string;
  voice?: boolean;
}

/* ---------------------------------------------------------------- admin */
export interface AccessGrantRow {
  id: string; email: string; status: 'enabled' | 'disabled'; grant_type: string; note: string;
  granted_by: string; created_at: string; updated_at: string; expires_at: string | null; active: boolean;
}

export interface AdminOverview {
  users_total: number; users_active_7d: number; active_interviews: number; slot_sessions: number;
  completed_7d: number; sessions_7d_by_status: Record<string, number>; failure_rate_7d: number;
  ai_stages_24h: Record<string, { runs: number; errors: number; p50_ms: number | null; p95_ms: number | null;
                                  cost_usd: number; models: string[] }>;
  cost_today_usd: number; mode_usage_7d: Record<string, number>;
  top_questions_7d: { qid: string; text: string; count: number }[];
  evaluation_anomalies_7d: { session_id: string; competency_id: string; flags: string[] }[];
  drive_sync: { files: Record<string, number>; documents: Record<string, number> };
  versions: Record<string, string>; prompt_versions: Record<string, string>;
}

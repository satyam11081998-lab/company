// Prep Copilot v2 — isolated frontend types. Mirror services/copilot/schemas.py
// (backend). NOTHING here is shared with the case-solve / scorer types.

export interface CopilotDimension {
  key: string;
  label: string;
  max: number;
  what_good_looks_like?: string;
  anchors?: string[];
  red_flags?: string[];
}

export interface CopilotRubric {
  dimensions: CopilotDimension[];
  total: number;
}

export interface CopilotFramework {
  name: string;
  summary: string;
  why_it_matters?: string;
}

export interface CopilotScenario {
  title: string;
  prompt: string;
  focus?: string;
  numerical_ask?: string;
  difficulty?: string;
  solution_outline?: string; // present only in the debrief payload
}

export interface CopilotSource {
  title: string;
  url?: string;
  snippet?: string;
  confidence?: string;
}

export interface CopilotAssessment {
  what_they_test?: string[];
  numericals_expected?: boolean;
  formats?: string[];
  notes?: string;
}

export interface CopilotPack {
  role_key: string;
  company_key?: string | null;
  display_role: string;
  display_company?: string | null;
  rubric: CopilotRubric;
  frameworks: CopilotFramework[];
  assessment: CopilotAssessment;
  scenarios: CopilotScenario[];
  sources: CopilotSource[];
  confidence: 'high' | 'medium' | 'low' | string;
  version: number;
  status: string;
  notes?: string;
}

export interface CopilotDimensionFeedback {
  score: number;
  evidence: string;
  gap: string;
  to_improve: string;
}

export interface CopilotFeedback {
  score: number;
  breakdown: Record<string, number>;
  rubric: {
    role: string;
    company?: string | null;
    dimensions: { key: string; label: string; max: number }[];
  };
  dimension_feedback: Record<string, CopilotDimensionFeedback>;
  strengths: string[];
  improvements: string[];
  red_flags: string[];
  model_answer: string;
  summary: string;
  confidence: string;
}

export interface CopilotStatus {
  enabled: boolean;          // = available: can THIS viewer use it right now
  research_available: boolean;
  available?: boolean;
  preview?: boolean;         // owner/tester preview while not yet launched
  launched?: boolean;        // global flag on (live for every Pro user)
}

export type CopilotMessage = { role: 'candidate' | 'interviewer'; content: string };

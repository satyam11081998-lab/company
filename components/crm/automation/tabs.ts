/** Automation page tabs (shared by the server page and the client screen). */
export const TABS = [
  { key: 'workflow', label: 'Workflow rules', text: 'When something happens (create, edit, a field changes, a date arrives, a score moves), check conditions and act — now or later.' },
  { key: 'blueprint', label: 'Blueprints', text: 'A guided process on one picklist (e.g. deal stage). The field can only move through transition buttons, with required fields, notes and SLAs.' },
  { key: 'approval_process', label: 'Approvals', text: 'Records that match go to approvers (users, roles or the owner’s manager), stage by stage. Locked while waiting.' },
  { key: 'assignment_rule', label: 'Assignment', text: 'Who owns records that arrive from web forms, imports and the API. Several users = round robin.' },
  { key: 'scoring_rule', label: 'Scoring', text: 'Points for what a record is (criteria) and what it does (opens, clicks, form fills, survey answers).' },
  { key: 'rules', label: 'Validation & layout', text: 'Block saves that break a business rule; show or require fields only when they apply.' },
  { key: 'macro', label: 'Macros', text: 'One-click bundles a person runs on selected records (max 1 email, 3 tasks, 3 field updates).' },
  { key: 'cadence', label: 'Cadences', text: 'Timed follow-up sequences (email → task → call) that stop when the exit condition is met.' },
  { key: 'webhook', label: 'Webhooks', text: 'Signed HTTPS calls to other systems. Private and internal addresses are always refused.' },
  { key: 'activity', label: 'Activity', text: 'What automation did recently, scheduled jobs and webhook health.' },
] as const;

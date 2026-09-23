// Prep Copilot — the role/company-aware v2 experience (replaces the old
// consulting-only coach in the UI). The whole flow lives in the ISOLATED
// components/copilot + lib/copilot modules and talks only to the isolated
// /copilot/* backend; it shares no code with the case-solve flow or the scorer.
// The old coach backend (routes/coach.py) stays deployed but is no longer linked
// from the UI. Client component: Pro-gating + the flag check happen inside.
'use client';

import CopilotClient from '@/components/copilot/CopilotClient';

export default function CoachPage() {
  return <CopilotClient />;
}

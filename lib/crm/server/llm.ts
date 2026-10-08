/**
 * Optional generative AI (email drafts, Ask-CRM fallback). Used only when
 * OPENAI_API_KEY is set on the website; otherwise every caller has a
 * deterministic fallback. Data minimisation: callers pass only the few
 * fields a draft needs — never notes, emails, revenue or contact details.
 */
export function llmAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function llmComplete(system: string, user: string, opts: { maxTokens?: number; json?: boolean } = {}): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.CRM_LLM_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: opts.maxTokens ?? 500,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return j.choices?.[0]?.message?.content?.slice(0, 8000) ?? null;
  } catch {
    return null;
  }
}

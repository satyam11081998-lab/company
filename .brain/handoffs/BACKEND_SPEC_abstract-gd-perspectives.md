# BACKEND SPEC — abstract-gd-perspectives (consilio-backend, 2026-07-10)

Frontend (committed in abstract-gd-library) already renders an optional
`perspectives` field on Abstract GD briefs. Backend change to start emitting it:

## services/abstract_gd_generator.py
Add to the brief JSON schema (ADDITIVE — keep every existing key unchanged so
cached briefs in `abstract_briefs` keep rendering):

  "perspectives": [
    {
      "title": "The economist's view",          // 3–4 DISTINCT lenses, e.g.
                                                 // economist / sociologist /
                                                 // ethicist-philosopher /
                                                 // policy-pragmatist (vary by topic)
      "stance": "one-line standfirst, like an editorial subhead",
      "argument": "80–120 words in NEWSPAPER-EDITORIAL voice — a confident,
                   flowing argument (not bullets): claim → reasoning → concession
                   → clincher. Think Indian Express 'The Editorial Page' /
                   Economist leader tone.",
      "data_points": ["2–3 citable facts/figures with source+year, e.g.
                      'India's Gini coefficient ~0.35 (World Bank, 2023)'"]
    }
  ]

Prompt guidance to add: perspectives must genuinely DISAGREE or approach from
orthogonal angles (no paraphrases of each other); each must be usable verbatim
as a 30-second GD intervention; data points must be real, conservative, and
dated. Topics are timeless/abstract so prefer durable statistics.

- max_tokens for this call: 2000 → 3200 (the JSON grows ~40%; truncation =
  broken feature, same rule as the 0036 hardening).
- Cache: unchanged — upsert into abstract_briefs by topic_key (lower/trim/
  collapse-whitespace; the frontend mirrors this in lib/abstract-gd.ts
  topicKey()). Older cached briefs simply lack `perspectives` — fine.
- Optional backfill: none. Regenerate-on-demand only if owner asks (would
  re-bill each topic once).

## Gates
py_compile; generate one fresh topic → response JSON has 3–4 perspectives with
data_points; a PRE-EXISTING cached topic still returns 200 without the field;
frontend renders both correctly (perspectives section appears only for fresh).

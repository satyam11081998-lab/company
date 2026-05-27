import os
import re

file_path = r"C:\Users\satya\.gemini\antigravity\brain\36adf028-8b23-44a7-aec3-5a84ba57c2d0\PROJECT_BRAIN_MERGED.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Missing files block
content = re.sub(
    r"### Missing files \(referenced by code but not in repo\).*?- \*\*`vercel\.json`\*\* — frontend deploy config absent\. No `bom1` Mumbai region pin\.",
    r"### Missing files (referenced by code but not in repo)\n\n- **`vercel.json`** — frontend deploy config absent. No `bom1` Mumbai region pin.",
    content,
    flags=re.DOTALL
)

# 2. requirements.txt mentions
content = content.replace(
    "- `requirements.txt` (UTF-16 LE with BOM, partial)",
    "- `requirements.txt`"
)
content = content.replace(
    "- **`requirements.txt`** — saved as `Unicode text, UTF-16, little-endian text, with CRLF line terminators` instead of UTF-8. Will break pip installs on Linux/Render.",
    "- **`requirements.txt`** — standard pip dependencies."
)

# 3. Badge awarder section
content = re.sub(
    r"\*\*Badge auto-award after submission\*\*.*?Fresh deploy from repo will crash\.",
    r"**Badge auto-award after submission**\n- Display, catalog, DB tables, and `BadgePill` component all built.\n- `services/badge_awarder.py` (183 lines) implements 13 badge checks (first-case, five/fifteen/thirty-cases, all-types, streak-3/7/14/30, first-80/90, perfect-structure, perfect-quant) with idempotent `ON CONFLICT DO NOTHING` inserts.",
    content,
    flags=re.DOTALL
)

# 4. Payment ledger section
content = re.sub(
    r"\*\*Payment ledger\*\*.*?- \*\*`subscription_expires_at` is never set anywhere\.\*\*.*?(?=\*\*Analytics)",
    r"**Payment ledger**\n- Razorpay verify route updates `users.subscription_tier`, sets `subscription_started_at` and `subscription_expires_at` (30 days).\n- Inserts full payment record into `public.payments` table for audit trail.\n- `effectiveTier()` honors `subscription_expires_at`.\n\n",
    content,
    flags=re.DOTALL
)

# 5. Security/Deploy gaps
content = re.sub(r"\[SECURITY GAP — CRITICAL\].*?\[ANTIGRAVITY CORRECTION: file does exist, just needs committing to backend repo\.\]\*\*\n\n", "", content)
content = re.sub(r"\[SECURITY GAP — Medium\] \*\*`requirements\.txt` UTF-16 encoded with BOM\.\*\*.*?\n\n", "", content)
content = re.sub(r"\[SECURITY GAP — Low\] \*\*`payments` ledger not written\.\*\*.*?\n\n", "", content)
content = re.sub(r"\[SECURITY GAP — Low\] \*\*`subscription_expires_at` never set\.\*\*.*?\n\n", "", content)
content = re.sub(r"\[DEPLOY ISSUE — Blocking\] \*\*`requirements\.txt` UTF-16 BOM\.\*\*.*?\n", "", content)
content = re.sub(r"\[DEPLOY ISSUE — Blocking\] \*\*`services/badge_awarder\.py` missing\.\*\*.*?\n", "", content)
content = re.sub(r"\[DEPLOY ISSUE — Minor\] \*\*No `__init__\.py`\*\*.*?\n", "", content)

# 6. Partially Built
content = re.sub(r"- ⚠️ \*\*Badge auto-award\*\*.*?git push\.\*\*\n", "", content)
content = re.sub(r"- ⚠️ \*\*`requirements\.txt` UTF-16 BOM\*\*.*?\n", "", content)
content = re.sub(r"- ⚠️ \*\*`payments` table writes\*\*.*?\n", "", content)
content = re.sub(r"- ⚠️ \*\*Subscription expiry dates\*\*.*?\n", "", content)
content = re.sub(r"- ⚠️ \*\*`__init__\.py`\*\* missing.*?\n", "", content)
content = re.sub(r"\*\*Fix the two backend blockers.*?\*\*\n\n", "", content)
content = re.sub(r"### 18\.4 Exact Next Step\n\n---\n", "---\n", content)

# 7. Code That Looks Incomplete or Broken
content = re.sub(r"1\. \*\*`backend/services/badge_awarder\.py` NOT IN BACKEND REPO\*\*.*?\n", "", content)
content = re.sub(r"2\. \*\*`backend/requirements\.txt` UTF-16 BOM\*\*.*?\n", "", content)
content = re.sub(r"3\. \*\*`backend/routes/__init__\.py` missing\*\*.*?\n", "", content)
content = re.sub(r"4\. \*\*`backend/prompts/__init__\.py` missing\*\*.*?\n", "", content)
content = re.sub(r"5\. \*\*`subscription_expires_at` never set\*\*.*?\n", "", content)
content = re.sub(r"6\. \*\*`payments` table never inserted\*\*.*?\n", "", content)
content = re.sub(r"### 19\.2 Code That Looks Incomplete or Broken\n\n### 19\.3", "### 19.3", content)
content = re.sub(r"- \*\*`badge_awarder\.py` repo divergence\*\*.*?\n", "", content)

# 8. Miscellaneous
content = content.replace(
    "- **[ANTIGRAVITY UPDATE]** The `badge_awarder.py` question is resolved — file exists at `consilio/backend/services/badge_awarder.py` and just needs committing to the backend repo.",
    ""
)
content = re.sub(r"1\. \*\*`badge_awarder\.py` not in backend repo\*\*.*?\n", "", content)
content = re.sub(r"4\. \*\*`subscription_expires_at` is read by `effectiveTier\(\)` but never written by the verify route\*\*.*?\n", "", content)

# Biggest single risk
content = re.sub(
    r"### 5\. Biggest single risk to the project right now\n\n\*\*Backend has a repo divergence that prevents fresh deploys\.\*\*.*?push\.\*\*\n",
    r"### 5. Biggest single risk to the project right now\n\n**Data Migration / Curriculum structure.** Adding a \"comparison to model solution\" feature can't just attach to the `cases` table for curriculum cases without migrating them to the database first, or building a static reference linker.",
    content,
    flags=re.DOTALL
)

# Appendix cleanup
content = re.sub(r"- `badge_awarder\.py` missing from backend git repo.*?\n", "", content)
content = re.sub(r"- `requirements\.txt` UTF-16 BOM encoding deploy bug\n", "", content)
content = re.sub(r"- \*\*badge_awarder\.py\*\*: RESOLVED.*?\n", "", content)
content = content.replace("- **[ANTIGRAVITY ADDITION]** [CONFLICT]: `badge_awarder.py` exists in frontend workspace (`consilio/backend/services/`) but NOT in backend git repo (`consilio-backend/services/`) — repo divergence, needs commit to backend", "")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Update complete")

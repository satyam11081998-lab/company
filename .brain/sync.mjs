#!/usr/bin/env node
/*
 * .brain/sync.mjs — regenerate STATE.md from git + LEDGER.md
 *
 * Run by Antigravity (the worker) after every merge to main, or wire it as a
 * git hook:  .git/hooks/post-merge  ->  node .brain/sync.mjs
 *
 * Dependency-free. Works on Windows (git-bash / PowerShell) and *nix.
 * It is deterministic: brains never hand-edit the AUTO section, this rebuilds it.
 *
 * 2026-07-17 upgrade (Cowork brain):
 *   1. Everything at/below the HAND marker in STATE.md is PRESERVED verbatim
 *      (open blockers, feature notes). Previously a run wiped hand content.
 *      If no marker exists, behaves exactly as before (full regenerate).
 *   2. Backend repo commits included (../consilio-backend, override with
 *      BRAIN_BACKEND_PATH). The product is two repos; STATE showed only one.
 *   3. All git reads use --no-optional-locks so a sync can never leave a stale
 *      .git/index.lock behind (this bit us on 2026-07-17).
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const BACKEND = process.env.BRAIN_BACKEND_PATH
  ? resolve(process.env.BRAIN_BACKEND_PATH)
  : resolve(HERE, "..", "..", "consilio-backend");

const MARKER = "<!-- HAND-MAINTAINED BELOW THIS LINE — sync.mjs preserves everything under this marker -->";

const git = (cmd, cwd = HERE) => {
  try { return execSync(`git --no-optional-locks ${cmd}`, { cwd, encoding: "utf8" }).trim(); }
  catch { return ""; }
};

const branch   = git("rev-parse --abbrev-ref HEAD") || "main";
const commits  = git('log -5 --pretty=format:"- %h %s (%an, %ad)" --date=short')
                  .split("\n").filter(Boolean);
const beBranch = existsSync(BACKEND) ? (git("rev-parse --abbrev-ref HEAD", BACKEND) || "main") : "";
const beCommits = existsSync(BACKEND)
  ? git('log -5 --pretty=format:"- %h %s (%an, %ad)" --date=short', BACKEND).split("\n").filter(Boolean)
  : ["- (backend repo not found — set BRAIN_BACKEND_PATH)"];
const featBr   = git("branch -r --no-merged main")
                  .split("\n").map(s => s.trim()).filter(b => b && b.includes("feat/"));

// Pull the per-feature mirror straight out of LEDGER.md so the two never disagree.
let ledgerRows = "(LEDGER.md table not found)";
const ledgerPath = join(HERE, "LEDGER.md");
if (existsSync(ledgerPath)) {
  const lines = readFileSync(ledgerPath, "utf8").split("\n");
  const header = lines.findIndex(l => l.startsWith("| Feature"));
  if (header !== -1) {
    const rows = [];
    for (let i = header; i < lines.length; i++) {
      if (lines[i].startsWith("|")) rows.push(lines[i]); else if (rows.length) break;
    }
    // keep only Feature | Owner | Branch | Status (cols 1-4) for the compact mirror
    ledgerRows = rows.map(r => {
      const c = r.split("|").map(s => s.trim());
      return `| ${c[1]} | ${c[2]} | ${c[3]} | ${c[4]} |`;
    }).join("\n");
  }
}

// First entry header in CHANGELOG = "last landed"
let lastLanded = "(none)";
const clPath = join(HERE, "CHANGELOG.md");
if (existsSync(clPath)) {
  const m = readFileSync(clPath, "utf8").match(/^## \d{4}.+$/m);
  if (m) lastLanded = m[0].replace(/^##\s*/, "");
}

const now = new Date().toISOString().slice(0, 16).replace("T", " ");

const auto = `<!-- AUTO-GENERATED above the marker by .brain/sync.mjs — do not hand-edit this section. Last run: ${now} -->
# STATE — what is true right now

**Repo:** mece (frontend: Next.js 14 / Supabase / Razorpay) + backend (FastAPI)
**Branch:** ${branch} (frontend)${beBranch ? ` / ${beBranch} (backend)` : ""}
**Last landed:** ${lastLanded}
**Last sync:** ${now} UTC

## Last 5 commits — frontend
${commits.length ? commits.join("\n") : "- (no commits found)"}

## Last 5 commits — backend
${beCommits.join("\n")}

## Open feature branches (not merged into main)
${featBr.length ? featBr.map(b => `- ${b}`).join("\n") : "- (none)"}

## Per-feature status (mirror of LEDGER.md)
${ledgerRows}

`;

// Preserve everything at/below the hand marker (blockers, notes). No marker -> legacy behavior.
let hand = `${MARKER}

## Reminder for every brain
Read the top of CHANGELOG.md next. If a \`BREAKING\` entry lists your feature in
\`affects:\`, re-read the changed CONTRACTS.md surface before writing anything.
`;
const statePath = join(HERE, "STATE.md");
if (existsSync(statePath)) {
  const cur = readFileSync(statePath, "utf8");
  const idx = cur.indexOf(MARKER);
  if (idx !== -1) hand = cur.slice(idx);
}

writeFileSync(statePath, auto + hand);
console.log("STATE.md regenerated:", now, "(hand section preserved:", hand.length, "chars)");

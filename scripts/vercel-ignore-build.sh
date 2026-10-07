#!/bin/bash
# Vercel "Ignored Build Step" (vercel.json → ignoreCommand), 2026-10-07.
#   exit 0 → Vercel SKIPS this deployment
#   exit 1 → Vercel BUILDS it (the normal path)
#
# Why: every production deploy empties Vercel's caches, and each cached page
# (home, Casebook, share images…) is then rendered again on its first visit.
# Commits that only touch notes — .brain/ (sync.mjs, handoffs), docs/, or a
# Markdown file at the repo root — change nothing on the website, so they
# should not cost a deploy.
#
# Safety: it skips ONLY when it can prove that every file changed since the
# last successful deployment of this branch is a note. Any doubt — no previous
# SHA, history too shallow, git error, an empty diff — builds as usual.
set -u
prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$prev" ]; then
  echo "No previous deployment SHA for this branch - building."
  exit 1
fi
if ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
  echo "Previous deployment commit ${prev} is not in the clone - building."
  exit 1
fi
if ! changed="$(git diff --name-only "$prev" HEAD)"; then
  echo "git diff failed - building."
  exit 1
fi
if [ -z "$changed" ]; then
  echo "No file changes since ${prev} - building."
  exit 1
fi
code="$(printf '%s\n' "$changed" | grep -vE '^(\.brain/|docs/)|^[^/]+\.md$' || true)"
if [ -z "$code" ]; then
  echo "Only notes changed since ${prev} - skipping this deploy:"
  printf '%s\n' "$changed"
  exit 0
fi
echo "Website files changed since ${prev} - building."
exit 1

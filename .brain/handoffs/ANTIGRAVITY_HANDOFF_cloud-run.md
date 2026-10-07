# ANTIGRAVITY_HANDOFF — cloud-run (test deployment)

**Author:** Claude (cloud session). **Date:** 2026-10-08. **Feature:** run the frontend on Google
Cloud Run at Google's own `*.run.app` address for testing; mece.in stays on Vercel. Backend stays
on Render. **Branch:** `feat/cloud-run` (off main @ 81e79e7). Owner's plan: option 3 after the
Vercel CPU rounds; test on a temporary address first, move the domain later.

```
touches:  frontend (branch feat/cloud-run only)
            Dockerfile, .dockerignore, cloudbuild.yaml (NEW)
            scripts/cloudrun/env-json.cjs, start.cjs, build.cjs, dotenv-to-json.cjs (NEW)
            docs/cloud-run.md (NEW: setup guide, costs, cutover decisions)
            app/layout.tsx (<Analytics /> only when process.env.VERCEL — unchanged on Vercel)
            next.config.js (X-Robots-Tag: noindex, nofollow on host *.run.app only)
            .gitignore (*.env.json, frontend-env.json)
          backend   none (Render env CORS_ALLOW_ORIGIN_REGEX gains the run.app host — config only)
breaking: no. C1–C9 untouched. Nothing changes on mece.in / Vercel production.
affects:  Deploy/infra only. Vercel builds a preview for the branch (no production deploy).
```

## Design
- Image: deps (yarn --frozen-lockfile, same versions as the npm lockfile) → builder (`next build`
  with the production settings from a BuildKit secret mount) → runner (standalone output, user
  `node`, PORT 8080, UTC).
- Settings: ONE Secret Manager secret `mece-frontend-env` = JSON object of the Vercel env vars
  (converter drops VERCEL*, TURBO_*, NX_*, NODE_ENV, PORT, HOSTNAME; no `$VAR` expansion).
  Build: secret → /builder/home (outside the context) → `docker build --secret`. Runtime: mounted
  at /secrets/frontend-env.json; `cloudrun/start.cjs` loads it (Cloud Run env vars win), exits 1
  if missing so a bad revision never takes traffic.
- Service: asia-south1, 1 vCPU, 1 GiB, concurrency 80, min 0, **max 1** (one ISR cache; cost
  ceiling), CPU boost, request-based billing, dedicated runtime SA (secret accessor only).
  Builder SA: run.admin, artifactregistry.writer, logging.logWriter, secret accessor,
  serviceAccountUser on the runtime SA.

## Gates (2026-10-08)
1. `npx tsc --noEmit` 0. `next build` exit 0 (host) and inside the image.
2. The real Dockerfile built end to end in the sandbox (Docker Hub is blocked there, so the base
   was a stand-in image with the same Node 22 / yarn 1.22.22 and the `node` user).
   yarn install --frozen-lockfile OK; versions identical to the npm lockfile (next 14.2.3,
   react 18.3.1, supabase-js 2.106.0, ssr 0.10.3).
3. Secret scan of every layer of the final image: public anon key present (2 layers, as in the
   browser bundle) — server secrets (CRON_SECRET, a password with `$`, a multi-line private key)
   present in 0 layers. `docker history` shows no secret.
4. Container as Cloud Run runs it (PORT, non-root, secret file mounted read-only): starts in
   ~0.5 s; without the file exits 1 with a clear message. Pages, prerendered Casebook (HIT),
   share cards (static + /og dynamic), sitemap, robots, /us → /, static chunks (immutable
   cache), public files, /api/track, signed-in dashboard: all as with `next start`. ISR refresh
   (`/api/revalidate/home` → MISS → HIT) writes to disk as `node`, no EACCES. ~200 MiB RSS.
   `X-Robots-Tag: noindex, nofollow` on run.app host only. No Vercel Analytics request.
5. Browser journeys against the container: guest-results 31/31 and case-return 23/23 (with
   the browser in UTC; see finding below).
6. Converter: quotes, `export`, comments, `\n` in keys, `$` kept literally, Vercel vars dropped,
   output written as UTF-8 (PowerShell `>` would write UTF-16).

## Finding (pre-existing, not caused by this)
When the browser's time zone differs from the server's (server UTC — as on Vercel — and visitors
in India), React reports hydration errors #418/#422 on /cases, /dashboard and onboarding pages:
some text is rendered from the local date/time. React recovers by re-rendering on the client
(extra client work, possible flicker). Seen only when time zones differ; with the browser in UTC
there are 0 errors. Likely already happening on mece.in today — worth a separate fix.

## Not covered (needs the real project)
Cloud Build itself, IAM, the GitHub trigger, Google login and Supabase redirects on the run.app
host, real Supabase/Render traffic, cold-start time on Cloud Run, the real cost. See the test
checklist in docs/cloud-run.md.

## Rollback
Delete the Cloud Run service and the trigger. The branch never reached main or Vercel production.

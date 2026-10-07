# MECE frontend on Google Cloud Run

**Status (2026-10-08): test deployment only.** mece.in stays on Vercel. The Cloud Run copy runs at
Google's own `…run.app` address so everything can be tried before the domain moves.
Branch: `feat/cloud-run`. Backend stays on Render; Supabase is unchanged.

## What runs where

| Piece | Where |
|---|---|
| Next.js server (standalone build, in a container) | Cloud Run service `mece-web`, region `asia-south1` (Mumbai), 0 → 1 instance |
| Container images | Artifact Registry repo `mece` (cleanup keeps the 3 newest) |
| Builds | Cloud Build trigger on pushes to `feat/cloud-run` (`cloudbuild.yaml`) |
| All settings and secrets (the Vercel env vars) | ONE Secret Manager secret `mece-frontend-env`, a JSON object |

Files: `Dockerfile`, `.dockerignore`, `cloudbuild.yaml`, `scripts/cloudrun/*`.
- The build reads the secret through a BuildKit secret mount; it is never in an image layer
  (checked: the image contains the public `NEXT_PUBLIC_*` values, as the browser bundle does on
  Vercel, and none of the server secrets).
- The service gets the secret as a file at `/secrets/frontend-env.json`; `cloudrun/start.cjs`
  loads it and starts the server. No file → the container exits and the previous revision keeps
  serving.
- The server runs as the non-root `node` user, in UTC (as on Vercel).
- On `*.run.app` every response carries `X-Robots-Tag: noindex, nofollow`, so the test copy is
  never indexed. Vercel Web Analytics renders only on Vercel.

## Cost (Google's pricing pages, checked 2026-10-08)

- **Cloud Run, free every month per billing account:** 180,000 vCPU-seconds, 360,000 GiB-seconds,
  2 million requests. Billing is per request time: you pay only while requests are being handled
  (including time spent waiting on Supabase), rounded up to 100 ms; concurrent requests share the
  same seconds; an idle instance costs nothing. Beyond the free tier: $0.000024 per vCPU-second,
  $0.0000025 per GiB-second, $0.40 per million requests. `asia-south1` is a Tier 1 (cheapest)
  region.
- **Data sent to visitors is NOT free:** about **$0.12 per GiB** from Mumbai to Asia after the
  first GiB. On Vercel this was part of the plan. Every page, JS file and image now leaves from
  the container. To estimate: Vercel → Usage → *Fast Data Transfer* (GB per month) × $0.12.
  Putting Cloudflare in front at cutover would cache the static files and cut most of this.
- **Cloud Build:** 2,500 build-minutes/month free (e2-standard-2). One build ≈ 6–10 minutes.
- **Artifact Registry:** 0.5 GB free storage; the cleanup policy keeps 3 images.
- **Secret Manager:** one secret; up to 6 active versions are free (disable old versions).
- **Hard ceiling:** at most 1 instance (`_MAX_INSTANCES`). Worst case if it were busy 24/7 is
  about $63/month after the free tier, so set the budget alert in step 2. At today's traffic it should sit inside the free
  CPU allowance, but that can only be confirmed from the billing report after real traffic.

## One-time setup (about 30 minutes)

Do steps 1–2 in the Google Cloud console, step 3 on your PC, the rest in **Cloud Shell**
(the `>_` button at the top of the console — a terminal in the browser with `gcloud` ready).

### 1. Project and billing
console.cloud.google.com → project picker → **New project** → name `mece-web` → Create.
Note the **Project ID**. Link a billing account when asked (Cloud Run needs one even inside the
free tier).

### 2. Budget alert
Billing → **Budgets & alerts** → Create budget → scope: project `mece-web` → amount ₹500 (or
$5) → alerts at 50 %, 90 %, 100 % → email. (A budget warns; it does not stop anything.)

### 3. The settings file (on your PC, in `D:\dev\mece\consilio`)
You need the **production** environment variables — the ones Vercel uses. Either:

```powershell
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env pull ..\_to_delete\vercel-prod.env --environment=production --yes
```
or use your own copy of the production values. Then convert it:
```powershell
node scripts\cloudrun\dotenv-to-json.cjs ..\_to_delete\vercel-prod.env ..\_to_delete\frontend-env.json
```
It prints only the variable **names**. Fix anything under "CHECK BEFORE UPLOADING" (Vercel
"Sensitive" variables come back empty from `env pull` — type those values in yourself). Keep
`NEXT_PUBLIC_SITE_URL=https://www.mece.in` so canonical links keep pointing at mece.in.

### 4. Turn on the services, create the image store and two service accounts (Cloud Shell)
```bash
gcloud config set project YOUR_PROJECT_ID
P=$(gcloud config get-value project)

gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create mece --repository-format=docker \
  --location=asia-south1 --description="MECE frontend images"
cat > cleanup.json <<'EOF'
[
  {"name": "delete-old", "action": {"type": "Delete"}, "condition": {"tagState": "any", "olderThan": "7d"}},
  {"name": "keep-3", "action": {"type": "Keep"}, "mostRecentVersions": {"keepCount": 3}}
]
EOF
gcloud artifacts repositories set-cleanup-policies mece --location=asia-south1 \
  --policy=cleanup.json --no-dry-run

gcloud iam service-accounts create mece-web-run --display-name="MECE web (runtime)"
gcloud iam service-accounts create mece-builder --display-name="MECE web (Cloud Build)"
```

### 5. Store the settings as a secret
Cloud Shell → `⋮` → **Upload** → `frontend-env.json` (from `D:\dev\mece\_to_delete`), then:
```bash
gcloud secrets create mece-frontend-env --replication-policy=automatic --data-file=frontend-env.json
rm frontend-env.json
```
Then delete `vercel-prod.env` and `frontend-env.json` from `D:\dev\mece\_to_delete` — they hold
every secret.

### 6. Permissions (least privilege)
```bash
P=$(gcloud config get-value project)
RUN_SA=mece-web-run@$P.iam.gserviceaccount.com
BUILD_SA=mece-builder@$P.iam.gserviceaccount.com

# runtime: may read the one secret, nothing else
gcloud secrets add-iam-policy-binding mece-frontend-env --member=serviceAccount:$RUN_SA \
  --role=roles/secretmanager.secretAccessor
# builder: read the secret, push images, deploy the service as the runtime account, write logs
gcloud secrets add-iam-policy-binding mece-frontend-env --member=serviceAccount:$BUILD_SA \
  --role=roles/secretmanager.secretAccessor
for r in roles/run.admin roles/artifactregistry.writer roles/logging.logWriter; do
  gcloud projects add-iam-policy-binding $P --member=serviceAccount:$BUILD_SA --role=$r --condition=None
done
gcloud iam service-accounts add-iam-policy-binding $RUN_SA \
  --member=serviceAccount:$BUILD_SA --role=roles/iam.serviceAccountUser
```

### 7. Connect GitHub and create the build trigger (console)
Cloud Build → **Triggers** → region **global** → **Connect repository** → *GitHub (Cloud Build
GitHub App)* → sign in → install the app on **satyam11081998-lab/company** only → select it →
Connect. Then **Create trigger**:
- Name `mece-web-test`, region global
- Event: *Push to a branch* — repository `satyam11081998-lab/company`, branch `^feat/cloud-run$`
- Ignored files (one per line): `.brain/**`, `docs/**`, `*.md` (notes-only pushes don't build — same rule as Vercel)
- Configuration: *Cloud Build configuration file*, location *Repository*, `cloudbuild.yaml`
- Service account: `mece-builder@YOUR_PROJECT_ID.iam.gserviceaccount.com`
- Create → **Run** (branch `feat/cloud-run`). Watch it under *History* (6–10 minutes).

### 8. Let the test address sign in and reach the backend
Cloud Run → `mece-web` → copy the URL (e.g. `https://mece-web-123456789012.asia-south1.run.app`).
- **Supabase** → Authentication → URL Configuration → Redirect URLs → add
  `https://<that host>/auth/callback**`
- **Render** (backend) → Environment → set `CORS_ALLOW_ORIGIN_REGEX` to
  `https://([a-z0-9-]+-consilioo\.vercel\.app|<that host with dots as \.>)`
  e.g. `https://([a-z0-9-]+-consilioo\.vercel\.app|mece-web-123456789012\.asia-south1\.run\.app)`
  (keeps the Vercel previews working; production origins are fixed in `main.py`).
- **Cloudflare Turnstile** (only if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set): add the host to the
  widget's hostnames, or sign-up/login will fail there.

## Test checklist (on the run.app address, side by side with mece.in)
Home; Casebook page; MECE framework; Practice (logged out and in); log in with email and with
Google; solve a case (chat replies, Submit → results); guest flow (solve logged out → sign up →
onboarding → results); dashboard; leaderboard; a share card (`/og?title=Test`); `/sitemap.xml`;
`/robots.txt`. Expect: same pages and behaviour; `X-Robots-Tag: noindex` on every response; the
first page after ~15 idle minutes takes a few seconds (instance starting). Don't test real
payments here — Razorpay webhooks still go to mece.in.

## Changing a setting later
Secret Manager → `mece-frontend-env` → **New version** (upload a new JSON) → disable the old
version → Cloud Build → Triggers → **Run** (the build and the service both read the latest
version).

## Turning it off
```bash
gcloud run services delete mece-web --region=asia-south1
```
and disable the trigger. Nothing on mece.in changes.

## Cutover — NOT done yet; decide before moving the domain
1. **Domain.** Cloud Run's built-in domain mapping is not offered in `asia-south1`. Firebase
   Hosting cannot be put in front: it strips every cookie except `__session`, and login uses
   Supabase's cookies. Options: Cloudflare in front of the run.app address (free plan; also
   caches static files, which cuts the data-transfer cost — check host-header support when we
   do it); Google's external load balancer (~$18+/month); or move the service to Singapore
   (`asia-southeast1`, has domain mapping in preview, Tier 2 price, farther from Supabase).
2. **Visitor location.** Session records read city/country from Vercel's `x-vercel-ip-*` headers;
   Cloud Run sends none. Cloudflare's location headers can replace them (small code change).
3. **Crons.** The Vercel cron for `/api/cron/refresh` is a redundant kick; GitHub Actions already
   runs the same jobs. Add Cloud Scheduler only if wanted (3 jobs free).
4. **One instance = one page cache.** With more than one instance, `/api/revalidate/home` would
   refresh only one of them. Keep `_MAX_INSTANCES=1` unless that changes.
5. Switch the trigger to `^main$`, merge `feat/cloud-run`, then move DNS. Keep Vercel until
   mece.in has served from Cloud Run for a few days.

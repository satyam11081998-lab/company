# MECE frontend for Google Cloud Run (2026-10-08). Guide: docs/cloud-run.md.
#
# Built by cloudbuild.yaml. Three stages:
#   deps    — yarn install from the lockfile (same versions Vercel installs)
#   builder — `next build` with the production settings, read from a BuildKit
#             secret mount (id=frontend_env). The secret exists only while that
#             RUN executes and is never written into a layer.
#   runner  — Next.js standalone output only, run as the non-root `node` user.
# Vercel ignores this file.

ARG NODE_IMAGE=node:22-bookworm-slim

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000 && yarn cache clean

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=frontend_env \
    node scripts/cloudrun/build.cjs /run/secrets/frontend_env

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
# Next.js standalone server + its traced node_modules, the browser bundles and
# public/ (on Vercel these two are served by the CDN; here, by the server).
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/scripts/cloudrun/start.cjs /app/scripts/cloudrun/env-json.cjs ./cloudrun/
USER node
EXPOSE 8080
CMD ["node", "cloudrun/start.cjs"]

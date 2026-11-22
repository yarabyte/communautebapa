#!/bin/sh
# Build Next.js sans la vraie DB / OAuth (Coolify injecte sinon les secrets dans le Dockerfile).
# Important : lib/db.ts et auth.config.ts lisent process.env['…'] au runtime pour
# ne PAS garder ces placeholders factices après le build.
set -e
cd /app

export DOCKER_BUILD=1
export DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
export AUTH_SECRET="build-only-placeholder-not-for-runtime"
export AUTH_URL="${NEXT_PUBLIC_SITE_URL:-https://communaute.bapa-officiel.com}"
export NEXT_TELEMETRY_DISABLED=1

# Annule les secrets OAuth injectés par Coolify en ARG/ENV de stage
unset AUTH_GOOGLE_ID AUTH_GOOGLE_SECRET AUTH_GOOGLE_ENABLED || true
unset AUTH_APPLE_ID AUTH_APPLE_SECRET AUTH_APPLE_ENABLED || true
export AUTH_GOOGLE_ID=""
export AUTH_GOOGLE_SECRET=""
export AUTH_APPLE_ID=""
export AUTH_APPLE_SECRET=""

echo "docker-build-app: DOCKER_BUILD=$DOCKER_BUILD DATABASE_URL=dummy OAuth=off (runtime env via brackets)"
npm run build

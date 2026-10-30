#!/usr/bin/env bash
# Déploiement sur le VPS Contabo (à lancer sur le serveur, en tant qu'utilisateur « deploy »).
# Usage : ./deploy/deploy.sh [branche]
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="/var/www/communaute-bapa"
RELEASE="$APP_DIR/releases/$(date +%Y%m%d%H%M%S)"
REPO_URL="${REPO_URL:?Définir REPO_URL (dépôt git)}"

mkdir -p "$APP_DIR/releases" "$APP_DIR/shared"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$RELEASE"
cd "$RELEASE"

ln -sf "$APP_DIR/shared/.env" .env

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

# Le serveur standalone n'embarque ni /public ni les assets statiques.
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
ln -sf "$APP_DIR/shared/.env" .next/standalone/.env

ln -sfn "$RELEASE" "$APP_DIR/current"
pm2 startOrReload "$RELEASE/ecosystem.config.cjs" --update-env
pm2 save

# Conserver les 5 dernières versions
ls -1dt "$APP_DIR"/releases/* | tail -n +6 | xargs -r rm -rf

echo "Déployé : $RELEASE"

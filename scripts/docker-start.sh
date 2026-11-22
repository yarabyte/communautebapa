#!/bin/sh
set -e
cd /app

echo "Starting Communauté Bapa (PORT=${PORT:-3000})…"

if [ -n "$DATABASE_URL" ]; then
  echo "Prisma migrate deploy…"
  if node node_modules/prisma/build/index.js migrate deploy; then
    echo "Migrations OK"
  else
    echo "WARNING: migrate deploy a échoué — démarrage quand même (vérifier DATABASE_URL / logs)."
  fi
else
  echo "WARNING: DATABASE_URL manquant"
fi

exec node server.js

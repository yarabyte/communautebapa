#!/bin/sh
set -e
cd /app

if [ -n "$DATABASE_URL" ]; then
  echo "Prisma migrate deploy…"
  node node_modules/prisma/build/index.js migrate deploy
else
  echo "DATABASE_URL manquant — skip migrate"
fi

exec node server.js

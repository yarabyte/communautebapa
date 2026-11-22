#!/bin/sh
set -e
cd /app

echo "Starting Communauté Bapa (PORT=${PORT:-3000})…"

if [ -n "$DATABASE_URL" ]; then
  echo "Prisma migrate deploy…"
  if node node_modules/prisma/build/index.js migrate deploy; then
    echo "Migrations OK"
  else
    echo "WARNING: migrate deploy a échoué — démarrage quand même."
  fi

  # Garantit un SUPER_ADMIN (email/mdp seed) même sans seed complet
  if [ -f node_modules/tsx/dist/cli.mjs ] || [ -f node_modules/tsx/dist/cli.js ]; then
    echo "Ensure admin…"
    node --import tsx scripts/ensure-admin.ts 2>/dev/null \
      || node node_modules/tsx/dist/cli.mjs scripts/ensure-admin.ts 2>/dev/null \
      || echo "WARNING: ensure-admin skip (tsx indisponible)"
  else
    # Fallback JS minimal sans tsx : hash via node + prisma CLI raw not easy
    echo "Ensure admin via compiled path…"
    node -e "
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@bapa-officiel.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'AdminBapa2026!';
  const passwordHash = await hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE', emailVerified: existing.emailVerified || new Date() },
    });
    console.log('Admin mis à jour:', email);
  } else {
    await prisma.user.create({
      data: {
        email,
        phone: '+237600000001',
        passwordHash,
        emailVerified: new Date(),
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        provider: 'EMAIL',
        profile: { create: { firstName: 'Arnaud', lastName: 'Kamga', country: 'Cameroun', city: 'Yaoundé', profession: 'Administrateur', showInDirectory: true, onboardedAt: new Date() } },
      },
    });
    console.log('Admin créé:', email);
  }
  await prisma.\$disconnect();
})().catch((e) => { console.error(e); process.exit(0); });
"
  fi
else
  echo "WARNING: DATABASE_URL manquant"
fi

exec node server.js

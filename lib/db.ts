import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Accès dynamique (brackets) pour empêcher Next.js d'inliner la valeur
 * présente au `docker build` (Coolify / docker-build-app.sh utilise une DB factice).
 */
function runtimeDatabaseUrl() {
  return process.env["DATABASE_URL"]
}

function createPrismaClient() {
  const url = runtimeDatabaseUrl()
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

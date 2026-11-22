import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Diagnostic runtime (pas de secrets) — utile après un deploy Coolify. */
export async function GET() {
  const hasDatabaseUrl = Boolean(process.env["DATABASE_URL"])
  const hasAuthSecret = Boolean(process.env["AUTH_SECRET"])
  const hasAuthUrl = Boolean(process.env["AUTH_URL"] || process.env["NEXT_PUBLIC_SITE_URL"])

  let db: "ok" | "error" = "error"
  let dbError: string | undefined
  let adminExists = false

  try {
    await prisma.$queryRaw`SELECT 1`
    db = "ok"
    const adminEmail = (process.env["SEED_ADMIN_EMAIL"] || "admin@bapa-officiel.com").toLowerCase()
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    })
    adminExists = Boolean(admin)
  } catch (error) {
    dbError = error instanceof Error ? error.message : "unknown"
  }

  const ok = hasDatabaseUrl && hasAuthSecret && db === "ok"
  return NextResponse.json(
    {
      ok,
      env: { hasDatabaseUrl, hasAuthSecret, hasAuthUrl },
      db,
      adminExists,
      ...(dbError ? { dbError } : {}),
    },
    { status: ok ? 200 : 503 },
  )
}

import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notifyTempPassword } from "@/lib/notifications"
import { generateTempPassword, hashPassword } from "@/lib/password"

const createSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  quartierId: z.string().optional().nullable(),
  role: z.enum(["MEMBER", "ASSOCIATION_ADMIN", "TREASURER", "SUPER_ADMIN"]).default("MEMBER"),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]).default("ACTIVE"),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès réservé au super administrateur." }, { status: 403 })
  }

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
  }

  const { firstName, lastName, role, status } = parsed.data
  const email = parsed.data.email.toLowerCase().trim()
  const phone = parsed.data.phone?.replace(/\s+/g, " ").trim() || null
  const quartierId = parsed.data.quartierId || null

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
  })
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email ou ce téléphone." }, { status: 409 })
  }

  if (quartierId) {
    const quartier = await prisma.quartier.findUnique({ where: { id: quartierId } })
    if (!quartier) {
      return NextResponse.json({ error: "Quartier introuvable." }, { status: 400 })
    }
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role,
      status,
      provider: "EMAIL",
      profile: {
        create: {
          firstName,
          lastName,
          quartierId,
          showInDirectory: status === "ACTIVE",
        },
      },
    },
    include: { profile: true },
  })

  await notifyTempPassword({ firstName, lastName, email, phone }, tempPassword)

  return NextResponse.json({
    ok: true,
    userId: user.id,
    status: user.status,
    role: user.role,
  })
}

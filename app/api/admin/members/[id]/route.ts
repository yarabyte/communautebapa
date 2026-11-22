import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notifyAccountValidated } from "@/lib/notifications"

const patchSchema = z.object({
  role: z.enum(["MEMBER", "ASSOCIATION_ADMIN", "TREASURER", "SUPER_ADMIN"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]).optional(),
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  quartierId: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
})

type Params = { params: Promise<{ id: string }> }

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") return null
  return session
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireSuperAdmin()
  if (!session) {
    return NextResponse.json({ error: "Accès réservé au super administrateur." }, { status: 403 })
  }

  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Membre introuvable." }, { status: 404 })
  }

  if (id === session.user.id && parsed.data.role && parsed.data.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Vous ne pouvez pas retirer votre propre rôle super administrateur." }, { status: 400 })
  }
  if (id === session.user.id && parsed.data.status && parsed.data.status !== "ACTIVE") {
    return NextResponse.json({ error: "Vous ne pouvez pas suspendre ou désactiver votre propre compte." }, { status: 400 })
  }

  const data = parsed.data
  if (data.email) {
    const email = data.email.toLowerCase().trim()
    const clash = await prisma.user.findFirst({ where: { email, NOT: { id } } })
    if (clash) return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 })
  }
  if (data.phone) {
    const phone = data.phone.replace(/\s+/g, " ").trim()
    const clash = await prisma.user.findFirst({ where: { phone, NOT: { id } } })
    if (clash) return NextResponse.json({ error: "Ce téléphone est déjà utilisé." }, { status: 409 })
  }
  if (data.quartierId) {
    const quartier = await prisma.quartier.findUnique({ where: { id: data.quartierId } })
    if (!quartier) return NextResponse.json({ error: "Quartier introuvable." }, { status: 400 })
  }

  const previousStatus = existing.status
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.role ? { role: data.role } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.email ? { email: data.email.toLowerCase().trim() } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.replace(/\s+/g, " ").trim() || null } : {}),
      profile: {
        update: {
          ...(data.firstName ? { firstName: data.firstName } : {}),
          ...(data.lastName ? { lastName: data.lastName } : {}),
          ...(data.quartierId !== undefined ? { quartierId: data.quartierId || null } : {}),
          ...(data.city !== undefined ? { city: data.city || null } : {}),
          ...(data.country !== undefined ? { country: data.country || null } : {}),
          ...(data.profession !== undefined ? { profession: data.profession || null } : {}),
        },
      },
    },
    include: { profile: true },
  })

  if (previousStatus !== "ACTIVE" && data.status === "ACTIVE") {
    await notifyAccountValidated({
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      email: user.email,
      phone: user.phone,
    })
  }

  return NextResponse.json({ ok: true, id: user.id, role: user.role, status: user.status })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireSuperAdmin()
  if (!session) {
    return NextResponse.json({ error: "Accès réservé au super administrateur." }, { status: 403 })
  }

  const { id } = await params
  if (id === session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Membre introuvable." }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

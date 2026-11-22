import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { toMember } from "@/lib/member-mapper"

const schema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  gender: z.enum(["FEMME", "HOMME"]).optional().nullable(),
  birthYear: z.number().int().min(1920).max(2015).optional().nullable(),
  quartierId: z.string().optional().nullable(),
  family: z.string().optional().nullable(),
  link: z.enum(["NAISSANCE", "FILIATION", "ALLIANCE", "AMI"]).optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  bio: z.string().max(400).optional().nullable(),
  motivation: z.string().optional().nullable(),
  sponsorName: z.string().optional().nullable(),
  showInDirectory: z.boolean().optional(),
  avatarUrl: z.string().optional().nullable(),
  onboardedAt: z.union([z.string().datetime(), z.literal(true)]).optional(),
  associationIds: z.array(z.string()).optional(),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const userId = session.user.id

    if (data.email) {
      const email = data.email.toLowerCase().trim()
      const clash = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } })
      if (clash) return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 })
      await prisma.user.update({ where: { id: userId }, data: { email } })
    }
    if (data.phone !== undefined) {
      const phone = data.phone?.trim() || null
      if (phone) {
        const clash = await prisma.user.findFirst({ where: { phone, NOT: { id: userId } } })
        if (clash) return NextResponse.json({ error: "Ce téléphone est déjà utilisé." }, { status: 409 })
      }
      await prisma.user.update({ where: { id: userId }, data: { phone } })
    }

    const profileData = {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.birthYear !== undefined && { birthYear: data.birthYear }),
      ...(data.quartierId !== undefined && { quartierId: data.quartierId }),
      ...(data.family !== undefined && { family: data.family }),
      ...(data.link !== undefined && { link: data.link }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.profession !== undefined && { profession: data.profession }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.motivation !== undefined && { motivation: data.motivation }),
      ...(data.sponsorName !== undefined && { sponsorName: data.sponsorName }),
      ...(data.showInDirectory !== undefined && { showInDirectory: data.showInDirectory }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.onboardedAt !== undefined && {
        onboardedAt: data.onboardedAt === true ? new Date() : new Date(data.onboardedAt),
      }),
    }

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: data.firstName ?? "Membre",
        lastName: data.lastName ?? "Bapa",
        ...profileData,
      },
      update: profileData,
    })

    if (data.associationIds) {
      const existing = await prisma.membership.findMany({ where: { userId } })
      const existingIds = new Set(existing.map((e) => e.associationId))
      const wanted = new Set(data.associationIds)
      for (const id of wanted) {
        if (!existingIds.has(id)) {
          await prisma.membership.create({
            data: { userId, associationId: id, role: "MEMBRE" },
          })
        }
      }
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    })

    return NextResponse.json({ ok: true, member: toMember(user) })
  } catch (err) {
    console.error("[profile]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

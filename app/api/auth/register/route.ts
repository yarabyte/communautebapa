import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { notifyRegistrationReceived } from "@/lib/notifications"
import { hashPassword } from "@/lib/password"

const schema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  associationSlug: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }

    const { firstName, lastName, password, associationSlug } = parsed.data
    const email = parsed.data.email.toLowerCase().trim()
    const phone = parsed.data.phone?.replace(/\s+/g, " ").trim() || null

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    })
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email ou ce téléphone." }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: "MEMBER",
        status: "PENDING",
        provider: "EMAIL",
        profile: {
          create: { firstName, lastName },
        },
      },
      include: { profile: true },
    })

    if (associationSlug) {
      const association = await prisma.association.findUnique({ where: { slug: associationSlug } })
      if (association) {
        await prisma.membership.create({
          data: {
            userId: user.id,
            associationId: association.id,
            role: "MEMBRE",
          },
        })
      }
    }

    await notifyRegistrationReceived({
      firstName,
      lastName,
      email,
      phone,
    })

    return NextResponse.json({
      ok: true,
      userId: user.id,
      status: user.status,
    })
  } catch (err) {
    console.error("[register]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

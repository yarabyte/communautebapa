import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notifyAccountRejected, notifyAccountValidated } from "@/lib/notifications"

const schema = z.object({
  decision: z.enum(["ACTIVE", "REJECTED"]),
  comment: z.string().optional().nullable(),
})

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès réservé au super administrateur." }, { status: 403 })
  }

  const { id } = await params
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  })
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
  }

  const { decision, comment } = parsed.data

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { status: decision },
    }),
    prisma.registrationReview.create({
      data: {
        userId: id,
        reviewerId: session.user.id,
        decision,
        comment: comment || null,
      },
    }),
  ])

  const person = {
    firstName: user.profile?.firstName ?? "",
    lastName: user.profile?.lastName ?? "",
    email: user.email,
    phone: user.phone,
  }

  if (decision === "ACTIVE") {
    await notifyAccountValidated(person)
  } else {
    await notifyAccountRejected(person, comment)
  }

  return NextResponse.json({ ok: true, status: decision })
}

import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const schema = z.object({
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED"]).optional(),
  reviewNote: z.string().optional().nullable(),
  featured: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!me || (me.role !== "SUPER_ADMIN" && me.role !== "ASSOCIATION_ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { id } = await params

  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }
    const data = parsed.data

    if (data.status === "REJECTED" && (!data.reviewNote || data.reviewNote.trim().length < 10)) {
      return NextResponse.json({ error: "Motif de refus trop court" }, { status: 400 })
    }

    if (data.featured === true) {
      await prisma.business.updateMany({ where: { featured: true }, data: { featured: false } })
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.reviewNote !== undefined && { reviewNote: data.reviewNote }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.status === "PUBLISHED" && { reviewNote: null }),
      },
    })

    return NextResponse.json({ ok: true, business })
  } catch (err) {
    console.error("[admin businesses PATCH]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

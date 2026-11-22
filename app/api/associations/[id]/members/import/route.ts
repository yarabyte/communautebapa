import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { userCanManageAssociation } from "@/lib/data/associations"
import { prisma } from "@/lib/db"
import { parseMembersWorkbook } from "@/lib/excel-members"
import { notifyTempPassword } from "@/lib/notifications"
import { generateTempPassword, hashPassword } from "@/lib/password"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id: associationId } = await params
  const allowed = await userCanManageAssociation(session.user.id, associationId, session.user.role)
  if (!allowed) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const association = await prisma.association.findUnique({ where: { id: associationId } })
  if (!association) {
    return NextResponse.json({ error: "Association introuvable" }, { status: 404 })
  }

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier Excel requis" }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const { rows, errors } = parseMembersWorkbook(buffer)

  const created: { email: string; row: number }[] = []
  const skipped: { email: string; row: number; reason: string }[] = []

  for (const row of rows) {
    try {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ email: row.email }, ...(row.phone ? [{ phone: row.phone }] : [])],
        },
      })

      let userId: string
      if (existing) {
        userId = existing.id
        const already = await prisma.membership.findUnique({
          where: { userId_associationId: { userId, associationId } },
        })
        if (already) {
          skipped.push({ email: row.email, row: row.row, reason: "Déjà membre de cette association" })
          continue
        }
        await prisma.membership.create({
          data: { userId, associationId, role: row.role },
        })
        skipped.push({ email: row.email, row: row.row, reason: "Compte existant — adhésion ajoutée" })
        continue
      }

      const tempPassword = generateTempPassword()
      const passwordHash = await hashPassword(tempPassword)
      const user = await prisma.user.create({
        data: {
          email: row.email,
          phone: row.phone || null,
          passwordHash,
          role: "MEMBER",
          status: "PENDING",
          provider: "EMAIL",
          profile: {
            create: {
              firstName: row.firstName,
              lastName: row.lastName,
            },
          },
          memberships: {
            create: {
              associationId,
              role: row.role,
            },
          },
        },
      })
      userId = user.id

      await notifyTempPassword(
        {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
        },
        tempPassword
      )

      created.push({ email: row.email, row: row.row })
      void userId
    } catch (err) {
      console.error("[import]", err)
      errors.push({ row: row.row, message: "Erreur à la création" })
    }
  }

  return NextResponse.json({
    ok: true,
    created: created.length,
    skipped: skipped.length,
    errors,
    details: { created, skipped },
  })
}

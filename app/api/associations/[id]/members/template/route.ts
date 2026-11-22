import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { userCanManageAssociation } from "@/lib/data/associations"
import { buildMembersTemplateBuffer } from "@/lib/excel-members"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id } = await params
  const allowed = await userCanManageAssociation(session.user.id, id, session.user.role)
  if (!allowed) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const buffer = buildMembersTemplateBuffer()
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modele-import-membres-bapa.xlsx"',
    },
  })
}

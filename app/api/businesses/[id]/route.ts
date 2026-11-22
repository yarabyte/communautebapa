import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { updateBusiness } from "@/lib/data/businesses"

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative().optional().nullable(),
  currency: z.enum(["XAF", "EUR", "USD"]).optional().nullable(),
})

const jobSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3),
  type: z.enum(["CDI", "CDD", "STAGE", "FREELANCE"]),
  city: z.string().trim().min(2),
  description: z.string().trim().min(10),
  applyContact: z.string().trim().min(5),
  status: z.enum(["OPEN", "CLOSED"]),
})

const schema = z.object({
  name: z.string().trim().min(2),
  sectorId: z.string().min(1),
  description: z.string().optional().default(""),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).default("PUBLIC"),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().default(""),
  country: z.string().optional().default(""),
  mapsUrl: z.string().optional().nullable(),
  services: z.array(serviceSchema).default([]),
  jobs: z.array(jobSchema).default([]),
  status: z.enum(["DRAFT", "PENDING"]),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id } = await params

  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    if (data.status === "PENDING") {
      if (data.description.trim().length < 30) {
        return NextResponse.json({ error: "Présentation trop courte (30 caractères minimum)" }, { status: 400 })
      }
      if (!data.city.trim() || !data.country.trim()) {
        return NextResponse.json({ error: "Ville et pays requis" }, { status: 400 })
      }
      if (!data.phone && !data.whatsapp && !data.email && !data.website) {
        return NextResponse.json({ error: "Indiquez au moins un moyen de contact" }, { status: 400 })
      }
    }

    const business = await updateBusiness(id, session.user.id, {
      ...data,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      website: data.website || null,
      facebook: data.facebook || null,
      instagram: data.instagram || null,
      linkedin: data.linkedin || null,
      tiktok: data.tiktok || null,
      address: data.address || null,
      mapsUrl: data.mapsUrl || null,
      services: data.services.map((s) => ({
        name: s.name,
        description: s.description ?? undefined,
        price: s.price ?? null,
        currency: s.currency ?? null,
      })),
    })

    if (!business) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, business })
  } catch (err) {
    console.error("[businesses PATCH]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

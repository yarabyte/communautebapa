import type {
  Business as DbBusiness,
  BusinessSector as DbSector,
  BusinessService as DbService,
  JobOffer as DbJob,
  Profile,
  User,
} from "@prisma/client"
import { Prisma } from "@prisma/client"

import { prisma } from "../db"
import { toMember } from "../member-mapper"
import { slugify } from "../slugify"
import type {
  Business,
  BusinessSector,
  BusinessStatus,
  JobOffer,
  Member,
  Tone,
} from "../types"

export type BusinessWithMeta = Business & {
  sectorName: string
  sectorIcon?: string
  ownerName: string
  ownerProfession?: string
  recommendationsCount: number
  openJobs: number
}

export type BusinessFilters = {
  publicOnly?: boolean
  status?: BusinessStatus | "ALL"
  sectorId?: string
  country?: string
  ownerId?: string
  businessId?: string
  metier?: string
  expertise?: string
  q?: string
}

type BusinessRow = DbBusiness & {
  sector: DbSector
  services: DbService[]
  recommendations: { userId: string }[]
  jobOffers: DbJob[]
  owner: User & { profile: Profile | null }
}

const TONES: Tone[] = ["terre", "nuit", "ocre", "indigo", "olive", "creme"]

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function toneFromId(id: string): Tone {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % TONES.length
  return TONES[h]
}

function toSector(s: DbSector): BusinessSector {
  return { id: s.id, name: s.name, icon: s.icon ?? "building" }
}

function toBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    ownerId: row.ownerId,
    name: row.name,
    logo: row.logoUrl ?? undefined,
    tone: toneFromId(row.id),
    sectorId: row.sectorId,
    description: row.description,
    services: row.services.map((s) => ({
      name: s.name,
      description: s.description ?? undefined,
      price: s.price != null ? Number(s.price) : undefined,
      currency: (s.currency as Business["services"][number]["currency"]) ?? undefined,
    })),
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    socials: {
      facebook: row.facebook ?? undefined,
      instagram: row.instagram ?? undefined,
      linkedin: row.linkedin ?? undefined,
      tiktok: row.tiktok ?? undefined,
    },
    address: row.address ?? undefined,
    city: row.city,
    country: row.country,
    mapsUrl: row.mapsUrl ?? undefined,
    visibility: row.visibility,
    status: row.status,
    reviewNote: row.reviewNote ?? undefined,
    featured: row.featured,
    createdAt: row.createdAt.toISOString().slice(0, 10),
  }
}

function withMeta(row: BusinessRow): BusinessWithMeta {
  const b = toBusiness(row)
  const p = row.owner.profile
  return {
    ...b,
    sectorName: row.sector.name,
    sectorIcon: row.sector.icon ?? undefined,
    ownerName: p ? `${p.firstName} ${p.lastName}` : row.owner.name ?? "Membre",
    ownerProfession: p?.profession ?? undefined,
    recommendationsCount: row.recommendations.length,
    openJobs: row.jobOffers.filter((j) => j.status === "OPEN").length,
  }
}

function toJobOffer(j: DbJob): JobOffer {
  return {
    id: j.id,
    slug: j.slug,
    businessId: j.businessId,
    title: j.title,
    type: j.type,
    city: j.city,
    country: j.country,
    description: j.description,
    applyContact: j.applyContact,
    publishedAt: j.publishedAt.toISOString().slice(0, 10),
    expiresAt: j.expiresAt ? j.expiresAt.toISOString().slice(0, 10) : undefined,
    status: j.status,
  }
}

const businessInclude = {
  sector: true,
  services: { orderBy: { position: "asc" as const } },
  recommendations: { select: { userId: true } },
  jobOffers: true,
  owner: { include: { profile: true } },
} satisfies Prisma.BusinessInclude

async function uniqueBusinessSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "entreprise"
  let n = 0
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`
    const existing = await prisma.business.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
  }
}

async function uniqueJobSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "offre"
  let n = 0
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`
    const existing = await prisma.jobOffer.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
  }
}

export async function getSectors() {
  const rows = await prisma.businessSector.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] })
  return rows.map(toSector)
}

export async function getBusinesses(filters: BusinessFilters = {}) {
  const status = filters.status ?? (filters.ownerId ? "ALL" : "PUBLISHED")
  const needle = filters.q && normalize(filters.q.trim())

  const rows = (await prisma.business.findMany({
    where: {
      ...(status !== "ALL" ? { status } : {}),
      ...(filters.publicOnly ? { visibility: "PUBLIC" } : {}),
      ...(filters.sectorId ? { sectorId: filters.sectorId } : {}),
      ...(filters.country ? { country: filters.country } : {}),
      ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
      ...(filters.businessId ? { id: filters.businessId } : {}),
    },
    include: businessInclude,
    orderBy: { createdAt: "desc" },
  })) as BusinessRow[]

  return rows
    .map(withMeta)
    .filter((b) => !filters.metier || b.ownerProfession === filters.metier)
    .filter((b) => !filters.expertise || b.services.some((s) => s.name === filters.expertise))
    .filter(
      (b) =>
        !needle ||
        normalize([b.name, b.description, b.city, b.country, b.sectorName, b.ownerName, ...b.services.map((s) => s.name)].join(" ")).includes(needle),
    )
}

export async function getBusiness(slug: string) {
  const row = (await prisma.business.findUnique({ where: { slug }, include: businessInclude })) as BusinessRow | null
  return row ? withMeta(row) : null
}

export async function getBusinessById(id: string) {
  const row = (await prisma.business.findUnique({ where: { id }, include: businessInclude })) as BusinessRow | null
  return row ? withMeta(row) : null
}

export type DirectoryOptions = {
  entrepreneurs: { id: string; name: string }[]
  businesses: { id: string; name: string }[]
  metiers: string[]
  expertises: string[]
}

export async function getDirectoryOptions(publicOnly = false): Promise<DirectoryOptions> {
  const list = await getBusinesses({ status: "PUBLISHED", publicOnly })
  const entrepreneurs = [...new Map(list.map((b) => [b.ownerId, { id: b.ownerId, name: b.ownerName }])).values()].sort((a, b) =>
    a.name.localeCompare(b.name, "fr"),
  )
  return {
    entrepreneurs,
    businesses: list.map((b) => ({ id: b.id, name: b.name })).sort((a, b) => a.name.localeCompare(b.name, "fr")),
    metiers: [...new Set(list.map((b) => b.ownerProfession).filter((m): m is string => !!m))].sort((a, b) => a.localeCompare(b, "fr")),
    expertises: [...new Set(list.flatMap((b) => b.services.map((s) => s.name)))].sort((a, b) => a.localeCompare(b, "fr")),
  }
}

export type SkillCatalogEntry = {
  kind: "metier" | "expertise"
  name: string
  businessesCount: number
  entrepreneursCount: number
}

export type SkillsCatalog = {
  metiers: SkillCatalogEntry[]
  expertises: SkillCatalogEntry[]
}

export async function getSkillsCatalog({ q }: { q?: string } = {}): Promise<SkillsCatalog> {
  const list = await getBusinesses({ status: "PUBLISHED" })
  const needle = q && normalize(q.trim())

  const metierMap = new Map<string, { businessIds: Set<string>; ownerIds: Set<string> }>()
  const expertiseMap = new Map<string, { businessIds: Set<string>; ownerIds: Set<string> }>()

  for (const b of list) {
    if (b.ownerProfession) {
      const entry = metierMap.get(b.ownerProfession) ?? { businessIds: new Set(), ownerIds: new Set() }
      entry.businessIds.add(b.id)
      entry.ownerIds.add(b.ownerId)
      metierMap.set(b.ownerProfession, entry)
    }
    for (const service of b.services) {
      const entry = expertiseMap.get(service.name) ?? { businessIds: new Set(), ownerIds: new Set() }
      entry.businessIds.add(b.id)
      entry.ownerIds.add(b.ownerId)
      expertiseMap.set(service.name, entry)
    }
  }

  const toEntries = (kind: SkillCatalogEntry["kind"], map: Map<string, { businessIds: Set<string>; ownerIds: Set<string> }>) =>
    [...map.entries()]
      .map(([name, counts]) => ({
        kind,
        name,
        businessesCount: counts.businessIds.size,
        entrepreneursCount: counts.ownerIds.size,
      }))
      .filter((e) => !needle || normalize(e.name).includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))

  return {
    metiers: toEntries("metier", metierMap),
    expertises: toEntries("expertise", expertiseMap),
  }
}

export async function getBusinessCountries() {
  const rows = await prisma.business.findMany({ where: { status: "PUBLISHED" }, select: { country: true }, distinct: ["country"] })
  return rows.map((r) => r.country).sort()
}

export async function getFeaturedBusiness() {
  const row = (await prisma.business.findFirst({
    where: { featured: true, status: "PUBLISHED", visibility: "PUBLIC" },
    include: businessInclude,
  })) as BusinessRow | null
  return row ? withMeta(row) : null
}

export async function getRecommendations(businessId: string) {
  const rows = await prisma.businessRecommendation.findMany({
    where: { businessId },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  })
  return rows
    .map((r) => ({
      businessId: r.businessId,
      memberId: r.userId,
      comment: r.comment ?? undefined,
      createdAt: r.createdAt.toISOString().slice(0, 10),
      member: toMember(r.user) as Member,
    }))
    .filter((r) => r.member)
}

export type JobWithBusiness = JobOffer & { business: BusinessWithMeta }

export async function getJobOffers({
  publicOnly,
  businessId,
  openOnly = true,
}: { publicOnly?: boolean; businessId?: string; openOnly?: boolean } = {}): Promise<JobWithBusiness[]> {
  const jobs = await prisma.jobOffer.findMany({
    where: {
      ...(businessId ? { businessId } : {}),
      ...(openOnly ? { status: "OPEN" } : {}),
    },
    include: { business: { include: businessInclude } },
    orderBy: { publishedAt: "desc" },
  })

  return jobs
    .map((j) => ({
      ...toJobOffer(j),
      business: withMeta(j.business as BusinessRow),
    }))
    .filter((j) => j.business.status === "PUBLISHED" || !!businessId)
    .filter((j) => !publicOnly || j.business.visibility === "PUBLIC")
}

export async function getBusinessStats() {
  const [published, pending, openJobs, owners] = await Promise.all([
    prisma.business.count({ where: { status: "PUBLISHED" } }),
    prisma.business.count({ where: { status: "PENDING" } }),
    prisma.jobOffer.count({ where: { status: "OPEN" } }),
    prisma.business.findMany({ where: { status: "PUBLISHED" }, select: { ownerId: true }, distinct: ["ownerId"] }),
  ])
  return {
    published,
    pending,
    entrepreneurs: owners.length,
    openJobs,
  }
}

export type BusinessWriteInput = {
  name: string
  sectorId: string
  description: string
  visibility: "PUBLIC" | "MEMBERS"
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  facebook?: string | null
  instagram?: string | null
  linkedin?: string | null
  tiktok?: string | null
  address?: string | null
  city: string
  country: string
  mapsUrl?: string | null
  services: { name: string; description?: string; price?: number | null; currency?: "XAF" | "EUR" | "USD" | null }[]
  jobs: {
    id?: string
    title: string
    type: "CDI" | "CDD" | "STAGE" | "FREELANCE"
    city: string
    description: string
    applyContact: string
    status: "OPEN" | "CLOSED"
  }[]
  status: "DRAFT" | "PENDING"
}

export async function createBusiness(ownerId: string, input: BusinessWriteInput) {
  const slug = await uniqueBusinessSlug(input.name)
  const created = await prisma.business.create({
    data: {
      slug,
      ownerId,
      sectorId: input.sectorId,
      name: input.name,
      description: input.description || " ",
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      website: input.website || null,
      facebook: input.facebook || null,
      instagram: input.instagram || null,
      linkedin: input.linkedin || null,
      tiktok: input.tiktok || null,
      address: input.address || null,
      city: input.city || "—",
      country: input.country || "—",
      mapsUrl: input.mapsUrl || null,
      visibility: input.visibility,
      status: input.status,
      services: {
        create: input.services.map((s, i) => ({
          name: s.name,
          description: s.description || null,
          price: s.price != null ? s.price : null,
          currency: s.currency || null,
          position: i,
        })),
      },
    },
  })

  for (const job of input.jobs) {
    const jobSlug = await uniqueJobSlug(`${created.slug}-${job.title}`)
    await prisma.jobOffer.create({
      data: {
        slug: jobSlug,
        businessId: created.id,
        title: job.title,
        type: job.type,
        city: job.city,
        country: input.country || "—",
        description: job.description,
        applyContact: job.applyContact,
        status: job.status,
      },
    })
  }

  return getBusinessById(created.id)
}

export async function updateBusiness(id: string, ownerId: string, input: BusinessWriteInput) {
  const existing = await prisma.business.findUnique({ where: { id }, include: { jobOffers: true } })
  if (!existing || existing.ownerId !== ownerId) return null

  const slug = existing.slug

  await prisma.$transaction(async (tx) => {
    await tx.businessService.deleteMany({ where: { businessId: id } })
    await tx.business.update({
      where: { id },
      data: {
        slug,
        sectorId: input.sectorId,
        name: input.name,
        description: input.description || " ",
        phone: input.phone || null,
        whatsapp: input.whatsapp || null,
        email: input.email || null,
        website: input.website || null,
        facebook: input.facebook || null,
        instagram: input.instagram || null,
        linkedin: input.linkedin || null,
        tiktok: input.tiktok || null,
        address: input.address || null,
        city: input.city || "—",
        country: input.country || "—",
        mapsUrl: input.mapsUrl || null,
        visibility: input.visibility,
        status: input.status,
        reviewNote: input.status === "PENDING" ? null : undefined,
        services: {
          create: input.services.map((s, i) => ({
            name: s.name,
            description: s.description || null,
            price: s.price != null ? s.price : null,
            currency: s.currency || null,
            position: i,
          })),
        },
      },
    })

    const keepIds = new Set(input.jobs.map((j) => j.id).filter(Boolean) as string[])
    for (const old of existing.jobOffers) {
      if (!keepIds.has(old.id)) await tx.jobOffer.delete({ where: { id: old.id } })
    }

    for (const job of input.jobs) {
      if (job.id && existing.jobOffers.some((o) => o.id === job.id)) {
        await tx.jobOffer.update({
          where: { id: job.id },
          data: {
            title: job.title,
            type: job.type,
            city: job.city,
            country: input.country || "—",
            description: job.description,
            applyContact: job.applyContact,
            status: job.status,
          },
        })
      } else {
        const jobSlug = await uniqueJobSlug(`${slug}-${job.title}`)
        await tx.jobOffer.create({
          data: {
            slug: jobSlug,
            businessId: id,
            title: job.title,
            type: job.type,
            city: job.city,
            country: input.country || "—",
            description: job.description,
            applyContact: job.applyContact,
            status: job.status,
          },
        })
      }
    }
  })

  return getBusinessById(id)
}

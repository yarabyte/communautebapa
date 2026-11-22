import type { Association as DbAssociation, Membership as DbMembership } from "@prisma/client"

import { matchesAssociation } from "../association-utils"
import { prisma } from "../db"
import { toMember } from "../member-mapper"
import { associations as mockAssociations } from "../mock/associations"
import type { Association, AssociationCategory, AssociationZone, Membership, Tone } from "../types"

export type AssociationWithStats = Association & { membersCount: number }

export type AssociationFilters = {
  publicOnly?: boolean
  country?: string
  zone?: AssociationZone
  category?: AssociationCategory
  q?: string
}

function toAssociation(a: DbAssociation): Association {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    shortName: a.shortName,
    fullName: a.fullName ?? undefined,
    category: a.category,
    zone: a.zone,
    country: a.country,
    region: a.region ?? undefined,
    city: a.city ?? undefined,
    description: a.description,
    mission: a.mission ?? "",
    cover: a.coverUrl ?? "/images/paysage-bapa.png",
    tone: (a.tone as Tone) || "terre",
    foundedYear: a.foundedYear ?? undefined,
    isPublic: a.isPublic,
    meetingInfo: a.meetingInfo ?? undefined,
    adevipa: a.adevipa,
    source: a.source ?? "",
    notes: a.notes ?? undefined,
  }
}

function toMembership(ms: DbMembership): Membership {
  return {
    memberId: ms.userId,
    associationId: ms.associationId,
    role: ms.role,
    since: ms.since.toISOString().slice(0, 10),
  }
}

async function withStats(a: Association): Promise<AssociationWithStats> {
  const membersCount = await prisma.membership.count({ where: { associationId: a.id } })
  return { ...a, membersCount }
}

export async function getAssociations(filters: AssociationFilters = {}) {
  const rows = await prisma.association.findMany({ orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }] })
  const mapped = rows.map(toAssociation)
  const filtered = mapped
    .filter((a) => !filters.publicOnly || a.isPublic)
    .filter((a) => !filters.country || a.country === filters.country)
    .filter((a) => !filters.zone || a.zone === filters.zone)
    .filter((a) => !filters.category || a.category === filters.category)
    .filter((a) => !filters.q || matchesAssociation(a, filters.q))

  const counts = await prisma.membership.groupBy({
    by: ["associationId"],
    _count: { _all: true },
  })
  const countMap = new Map(counts.map((c) => [c.associationId, c._count._all]))
  return filtered.map((a) => ({ ...a, membersCount: countMap.get(a.id) ?? 0 }))
}

export async function getAssociation(slug: string) {
  const a = await prisma.association.findUnique({ where: { slug } })
  return a ? withStats(toAssociation(a)) : null
}

export async function getAssociationById(id: string) {
  const a = await prisma.association.findUnique({ where: { id } })
  return a ? toAssociation(a) : null
}

/** Sync — IDs mock pour les contenus démo ; préférer getAssociationById pour la DB. */
export function associationById(id?: string) {
  return id ? mockAssociations.find((a) => a.id === id) : undefined
}

export async function getAssociationStats() {
  const associations = await prisma.association.findMany()
  return {
    total: associations.length,
    countries: new Set(associations.map((a) => a.country)).size,
    cities: new Set(associations.filter((a) => a.city).map((a) => `${a.country}/${a.city}`)).size,
    cameroon: associations.filter((a) => a.country === "Cameroun").length,
    diaspora: associations.filter((a) => a.country !== "Cameroun").length,
    adevipa: associations.filter((a) => a.adevipa).length,
  }
}

export async function getAssociationCountries() {
  const rows = await prisma.association.findMany({ select: { country: true }, distinct: ["country"], orderBy: { country: "asc" } })
  return rows.map((r) => r.country)
}

export async function getAssociationMembers(associationId: string) {
  const rows = await prisma.membership.findMany({
    where: { associationId },
    include: { user: { include: { profile: true } } },
  })
  return rows.map((ms) => ({
    membership: toMembership(ms),
    member: toMember(ms.user),
  }))
}

export async function getMemberAssociations(memberId: string) {
  const rows = await prisma.membership.findMany({
    where: { userId: memberId },
    include: { association: true },
  })
  return Promise.all(
    rows.map(async (ms) => ({
      membership: toMembership(ms),
      association: await withStats(toAssociation(ms.association)),
    }))
  )
}

export async function userCanManageAssociation(userId: string, associationId: string, role: string) {
  if (role === "SUPER_ADMIN") return true
  const ms = await prisma.membership.findUnique({
    where: { userId_associationId: { userId, associationId } },
  })
  if (!ms) return false
  return ms.role === "RESPONSABLE" || ms.role === "SECRETAIRE" || role === "ASSOCIATION_ADMIN"
}

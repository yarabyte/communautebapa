import { associations, memberships } from "../mock/associations"
import { members } from "../mock/members"
import { matchesAssociation } from "../association-utils"
import type { Association, AssociationCategory, AssociationZone } from "../types"

export type AssociationWithStats = Association & { membersCount: number }

export type AssociationFilters = {
  publicOnly?: boolean
  country?: string
  zone?: AssociationZone
  category?: AssociationCategory
  q?: string
}

function withStats(a: Association): AssociationWithStats {
  const seed = Number(a.id.replace(/\D/g, ""))
  return { ...a, membersCount: memberships.filter((ms) => ms.associationId === a.id).length + 8 + ((seed * 37) % 60) }
}

export async function getAssociations(filters: AssociationFilters = {}) {
  return associations
    .filter((a) => !filters.publicOnly || a.isPublic)
    .filter((a) => !filters.country || a.country === filters.country)
    .filter((a) => !filters.zone || a.zone === filters.zone)
    .filter((a) => !filters.category || a.category === filters.category)
    .filter((a) => !filters.q || matchesAssociation(a, filters.q))
    .map(withStats)
}

export async function getAssociation(slug: string) {
  const a = associations.find((x) => x.slug === slug)
  return a ? withStats(a) : null
}

export function associationById(id?: string) {
  return id ? associations.find((a) => a.id === id) : undefined
}

export async function getAssociationStats() {
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
  return [...new Set(associations.map((a) => a.country))]
}

export async function getAssociationMembers(associationId: string) {
  return memberships
    .filter((ms) => ms.associationId === associationId)
    .map((ms) => ({ membership: ms, member: members.find((m) => m.id === ms.memberId)! }))
    .filter((x) => x.member)
}

export async function getMemberAssociations(memberId: string) {
  return memberships
    .filter((ms) => ms.memberId === memberId)
    .map((ms) => ({ membership: ms, association: withStats(associations.find((a) => a.id === ms.associationId)!) }))
}

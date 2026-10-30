import { businesses, jobOffers, recommendations, sectors } from "../mock/businesses"
import { members } from "../mock/members"
import type { Business, BusinessStatus, JobOffer, Member } from "../types"

export type BusinessWithMeta = Business & {
  sectorName: string
  sectorIcon?: string
  ownerName: string
  recommendationsCount: number
  openJobs: number
}

export type BusinessFilters = {
  /** Fiches publiques uniquement (site public). */
  publicOnly?: boolean
  /** Par défaut : fiches publiées. `"ALL"` pour tout voir (back-office, propriétaire). */
  status?: BusinessStatus | "ALL"
  sectorId?: string
  country?: string
  ownerId?: string
  q?: string
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function withMeta(b: Business): BusinessWithMeta {
  const owner = members.find((m) => m.id === b.ownerId)
  const sector = sectors.find((s) => s.id === b.sectorId)
  return {
    ...b,
    sectorName: sector?.name ?? "Autre",
    sectorIcon: sector?.icon,
    ownerName: owner ? `${owner.firstName} ${owner.lastName}` : "Membre",
    recommendationsCount: recommendations.filter((r) => r.businessId === b.id).length,
    openJobs: jobOffers.filter((j) => j.businessId === b.id && j.status === "OPEN").length,
  }
}

export async function getSectors() {
  return sectors
}

export async function getBusinesses(filters: BusinessFilters = {}) {
  const status = filters.status ?? (filters.ownerId ? "ALL" : "PUBLISHED")
  const needle = filters.q && normalize(filters.q.trim())
  return businesses
    .filter((b) => status === "ALL" || b.status === status)
    .filter((b) => !filters.publicOnly || b.visibility === "PUBLIC")
    .filter((b) => !filters.sectorId || b.sectorId === filters.sectorId)
    .filter((b) => !filters.country || b.country === filters.country)
    .filter((b) => !filters.ownerId || b.ownerId === filters.ownerId)
    .map(withMeta)
    .filter(
      (b) =>
        !needle ||
        normalize([b.name, b.description, b.city, b.country, b.sectorName, b.ownerName, ...b.services.map((s) => s.name)].join(" ")).includes(needle),
    )
}

export async function getBusiness(slug: string) {
  const b = businesses.find((x) => x.slug === slug)
  return b ? withMeta(b) : null
}

export async function getBusinessById(id: string) {
  const b = businesses.find((x) => x.id === id)
  return b ? withMeta(b) : null
}

export async function getBusinessCountries() {
  return [...new Set(businesses.filter((b) => b.status === "PUBLISHED").map((b) => b.country))].sort()
}

export async function getFeaturedBusiness() {
  const b = businesses.find((x) => x.featured && x.status === "PUBLISHED" && x.visibility === "PUBLIC")
  return b ? withMeta(b) : null
}

export async function getRecommendations(businessId: string) {
  return recommendations
    .filter((r) => r.businessId === businessId)
    .map((r) => ({ ...r, member: members.find((m) => m.id === r.memberId) as Member }))
    .filter((r) => r.member)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export type JobWithBusiness = JobOffer & { business: BusinessWithMeta }

export async function getJobOffers({
  publicOnly,
  businessId,
  openOnly = true,
}: { publicOnly?: boolean; businessId?: string; openOnly?: boolean } = {}): Promise<JobWithBusiness[]> {
  return jobOffers
    .filter((j) => !businessId || j.businessId === businessId)
    .filter((j) => !openOnly || j.status === "OPEN")
    .map((j) => ({ ...j, business: withMeta(businesses.find((b) => b.id === j.businessId)!) }))
    .filter((j) => j.business.status === "PUBLISHED" || businessId)
    .filter((j) => !publicOnly || j.business.visibility === "PUBLIC")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function getBusinessStats() {
  const published = businesses.filter((b) => b.status === "PUBLISHED")
  return {
    published: published.length,
    pending: businesses.filter((b) => b.status === "PENDING").length,
    entrepreneurs: new Set(published.map((b) => b.ownerId)).size,
    openJobs: jobOffers.filter((j) => j.status === "OPEN").length,
  }
}

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { toMember } from "@/lib/member-mapper"
import { members as mockMembers, quartiers as mockQuartiers } from "@/lib/mock/members"
import type { Member, MemberStatus, Quartier } from "@/lib/types"

export type MemberFilters = {
  q?: string
  quartierId?: string
  country?: string
  profession?: string
  status?: MemberStatus
  /** Uniquement les membres qui ont choisi d'apparaître dans l'annuaire. */
  directoryOnly?: boolean
}

function matchesFilters(m: Member, filters: MemberFilters) {
  const q = filters.q?.toLowerCase().trim()
  if (filters.status && m.status !== filters.status) return false
  if (filters.directoryOnly && !m.showInDirectory) return false
  if (filters.quartierId && m.quartierId !== filters.quartierId) return false
  if (filters.country && m.country !== filters.country) return false
  if (filters.profession && !m.profession?.toLowerCase().includes(filters.profession.toLowerCase())) return false
  if (q && ![m.firstName, m.lastName, m.city, m.profession, m.family].filter(Boolean).join(" ").toLowerCase().includes(q)) {
    return false
  }
  return true
}

export async function getMembers(filters: MemberFilters = {}): Promise<Member[]> {
  const users = await prisma.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  })
  return users.map(toMember).filter((m) => matchesFilters(m, filters))
}

export async function getMember(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } })
  if (user) return toMember(user)
  return mockMembers.find((m) => m.id === id) ?? null
}

export async function getCurrentMember(): Promise<Member> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED")
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  })
  if (!user) throw new Error("UNAUTHORIZED")
  return toMember(user)
}

export async function getPendingRegistrations() {
  return getMembers({ status: "PENDING" })
}

export async function getQuartiers(): Promise<Quartier[]> {
  const rows = await prisma.quartier.findMany({ orderBy: { name: "asc" } })
  if (rows.length > 0) return rows
  return mockQuartiers
}

/** Résout le libellé quartier (IDs DB ou mock). */
export function getQuartierName(id?: string, quartiers?: Quartier[]) {
  if (!id) return "Quartier non renseigné"
  const list = quartiers ?? mockQuartiers
  const name = list.find((q) => q.id === id)?.name
  return name ? `Quartier ${name}` : "Quartier non renseigné"
}

export async function resolveQuartierName(id?: string) {
  if (!id) return "Quartier non renseigné"
  const q = await prisma.quartier.findUnique({ where: { id } })
  if (q) return `Quartier ${q.name}`
  const mock = mockQuartiers.find((x) => x.id === id)
  return mock ? `Quartier ${mock.name}` : "Quartier non renseigné"
}

/** « Douala, Cameroun », « France » ou « Résidence non renseignée ». */
export function memberPlace(m: Pick<Member, "city" | "country">) {
  return [m.city, m.country].filter(Boolean).join(", ") || "Résidence non renseignée"
}

export async function getCountries() {
  const rows = await prisma.profile.findMany({
    where: { country: { not: null } },
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  })
  const fromDb = rows.map((r) => r.country!).filter(Boolean)
  if (fromDb.length > 0) return fromDb
  return [...new Set(mockMembers.map((m) => m.country).filter((c): c is string => !!c))].sort()
}

/** Sync lookup — mock pour contenus démo ; utiliser getMember pour la DB. */
export function memberById(id: string) {
  return mockMembers.find((m) => m.id === id)
}

export function fullName(m: Pick<Member, "firstName" | "lastName">) {
  return `${m.firstName} ${m.lastName}`
}

export async function presidentName(associationId: string) {
  const membership = await prisma.membership.findFirst({
    where: { associationId, role: "RESPONSABLE" },
    include: { user: { include: { profile: true } } },
  })
  const p = membership?.user.profile
  return p ? `${p.firstName} ${p.lastName}` : undefined
}

export async function getMemberAssociationIds(memberId: string) {
  const rows = await prisma.membership.findMany({ where: { userId: memberId }, select: { associationId: true } })
  return rows.map((r) => r.associationId)
}

import { cookies } from "next/headers"

import { CURRENT_USER_ID } from "../constants"
import { DEMO_PENDING_COOKIE, DEMO_PENDING_MEMBER_ID } from "../demo"
import { memberships } from "../mock/associations"
import { members, quartiers } from "../mock/members"
import type { Member, MemberStatus } from "../types"

export type MemberFilters = {
  q?: string
  quartierId?: string
  country?: string
  profession?: string
  status?: MemberStatus
}

export async function getMembers(filters: MemberFilters = {}): Promise<Member[]> {
  const q = filters.q?.toLowerCase().trim()
  return members.filter((m) => {
    if (filters.status && m.status !== filters.status) return false
    if (filters.quartierId && m.quartierId !== filters.quartierId) return false
    if (filters.country && m.country !== filters.country) return false
    if (filters.profession && !m.profession?.toLowerCase().includes(filters.profession.toLowerCase())) return false
    if (q && ![m.firstName, m.lastName, m.city, m.profession, m.family].filter(Boolean).join(" ").toLowerCase().includes(q)) return false
    return true
  })
}

export async function getMember(id: string) {
  return members.find((m) => m.id === id) ?? null
}

export async function getCurrentMember() {
  const pending = (await cookies()).get(DEMO_PENDING_COOKIE)?.value === "1"
  return members.find((m) => m.id === (pending ? DEMO_PENDING_MEMBER_ID : CURRENT_USER_ID))!
}

export async function getPendingRegistrations() {
  return members.filter((m) => m.status === "PENDING")
}

export async function getQuartiers() {
  return quartiers
}

export function getQuartierName(id?: string) {
  const name = id && quartiers.find((q) => q.id === id)?.name
  return name ? `Quartier ${name}` : "Quartier non renseigné"
}

/** « Douala, Cameroun », « France » ou « Résidence non renseignée ». */
export function memberPlace(m: Pick<Member, "city" | "country">) {
  return [m.city, m.country].filter(Boolean).join(", ") || "Résidence non renseignée"
}

export async function getCountries() {
  return [...new Set(members.map((m) => m.country).filter((c): c is string => !!c))].sort()
}

export function memberById(id: string) {
  return members.find((m) => m.id === id)
}

export function fullName(m: Pick<Member, "firstName" | "lastName">) {
  return `${m.firstName} ${m.lastName}`
}

export async function getMemberAssociationIds(memberId: string) {
  return memberships.filter((ms) => ms.memberId === memberId).map((ms) => ms.associationId)
}

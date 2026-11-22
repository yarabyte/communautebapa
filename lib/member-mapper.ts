import type { AuthProvider, BapaLink, Gender, MemberStatus, Profile, Role, User } from "@prisma/client"

import type { Member } from "./types"

type UserWithProfile = User & { profile: Profile | null }

export function toMember(user: UserWithProfile): Member {
  const p = user.profile
  return {
    id: user.id,
    firstName: p?.firstName ?? "",
    lastName: p?.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    avatar: p?.avatarUrl ?? undefined,
    gender: (p?.gender as Gender | undefined) ?? undefined,
    birthYear: p?.birthYear ?? undefined,
    quartierId: p?.quartierId ?? undefined,
    family: p?.family ?? undefined,
    link: (p?.link as BapaLink | undefined) ?? undefined,
    country: p?.country ?? undefined,
    city: p?.city ?? undefined,
    profession: p?.profession ?? undefined,
    bio: p?.bio ?? undefined,
    showInDirectory: p?.showInDirectory ?? true,
    onboardedAt: p?.onboardedAt?.toISOString(),
    role: user.role as Role,
    status: user.status as MemberStatus,
    provider: user.provider as AuthProvider,
    joinedAt: user.createdAt.toISOString(),
    motivation: p?.motivation ?? undefined,
    sponsorName: p?.sponsorName ?? undefined,
  }
}

import { Briefcase, Home, MapPin } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { Pill } from "@/components/brand/pill"
import { getQuartierName, memberPlace } from "@/lib/data/members"
import { formatDate } from "@/lib/format"
import type { Member } from "@/lib/types"
import { MemberAvatar } from "./member-avatar"

export function ProfileHeader({ member, actions, badge }: { member: Member; actions?: React.ReactNode; badge?: string }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="tone-terre relative h-32 sm:h-40">
        <BapaMotif tone="light" fade="corner" />
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <MemberAvatar member={member} className="-mt-14 size-28 border-4 border-card text-3xl shadow-lg" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl text-brun sm:text-3xl">
                {member.firstName} {member.lastName}
              </h1>
              {badge && <Pill tone="olive">{badge}</Pill>}
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {member.profession && (
                <li className="flex items-center gap-1.5">
                  <Briefcase className="size-4 text-or" /> {member.profession}
                </li>
              )}
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 text-or" /> {memberPlace(member)}
              </li>
              <li className="flex items-center gap-1.5">
                <Home className="size-4 text-or" /> {[getQuartierName(member.quartierId), member.family].filter(Boolean).join(" · ")}
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">Membre depuis le {formatDate(member.joinedAt)}</p>
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </section>
  )
}

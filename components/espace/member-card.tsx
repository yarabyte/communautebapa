import Link from "next/link"
import { Briefcase, MapPin, MessageCircle } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { Button } from "@/components/ui/button"
import { getQuartierName, memberPlace } from "@/lib/data/members"
import type { Member } from "@/lib/types"
import { MemberAvatar } from "./member-avatar"

export function MemberCard({
  member,
  hrefBase = "/espace/annuaire",
  showMessage = true,
}: {
  member: Member
  hrefBase?: string
  showMessage?: boolean
}) {
  return (
    <article className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-or/25 bg-card p-5 text-center shadow-[0_12px_28px_-24px_rgba(57,37,23,0.4)] transition-shadow hover:shadow-[0_18px_36px_-22px_rgba(57,37,23,0.45)]">
      <BapaMotif tone="gold" fade="corner" className="opacity-[0.16]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/55 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.35rem] border border-or/15" />

      <MemberAvatar member={member} className="relative size-16 text-lg" />
      <div className="relative">
        <h3 className="font-heading text-[17px] tracking-wide text-brun">
          <Link href={`${hrefBase}/${member.id}`} className="after:absolute after:inset-0 group-hover:text-terre">
            {member.firstName} {member.lastName}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-or-dark">{getQuartierName(member.quartierId)}</p>
      </div>
      <ul className="relative flex flex-col gap-1 text-xs text-muted-foreground">
        {member.profession && (
          <li className="flex items-center justify-center gap-1.5">
            <Briefcase className="size-3.5 text-or" /> {member.profession}
          </li>
        )}
        <li className="flex items-center justify-center gap-1.5">
          <MapPin className="size-3.5 text-or" /> {memberPlace(member)}
        </li>
      </ul>
      {showMessage && (
        <Button asChild size="sm" variant="outline" className="relative z-10 mt-auto rounded-full">
          <Link href={`/espace/messages?a=${member.id}`}>
            <MessageCircle /> Écrire
          </Link>
        </Button>
      )}
    </article>
  )
}

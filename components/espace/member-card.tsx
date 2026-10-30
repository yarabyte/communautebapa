import Link from "next/link"
import { Briefcase, MapPin, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getQuartierName, memberPlace } from "@/lib/data/members"
import type { Member } from "@/lib/types"
import { MemberAvatar } from "./member-avatar"

export function MemberCard({ member }: { member: Member }) {
  return (
    <article className="group relative flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-[0_16px_32px_rgba(57,37,23,0.1)]">
      <MemberAvatar member={member} className="size-16 text-lg" />
      <div>
        <h3 className="font-medium text-brun">
          <Link href={`/espace/annuaire/${member.id}`} className="after:absolute after:inset-0">
            {member.firstName} {member.lastName}
          </Link>
        </h3>
        <p className="text-xs text-or-dark">{getQuartierName(member.quartierId)}</p>
      </div>
      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        {member.profession && (
          <li className="flex items-center justify-center gap-1.5">
            <Briefcase className="size-3.5" /> {member.profession}
          </li>
        )}
        <li className="flex items-center justify-center gap-1.5">
          <MapPin className="size-3.5" /> {memberPlace(member)}
        </li>
      </ul>
      <Button asChild size="sm" variant="outline" className="relative z-10 mt-auto rounded-full">
        <Link href={`/espace/messages?a=${member.id}`}>
          <MessageCircle /> Écrire
        </Link>
      </Button>
    </article>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import type { Member } from "@/lib/types"
import { cn } from "@/lib/utils"

const palettes = ["bg-terre/15 text-terre", "bg-olive/15 text-olive", "bg-or/20 text-or-dark", "bg-indigo-bapa/15 text-indigo-bapa", "bg-brun/10 text-brun"]

export function MemberAvatar({ member, className }: { member: Pick<Member, "id" | "firstName" | "lastName" | "avatar">; className?: string }) {
  const palette = palettes[Number(member.id.replace(/\D/g, "")) % palettes.length]
  return (
    <Avatar className={cn("size-9", className)}>
      {member.avatar && <AvatarImage src={member.avatar} alt="" />}
      <AvatarFallback className={cn("font-medium", palette)}>{initials(member.firstName, member.lastName)}</AvatarFallback>
    </Avatar>
  )
}

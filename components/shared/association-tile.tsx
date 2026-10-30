import { MapPin, Users } from "lucide-react"

import { NumberedTile } from "@/components/brand/numbered-tile"
import { associationPlace } from "@/lib/association-utils"
import type { AssociationWithStats } from "@/lib/data/associations"
import { associationCategoryLabels } from "@/lib/labels"

export function AssociationTile({
  association,
  href,
  num,
  withImage = true,
  className,
}: {
  association: AssociationWithStats
  href: string
  num?: string
  withImage?: boolean
  className?: string
}) {
  return (
    <NumberedTile
      num={num}
      href={href}
      tag={associationCategoryLabels[association.category]}
      title={association.name}
      description={association.description}
      image={withImage ? association.cover : undefined}
      tone={association.tone}
      className={className}
      meta={
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {associationPlace(association)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" /> {association.membersCount} membres
          </span>
        </span>
      }
    />
  )
}

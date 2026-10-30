import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, MapPin, Users } from "lucide-react"

import { AssociationBrowser } from "@/components/shared/association-browser"
import { PageHeader } from "@/components/espace/page-header"
import { Badge } from "@/components/ui/badge"
import { associationPlace } from "@/lib/association-utils"
import { getAssociations, getMemberAssociations } from "@/lib/data/associations"
import { getCurrentMember } from "@/lib/data/members"
import { associationCategoryLabels, membershipRoleLabels } from "@/lib/labels"

export const metadata: Metadata = { title: "Associations" }

export default async function EspaceAssociationsPage() {
  const member = await getCurrentMember()
  const [mine, all] = await Promise.all([getMemberAssociations(member.id), getAssociations()])
  const mineIds = new Set(mine.map((m) => m.association.id))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Vie associative" title="Associations" description="Vos associations et celles que vous pouvez rejoindre." />

      {mine.length > 0 && (
        <section className="@container flex flex-col gap-3">
          <h2 className="font-heading text-lg text-brun">Mes associations</h2>
          <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3">
            {mine.map(({ association, membership }) => (
              <Link
                key={association.id}
                href={`/espace/associations/${association.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-terre/40"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image src={association.cover} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-brun group-hover:text-terre">{association.name}</p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="shrink-0">
                      {membershipRoleLabels[membership.role]}
                    </Badge>
                    <span className="truncate">{associationCategoryLabels[association.category]}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1">
                      <MapPin className="size-3.5 shrink-0 text-or" />
                      <span className="truncate">{associationPlace(association)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <Users className="size-3.5 text-or" /> {association.membersCount}
                    </span>
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg text-brun">Toutes les associations Bapa</h2>
          <p className="text-sm text-muted-foreground">
            {all.length} associations classées par pays et par ville. Demandez à rejoindre celles qui vous concernent.
          </p>
        </div>
        <AssociationBrowser
          associations={all}
          hrefBase="/espace/associations"
          initialCountry={member.country}
          joinable
          memberOf={[...mineIds]}
        />
      </section>
    </div>
  )
}

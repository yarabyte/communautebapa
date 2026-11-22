import type { Metadata } from "next"
import { Suspense } from "react"
import { Users } from "lucide-react"

import { DirectoryFilters } from "@/components/espace/directory-filters"
import { MemberCard } from "@/components/espace/member-card"
import { PageHeader } from "@/components/espace/page-header"
import { getCountries, getMembers, getQuartiers } from "@/lib/data/members"

export const metadata: Metadata = { title: "Annuaire des membres" }

type SearchParams = Promise<{ q?: string; quartier?: string; pays?: string; profession?: string }>

export default async function AnnuairePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const [members, quartiers, countries] = await Promise.all([
    getMembers({ status: "ACTIVE", q: sp.q, quartierId: sp.quartier, country: sp.pays, profession: sp.profession }),
    getQuartiers(),
    getCountries(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Annuaire"
        title="Annuaire des membres"
        description="Retrouvez les filles et fils de Bapa par quartier d'origine, pays de résidence ou profession. L'annuaire est aussi accessible au public."
      />
      <Suspense>
        <DirectoryFilters quartiers={quartiers} countries={countries} />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        {members.length} membre{members.length > 1 ? "s" : ""} trouvé{members.length > 1 ? "s" : ""}
      </p>
      {members.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center">
          <Users className="size-10 text-or" />
          <p className="font-medium text-brun">Aucun membre ne correspond à votre recherche</p>
          <p className="text-sm text-muted-foreground">Essayez d&apos;élargir les filtres.</p>
        </div>
      )}
    </div>
  )
}

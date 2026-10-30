import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Building2, Store } from "lucide-react"

import { PageHeader } from "@/components/espace/page-header"
import { BusinessCard } from "@/components/shared/business-card"
import { BusinessFilterBar } from "@/components/shared/business-filter-bar"
import { Button } from "@/components/ui/button"
import { getBusinessCountries, getBusinesses, getBusinessStats, getSectors } from "@/lib/data/businesses"

export const metadata: Metadata = { title: "Entrepreneurs Bapa" }

type SearchParams = Promise<{ q?: string; secteur?: string; pays?: string }>

export default async function EspaceEntrepreneursPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, secteur, pays } = await searchParams
  const [list, sectors, countries, stats] = await Promise.all([
    getBusinesses({ q, sectorId: secteur, country: pays }),
    getSectors(),
    getBusinessCountries(),
    getBusinessStats(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Économie"
        title="Entrepreneurs Bapa"
        description={`${stats.published} entreprises tenues par ${stats.entrepreneurs} membres. Faites travailler la communauté et recommandez celles que vous connaissez.`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/espace/emplois">
                <BriefcaseBusiness /> Offres d&apos;emploi ({stats.openJobs})
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/espace/mes-entreprises">
                <Building2 /> Mes entreprises
              </Link>
            </Button>
          </>
        }
      />
      <Suspense>
        <BusinessFilterBar sectors={sectors} countries={countries} />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        {list.length} entreprise{list.length > 1 ? "s" : ""} trouvée{list.length > 1 ? "s" : ""}
      </p>
      {list.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((b) => (
            <BusinessCard key={b.id} business={b} href={`/espace/entrepreneurs/${b.slug}`} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center">
          <Store className="size-10 text-or" />
          <p className="font-medium text-brun">Aucune entreprise ne correspond à votre recherche</p>
          <p className="text-sm text-muted-foreground">Essayez d&apos;élargir les filtres.</p>
        </div>
      )}
    </div>
  )
}

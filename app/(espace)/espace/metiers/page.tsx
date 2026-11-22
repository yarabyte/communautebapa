import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Store } from "lucide-react"

import { PageHeader } from "@/components/espace/page-header"
import { SkillsCatalog, SkillsSearchBar } from "@/components/espace/skills-catalog"
import { Button } from "@/components/ui/button"
import { getSkillsCatalog } from "@/lib/data/businesses"

export const metadata: Metadata = { title: "Annuaire des métiers et expertise" }

export default async function EspaceMetiersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const catalog = await getSkillsCatalog({ q })
  const total = catalog.metiers.length + catalog.expertises.length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Annuaire"
        title="Annuaire des métiers et expertise"
        description="Parcourez les métiers et expertises proposés par les entrepreneurs de la communauté, puis ouvrez les entreprises concernées."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/espace/entrepreneurs">
              <Store /> Annuaire des entrepreneurs
            </Link>
          </Button>
        }
      />
      <Suspense>
        <SkillsSearchBar />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        {total} entrée{total > 1 ? "s" : ""}
        {q ? ` pour « ${q} »` : ""}
      </p>
      <SkillsCatalog metiers={catalog.metiers} expertises={catalog.expertises} />
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { BriefcaseBusiness, Plus } from "lucide-react"

import { PageHeader } from "@/components/espace/page-header"
import { JobCard } from "@/components/shared/job-card"
import { Button } from "@/components/ui/button"
import { getJobOffers } from "@/lib/data/businesses"

export const metadata: Metadata = { title: "Offres d'emploi" }

export default async function EspaceEmploisPage() {
  const jobs = await getJobOffers()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Économie"
        title="Offres d'emploi"
        description="Emplois, stages et missions proposés par les entrepreneurs de la communauté, y compris les offres réservées aux membres."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/espace/mes-entreprises">
              <Plus /> Publier une offre
            </Link>
          </Button>
        }
      />
      {jobs.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} businessHref={`/espace/entrepreneurs/${j.business.slug}`} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center">
          <BriefcaseBusiness className="size-10 text-or" />
          <p className="font-medium text-brun">Aucune offre ouverte pour le moment</p>
        </div>
      )}
    </div>
  )
}

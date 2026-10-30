import type { Metadata } from "next"

import { PageHero } from "@/components/brand/page-hero"
import { JobCard } from "@/components/shared/job-card"
import { getJobOffers } from "@/lib/data/businesses"

export const metadata: Metadata = { title: "Offres d'emploi", description: "Emplois, stages et missions proposés par les entrepreneurs Bapa." }

export default async function EmploisPublicPage() {
  const jobs = await getJobOffers({ publicOnly: true })

  return (
    <>
      <PageHero
        image="/images/paysage-bapa.png"
        eyebrow="Entrepreneurs Bapa"
        title="Offres d'emploi"
        description="Emplois, stages et missions proposés par les entreprises de la communauté."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Entrepreneurs", href: "/entrepreneurs" }, { label: "Offres d'emploi" }]}
      />
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        {jobs.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Aucune offre ouverte pour le moment.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} businessHref={`/entrepreneurs/${j.business.slug}`} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

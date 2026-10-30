import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { BusinessCard } from "@/components/shared/business-card"
import { BusinessFilterBar } from "@/components/shared/business-filter-bar"
import { getBusinessCountries, getBusinesses, getBusinessStats, getJobOffers, getSectors } from "@/lib/data/businesses"

export const metadata: Metadata = {
  title: "Entrepreneurs Bapa",
  description: "Entreprises, commerces et cabinets tenus par des filles et fils de Bapa, au Cameroun et dans la diaspora.",
}

export default async function EntrepreneursPage({ searchParams }: { searchParams: Promise<{ q?: string; secteur?: string; pays?: string }> }) {
  const { q, secteur, pays } = await searchParams
  const [list, sectors, countries, stats, jobs] = await Promise.all([
    getBusinesses({ publicOnly: true, q, sectorId: secteur, country: pays }),
    getSectors(),
    getBusinessCountries(),
    getBusinessStats(),
    getJobOffers({ publicOnly: true }),
  ])

  return (
    <>
      <PageHero
        image="/images/gastronomie-bapa.jpg"
        eyebrow="Économie communautaire"
        title="Entrepreneurs Bapa"
        description="Commerces, cabinets, ateliers et exploitations tenus par des filles et fils de Bapa. Faites travailler la communauté."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Entrepreneurs" }]}
        stats={[
          { title: `${stats.published} entreprises`, text: "Validées par la communauté" },
          { title: `${stats.openJobs} offres d'emploi`, text: "Publiées par les entrepreneurs" },
        ]}
      />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
        <Suspense>
          <BusinessFilterBar sectors={sectors} countries={countries} />
        </Suspense>

        {(q || secteur || pays) && (
          <p className="mt-4 text-sm text-muted-foreground">
            {list.length} entreprise{list.length > 1 ? "s" : ""} trouvée{list.length > 1 ? "s" : ""}
          </p>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <BusinessCard key={b.id} business={b} href={`/entrepreneurs/${b.slug}`} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Aucune entreprise publique ne correspond à votre recherche.</p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Certaines fiches sont réservées aux membres connectés.{" "}
          <Link href="/connexion?redirect=/espace/entrepreneurs" className="text-terre hover:underline">
            Se connecter pour tout voir
          </Link>
        </p>

        {jobs.length > 0 && (
          <Link
            href="/entrepreneurs/emplois"
            className="mt-10 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 transition-colors hover:border-terre/40"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-olive/15 text-olive">
              <BriefcaseBusiness className="size-6" />
            </span>
            <span className="flex-1">
              <span className="block font-medium text-brun">{jobs.length} offres d&apos;emploi et de stage</span>
              <span className="text-sm text-muted-foreground">Publiées par les entrepreneurs de la communauté</span>
            </span>
            <ArrowRight className="size-5 text-terre" />
          </Link>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-or/40 bg-creme-light p-10 text-center">
          <h2 className="font-heading text-2xl text-brun">Vous êtes entrepreneur ?</h2>
          <p className="max-w-xl text-brun-soft">
            Créez votre compte membre, puis présentez votre entreprise : services, contacts, adresse. Chaque fiche est vérifiée avant
            publication.
          </p>
          <CtaLink href="/inscription" diamond>
            Créer mon compte
          </CtaLink>
        </div>
      </section>
    </>
  )
}

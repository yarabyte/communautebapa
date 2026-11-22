import type { Metadata } from "next"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { AssociationBrowser } from "@/components/shared/association-browser"
import { getAssociationStats, getAssociations } from "@/lib/data/associations"

export const metadata: Metadata = { title: "Associations" }

export default async function AssociationsPage({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams
  const [list, stats] = await Promise.all([getAssociations({ publicOnly: true }), getAssociationStats()])

  return (
    <>
      <PageHero
        image="/images/festival-bapa-2023.png"
        eyebrow="Vie associative"
        title="Les associations Bapa"
        description="Du quartier d'origine au village jusqu'aux grandes villes du Cameroun et à la diaspora : retrouvez les associations Bapa classées par pays et par ville."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Associations" }]}
        stats={[
          { title: String(stats.total), text: "associations" },
          { title: String(stats.countries), text: "pays" },
          { title: String(stats.cities), text: "villes" },
          { title: String(stats.diaspora), text: "dans la diaspora" },
        ]}
      />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <AssociationBrowser associations={list} hrefBase="/associations" initialCountry={pays} />

        <div className="relative mt-14 overflow-hidden rounded-3xl border border-or/40 bg-gradient-to-br from-creme-light via-creme to-accent/40 p-7 sm:p-8">
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl tracking-wide text-brun">Votre association n&apos;est pas encore là ?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brun-soft">
                Les responsables d&apos;associations Bapa peuvent demander leur référencement après inscription. Le bureau de la
                communauté valide chaque demande.
              </p>
            </div>
            <CtaLink href="/inscription" diamond className="shrink-0">
              Créer mon compte
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  )
}

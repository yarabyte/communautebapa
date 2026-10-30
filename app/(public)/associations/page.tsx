import type { Metadata } from "next"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { AssociationBrowser } from "@/components/shared/association-browser"
import { getAssociationStats, getAssociations } from "@/lib/data/associations"

export const metadata: Metadata = { title: "Associations" }

export default async function AssociationsPage({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams
  const [list, stats] = await Promise.all([getAssociations({ publicOnly: true }), getAssociationStats()])

  const figures = [
    { value: stats.total, label: "associations" },
    { value: stats.countries, label: "pays" },
    { value: stats.cities, label: "villes" },
    { value: stats.diaspora, label: "dans la diaspora" },
  ]

  return (
    <>
      <PageHero
        image="/images/festival-bapa-2023.png"
        eyebrow="Vie associative"
        title="Les associations Bapa"
        description="Du quartier d'origine au village jusqu'aux grandes villes du Cameroun et à la diaspora : retrouvez les associations Bapa classées par pays et par ville."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Associations" }]}
      />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <dl className="mb-6 flex flex-wrap gap-x-8 gap-y-2">
          {figures.map((f) => (
            <div key={f.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{f.label}</dt>
              <dd className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-semibold text-primary">{f.value}</span>
                <span className="text-sm text-muted-foreground">{f.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <AssociationBrowser associations={list} hrefBase="/associations" initialCountry={pays} />

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-or/40 bg-creme-light p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-xl text-brun">Votre association n&apos;est pas encore là ?</h2>
            <p className="mt-1 max-w-2xl text-sm text-brun-soft">
              Les responsables d&apos;associations Bapa peuvent demander leur référencement après inscription. Le bureau de la communauté
              valide chaque demande.
            </p>
          </div>
          <CtaLink href="/inscription" diamond className="shrink-0">
            Créer mon compte
          </CtaLink>
        </div>
      </section>
    </>
  )
}

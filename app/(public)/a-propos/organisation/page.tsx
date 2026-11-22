import type { Metadata } from "next"

import { PageHero } from "@/components/brand/page-hero"

export const metadata: Metadata = { title: "Organisation des communautés" }

const levels = [
  {
    title: "Au village",
    text: "Les quartiers d'origine, les réunions des hommes et des femmes, et les cercles qui animent la vie à Bapa.",
  },
  {
    title: "Dans les villes du Cameroun",
    text: "Une communauté par ville, souvent rattachée à l'ADEVIPA, avec ses réunions d'hommes, de femmes et ses groupes.",
  },
  {
    title: "Dans la diaspora",
    text: "Une association par pays ou par ville d'accueil, pour garder le lien avec le village et accueillir les nouveaux arrivants.",
  },
  {
    title: "La communauté en ligne",
    text: "Un espace commun pour l'annuaire, les projets, les événements et les documents, au service de toutes ces associations.",
  },
]

export default function OrganisationPage() {
  return (
    <>
      <PageHero
        image="/images/paysage-bapa.png"
        eyebrow="La communauté"
        title="Organisation des communautés du Cameroun et de la diaspora"
        description="Du quartier d'origine jusqu'aux associations de la diaspora, chaque groupe a sa place."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "La communauté", href: "/a-propos" },
          { label: "Organisation" },
        ]}
      />
      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-16 sm:grid-cols-2 sm:px-8">
        {levels.map((level) => (
          <article key={level.title} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl text-brun">{level.title}</h2>
            <p className="mt-2 leading-relaxed text-brun-soft">{level.text}</p>
          </article>
        ))}
      </section>
    </>
  )
}

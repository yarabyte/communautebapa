import type { Metadata } from "next"

import { PageHero } from "@/components/brand/page-hero"

export const metadata: Metadata = { title: "Missions des communautés" }

const missions = [
  {
    title: "Garder le lien",
    text: "Permettre aux filles et fils de Bapa, au village, dans les villes et dans la diaspora, de se retrouver et de rester en contact.",
  },
  {
    title: "Organiser l'entraide",
    text: "Accueillir les nouveaux arrivants, soutenir les membres dans les joies et les épreuves, et transmettre les usages du village.",
  },
  {
    title: "Porter les projets du village",
    text: "Relayer les chantiers d'eau, de santé, d'éducation et de patrimoine, et rendre compte des contributions.",
  },
  {
    title: "Représenter Bapa là où vivent ses enfants",
    text: "Chaque communauté de ville ou de pays est le relais local de la grande communauté, en lien avec la chefferie.",
  },
]

export default function MissionsPage() {
  return (
    <>
      <PageHero
        image="/images/chefferie-bapa.jpg"
        eyebrow="La communauté"
        title="Missions des communautés"
        description="Ce que les communautés Bapa, au Cameroun et dans la diaspora, sont appelées à faire ensemble."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "La communauté", href: "/a-propos" },
          { label: "Missions" },
        ]}
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <ol className="flex flex-col gap-4">
          {missions.map((mission, index) => (
            <li key={mission.title} className="flex gap-5 rounded-2xl border border-or/30 bg-card p-5">
              <span className="font-heading text-outline-dark text-3xl leading-none">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-heading text-lg text-brun">{mission.title}</h2>
                <p className="mt-1.5 leading-relaxed text-brun-soft">{mission.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

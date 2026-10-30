import type { Metadata } from "next"
import { Handshake, HeartHandshake, Landmark, Scale, ShieldCheck, Sprout } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { BapaMotif } from "@/components/brand/pattern"
import { Pill } from "@/components/brand/pill"
import { SectionHeading } from "@/components/brand/section-heading"

export const metadata: Metadata = { title: "La communauté et sa charte" }

const values = [
  { icon: Landmark, title: "Respect de la chefferie", text: "La communauté agit en harmonie avec Sa Majesté, les notables et les institutions coutumières de Bapa." },
  { icon: Handshake, title: "Unité", text: "Fils et filles du village, des villes et de la diaspora : une seule famille, sans distinction." },
  { icon: HeartHandshake, title: "Entraide", text: "Soutien dans les joies et les épreuves, accueil des jeunes, solidarité entre membres." },
  { icon: Sprout, title: "Développement", text: "Des projets concrets pour l'eau, la santé, l'éducation et le patrimoine du village." },
  { icon: Scale, title: "Transparence", text: "Contributions tracées, reçus systématiques, rapports financiers publiés aux membres." },
  { icon: ShieldCheck, title: "Bienveillance", text: "Des échanges courtois, sans propos politiques partisans, commerciaux ou injurieux." },
]

const charter = [
  "Toute personne originaire de Bapa, par sa naissance, sa filiation ou son alliance, peut demander à devenir membre.",
  "L'inscription est validée par un responsable de la communauté ou d'une association, qui peut demander des informations complémentaires.",
  "Chaque membre s'engage à fournir des informations exactes sur son identité et ses origines.",
  "Les informations de l'annuaire sont réservées aux membres et ne peuvent être utilisées à des fins commerciales.",
  "Les contributions aux projets sont volontaires. Elles font l'objet d'un reçu et sont affectées au projet choisi.",
  "Le forum et la messagerie sont des espaces d'échange respectueux. Les modérateurs peuvent retirer tout contenu contraire à la charte.",
  "Tout manquement grave peut entraîner la suspension du compte, après avis du bureau de la communauté.",
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        image="/images/chefferie-bapa.jpg"
        eyebrow="Qui sommes-nous"
        title="La communauté Bapa"
        description="Un espace créé par la chefferie et les associations pour rassembler toutes celles et ceux qui ont Bapa au cœur."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "La communauté" }]}
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div className="flex flex-col gap-5">
          <Pill>Notre raison d&apos;être</Pill>
          <h2 className="font-heading text-3xl leading-tight text-brun sm:text-4xl">Garder le lien avec la terre des rochers</h2>
          <p className="leading-relaxed text-brun-soft">
            Au cœur des Hauts-Plateaux Bamiléké, à l&apos;Ouest du Cameroun, le Royaume Bapa est gardien d&apos;un patrimoine vivant. Ses
            enfants vivent aujourd&apos;hui à Yaoundé, Douala, Paris, Montréal ou Houston.
          </p>
          <p className="leading-relaxed text-brun-soft">
            La communauté Bapa leur offre un espace commun : retrouver les siens, rejoindre son association, suivre la vie du village
            et participer à son développement.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-border bg-card p-5">
              <v.icon className="size-7 text-terre" />
              <h3 className="font-heading mt-4 text-base text-brun">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brun-soft">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="charte" className="relative isolate overflow-hidden border-t border-or/30 bg-creme-dark py-20">
        <BapaMotif fade="top" />
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionHeading align="center" eyebrow="Engagements" title="La charte de la communauté" description="Chaque membre l'accepte lors de son inscription." />
          <ol className="mt-12 flex flex-col gap-4">
            {charter.map((c, i) => (
              <li key={i} className="flex gap-5 rounded-2xl border border-or/30 bg-creme-light p-5">
                <span className="font-heading text-outline-dark text-3xl leading-none">{String(i + 1).padStart(2, "0")}</span>
                <p className="leading-relaxed text-brun">{c}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex justify-center">
            <CtaLink href="/inscription" size="lg" diamond>
              J&apos;adhère et je m&apos;inscris
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  )
}

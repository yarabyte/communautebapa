import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, BookText, CalendarClock, CalendarDays, Globe2, Landmark, MapPin, Users } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { Pill } from "@/components/brand/pill"
import { getAssociation, getAssociations } from "@/lib/data/associations"
import { getEvents } from "@/lib/data/content"
import { formatDate } from "@/lib/format"
import { associationCategoryLabels } from "@/lib/labels"

export async function generateStaticParams() {
  return (await getAssociations({ publicOnly: true })).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAssociation((await params).slug)
  return { title: a?.name ?? "Association" }
}

export default async function AssociationPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const association = await getAssociation(slug)
  if (!association || !association.isPublic) notFound()
  const events = await getEvents({ associationId: association.id, publicOnly: true, upcoming: true })

  const facts = [
    { icon: Globe2, label: "Pays", value: association.country },
    association.city && { icon: MapPin, label: "Ville", value: association.region ? `${association.city} · ${association.region}` : association.city },
    !association.city && association.region && { icon: MapPin, label: "Région", value: association.region },
    association.fullName && { icon: BookText, label: "Nom complet", value: association.fullName },
    { icon: Users, label: "Membres", value: `${association.membersCount} membres` },
    association.foundedYear && { icon: Landmark, label: "Fondée en", value: String(association.foundedYear) },
    association.meetingInfo && { icon: CalendarClock, label: "Rencontres", value: association.meetingInfo },
    association.adevipa && { icon: BadgeCheck, label: "Affiliation", value: "Rattachée à l'ADEVIPA" },
  ].filter((f) => !!f)

  return (
    <>
      <PageHero
        image={association.cover}
        eyebrow={associationCategoryLabels[association.category]}
        title={association.name}
        description={association.description}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Associations", href: "/associations" },
          { label: association.country, href: `/associations?pays=${encodeURIComponent(association.country)}` },
          { label: association.shortName },
        ]}
        actions={
          <CtaLink href={`/inscription?association=${association.slug}`} diamond>
            Rejoindre cette association
          </CtaLink>
        }
      />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="flex gap-3 bg-card px-4 py-3">
              <f.icon className="mt-0.5 size-4 shrink-0 text-or" />
              <div className="min-w-0">
                <dt className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{f.label}</dt>
                <dd className="text-sm text-brun">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-4">
            <Pill>Notre mission</Pill>
            <p className="font-heading text-xl leading-snug text-brun sm:text-2xl">{association.mission}</p>
            <p className="text-sm leading-relaxed text-brun-soft">
              L&apos;association fait partie de la communauté Bapa. Ses membres accèdent dans leur espace aux réunions, aux documents
              (statuts, procès-verbaux) et à la discussion de groupe.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-heading text-lg text-brun">
              <CalendarDays className="size-4 text-or" /> Prochains rendez-vous
            </h2>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Aucun rendez-vous public programmé.{" "}
                <Link href="/evenements" className="text-terre hover:underline">
                  Voir l&apos;agenda de la communauté
                </Link>
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {events.map((e) => (
                  <li key={e.id}>
                    <Link href={`/evenements/${e.slug}`} className="group flex items-center gap-3 py-2.5">
                      <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-accent py-1 text-terre">
                        <span className="font-heading text-lg leading-none">{formatDate(e.startsAt, "d")}</span>
                        <span className="text-[10px] uppercase">{formatDate(e.startsAt, "MMM")}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-brun group-hover:text-terre">{e.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{e.location}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

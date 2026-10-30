import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { Progress } from "@/components/ui/progress"
import { associationById } from "@/lib/data/associations"
import { getEvent, getEvents, isPast } from "@/lib/data/content"
import { formatDate, percent } from "@/lib/format"
import { eventCategoryLabels } from "@/lib/labels"

export async function generateStaticParams() {
  return (await getEvents({ publicOnly: true })).map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEvent((await params).slug)
  return { title: e?.title ?? "Événement" }
}

export default async function EventPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event || !event.isPublic) notFound()
  const association = associationById(event.associationId)
  const past = isPast(event.startsAt)

  return (
    <>
      <PageHero
        image={event.image}
        eyebrow={eventCategoryLabels[event.category]}
        title={event.title}
        description={event.excerpt}
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Événements", href: "/evenements" }, { label: event.title }]}
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[2fr_1fr] lg:px-12">
        <div className="flex flex-col gap-5">
          <h2 className="font-heading text-2xl text-brun">À propos de l&apos;événement</h2>
          <p className="text-lg leading-relaxed text-brun-soft">{event.description}</p>
          {association && (
            <p className="text-sm text-muted-foreground">
              Organisé par <span className="font-medium text-brun">{association.name}</span>
            </p>
          )}
        </div>
        <aside className="flex h-fit flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-28">
          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex gap-3">
              <CalendarDays className="size-5 text-or" />
              <span>
                {formatDate(event.startsAt, "EEEE d MMMM yyyy")}
                {event.endsAt && <> au {formatDate(event.endsAt, "EEEE d MMMM yyyy")}</>}
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="size-5 text-or" /> {formatDate(event.startsAt, "HH'h'mm")}
            </li>
            <li className="flex gap-3">
              <MapPin className="size-5 text-or" /> {event.location}
            </li>
            <li className="flex gap-3">
              <Users className="size-5 text-or" /> {event.registered} inscrits sur {event.capacity} places
            </li>
          </ul>
          <Progress value={percent(event.registered, event.capacity)} className="h-2" />
          {past ? (
            <p className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">Cet événement est terminé.</p>
          ) : (
            <>
              <CtaLink href={`/connexion?redirect=/espace/evenements`} diamond>
                S&apos;inscrire à l&apos;événement
              </CtaLink>
              <p className="text-center text-xs text-muted-foreground">L&apos;inscription se fait depuis votre espace membre.</p>
            </>
          )}
        </aside>
      </section>
    </>
  )
}

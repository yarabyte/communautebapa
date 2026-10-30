import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Clock, Lock, MapPin, Users } from "lucide-react"

import { Pill } from "@/components/brand/pill"
import { EventRegistration } from "@/components/espace/event-registration"
import { Progress } from "@/components/ui/progress"
import { associationById } from "@/lib/data/associations"
import { getEvent, isPast } from "@/lib/data/content"
import { formatDate, percent } from "@/lib/format"
import { eventCategoryLabels } from "@/lib/labels"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEvent((await params).slug)
  return { title: e?.title ?? "Événement" }
}

export default async function EspaceEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()
  const association = associationById(event.associationId)
  const past = isPast(event.startsAt)

  return (
    <div className="flex flex-col gap-6">
      <Link href="/espace/evenements" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Tous les événements
      </Link>
      <div className="relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl p-6 text-creme-light sm:p-8">
        <Image src={event.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="bapa-photo-overlay absolute inset-0 -z-10" />
        <div className="flex flex-wrap gap-2">
          <Pill tone="glass">{eventCategoryLabels[event.category]}</Pill>
          {!event.isPublic && (
            <Pill tone="glass">
              <Lock className="size-3" /> Réservé aux membres
            </Pill>
          )}
        </div>
        <h1 className="font-heading mt-3 text-3xl sm:text-4xl">{event.title}</h1>
        <p className="mt-2 max-w-2xl text-creme-light/85">{event.excerpt}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl text-brun">Programme et informations</h2>
          <p className="mt-4 leading-relaxed text-brun-soft">{event.description}</p>
          {association && (
            <Link href={`/espace/associations/${association.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm text-terre hover:underline">
              Organisé par {association.name}
            </Link>
          )}
        </section>
        <aside className="flex h-fit flex-col gap-5 rounded-3xl border border-border bg-card p-6">
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex gap-3">
              <CalendarDays className="size-5 text-or" />
              {formatDate(event.startsAt, "EEEE d MMMM yyyy")}
              {event.endsAt && ` au ${formatDate(event.endsAt, "d MMMM")}`}
            </li>
            <li className="flex gap-3">
              <Clock className="size-5 text-or" /> {formatDate(event.startsAt, "HH'h'mm")}
            </li>
            <li className="flex gap-3">
              <MapPin className="size-5 text-or" /> {event.location}
            </li>
            <li className="flex gap-3">
              <Users className="size-5 text-or" /> {event.registered} / {event.capacity} inscrits
            </li>
          </ul>
          <Progress value={percent(event.registered, event.capacity)} className="h-2" />
          {past ? (
            <p className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">Événement terminé</p>
          ) : (
            <EventRegistration title={event.title} initiallyRegistered={event.id === "e2"} withTransport={event.category === "FESTIVAL"} />
          )}
        </aside>
      </div>
    </div>
  )
}

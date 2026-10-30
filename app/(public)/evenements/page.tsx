import type { Metadata } from "next"

import { PageHero } from "@/components/brand/page-hero"
import { EventCard } from "@/components/shared/event-card"
import { FilterPills } from "@/components/shared/filter-pills"
import { getEvents } from "@/lib/data/content"

export const metadata: Metadata = { title: "Événements" }

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const { periode } = await searchParams
  const past = periode === "passes"
  const events = await getEvents({ publicOnly: true, upcoming: !past })

  return (
    <>
      <PageHero
        image="/images/maison-calebasse-bapa.jpg"
        eyebrow="Agenda de la communauté"
        title="Événements"
        description="Festival Pa'a Ngouo'ok, journées culturelles, galas de solidarité : les grands rendez-vous ouverts à tous. Les réunions internes sont visibles dans l'espace membre."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Événements" }]}
      />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
        <FilterPills
          basePath="/evenements"
          param="periode"
          current={periode}
          allLabel="À venir"
          options={[{ value: "passes", label: "Passés" }]}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} href={`/evenements/${e.slug}`} past={past} />
          ))}
        </div>
        {events.length === 0 && <p className="mt-10 text-center text-muted-foreground">Aucun événement pour le moment.</p>}
      </section>
    </>
  )
}

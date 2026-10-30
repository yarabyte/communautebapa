import type { Metadata } from "next"

import { PageHeader } from "@/components/espace/page-header"
import { EventCard } from "@/components/shared/event-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEvents } from "@/lib/data/content"

export const metadata: Metadata = { title: "Événements" }

const MY_EVENT_IDS = ["e1", "e2"]

export default async function EspaceEventsPage() {
  const [upcoming, past] = await Promise.all([getEvents({ upcoming: true }), getEvents({ upcoming: false })])
  const mine = upcoming.filter((e) => MY_EVENT_IDS.includes(e.id))

  const grid = (list: typeof upcoming, isPast = false) =>
    list.length ? (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => (
          <EventCard key={e.id} event={e} href={`/espace/evenements/${e.slug}`} past={isPast} />
        ))}
      </div>
    ) : (
      <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">Aucun événement.</p>
    )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Agenda" title="Événements" description="Événements publics et réunions réservées aux membres de vos associations." />
      <Tabs defaultValue="upcoming" className="gap-6">
        <TabsList className="h-10! rounded-full bg-muted p-1">
          <TabsTrigger value="upcoming" className="rounded-full px-4 data-active:bg-card">
            À venir ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="rounded-full px-4 data-active:bg-card">
            Mes inscriptions ({mine.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-full px-4 data-active:bg-card">
            Passés
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">{grid(upcoming)}</TabsContent>
        <TabsContent value="mine">{grid(mine)}</TabsContent>
        <TabsContent value="past">{grid(past, true)}</TabsContent>
      </Tabs>
    </div>
  )
}

import type { Metadata } from "next"

import { EventsAdminTable } from "@/components/admin/content-tables"
import { PageHeader } from "@/components/espace/page-header"
import { associationById, getAssociations } from "@/lib/data/associations"
import { getEvents, isPast } from "@/lib/data/content"

export const metadata: Metadata = { title: "Événements" }

export default async function AdminEvenementsPage() {
  const [events, associations] = await Promise.all([getEvents(), getAssociations()])
  const rows = events.map((e) => ({ ...e, associationName: associationById(e.associationId)?.name, past: isPast(e.startsAt) }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Événements" description="Planifiez les rencontres, suivez les inscriptions et publiez sur le site public." />
      <EventsAdminTable data={rows} associations={associations.map((a) => ({ value: a.id, label: a.name }))} />
    </div>
  )
}

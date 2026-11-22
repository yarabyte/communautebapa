import type { Metadata } from "next"
import { Ban, Clock, UserCheck, Users } from "lucide-react"

import { MembersTable } from "@/components/admin/members-table"
import { PageHeader } from "@/components/espace/page-header"
import { StatCard } from "@/components/espace/stat-card"
import { getMemberAssociations } from "@/lib/data/associations"
import { getMembers, getQuartierName, getQuartiers } from "@/lib/data/members"

export const metadata: Metadata = { title: "Membres" }

export default async function AdminMembresPage() {
  const [members, quartiers] = await Promise.all([getMembers(), getQuartiers()])
  const rows = await Promise.all(
    members.map(async (m) => ({
      ...m,
      quartierName: getQuartierName(m.quartierId, quartiers),
      associationsCount: (await getMemberAssociations(m.id)).length,
    }))
  )
  const count = (s: string) => members.filter((m) => m.status === s).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Administration"
        title="Membres"
        description="Créez, modifiez, suspendez ou supprimez les comptes. Les invitations envoient un mot de passe temporaire par email."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total" value={members.length} />
        <StatCard icon={UserCheck} label="Actifs" value={count("ACTIVE")} tone="olive" />
        <StatCard icon={Clock} label="En attente" value={count("PENDING")} tone="or" />
        <StatCard icon={Ban} label="Suspendus" value={count("SUSPENDED")} tone="indigo" />
      </div>
      <MembersTable members={rows} quartiers={quartiers.map((q) => ({ value: q.id, label: q.name }))} />
    </div>
  )
}

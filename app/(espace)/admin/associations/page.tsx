import type { Metadata } from "next"

import { AssociationsAdminTable } from "@/components/admin/content-tables"
import { PageHeader } from "@/components/espace/page-header"
import { getAssociations } from "@/lib/data/associations"
import { fullName, getMembers, memberById } from "@/lib/data/members"

export const metadata: Metadata = { title: "Associations" }

export default async function AdminAssociationsPage() {
  const [associations, members] = await Promise.all([getAssociations(), getMembers({ status: "ACTIVE" })])
  const rows = associations.map((a) => {
    const president = a.presidentId ? memberById(a.presidentId) : undefined
    return { ...a, presidentName: president ? fullName(president) : "—" }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Associations" description={`${associations.length} associations référencées dans ${new Set(associations.map((a) => a.country)).size} pays. Désignez leurs responsables et gérez leur visibilité.`} />
      <AssociationsAdminTable data={rows} members={members.map((m) => ({ value: m.id, label: fullName(m) }))} />
    </div>
  )
}

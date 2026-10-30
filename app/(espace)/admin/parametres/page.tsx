import type { Metadata } from "next"

import { AdminSettings } from "@/components/admin/admin-settings"
import { PageHeader } from "@/components/espace/page-header"
import { getQuartiers } from "@/lib/data/members"

export const metadata: Metadata = { title: "Paramètres" }

export default async function AdminParametresPage() {
  const quartiers = await getQuartiers()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Paramètres" description="Configuration générale de la plateforme communautaire." />
      <AdminSettings quartiers={quartiers} />
    </div>
  )
}

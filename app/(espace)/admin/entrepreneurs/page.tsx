import type { Metadata } from "next"
import { BriefcaseBusiness, Clock, Store, Users } from "lucide-react"

import { BusinessesAdmin } from "@/components/admin/businesses-admin"
import { PageHeader } from "@/components/espace/page-header"
import { StatCard } from "@/components/espace/stat-card"
import { getBusinesses, getBusinessStats, getSectors } from "@/lib/data/businesses"

export const metadata: Metadata = { title: "Entrepreneurs" }

export default async function AdminEntrepreneursPage() {
  const [all, sectors, stats] = await Promise.all([getBusinesses({ status: "ALL" }), getSectors(), getBusinessStats()])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Administration"
        title="Entrepreneurs Bapa"
        description="Validez les fiches avant publication, choisissez l'entrepreneur du mois et gérez la liste des secteurs d'activité."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="À valider" value={stats.pending} tone="or" />
        <StatCard icon={Store} label="Publiées" value={stats.published} tone="olive" />
        <StatCard icon={Users} label="Entrepreneurs" value={stats.entrepreneurs} />
        <StatCard icon={BriefcaseBusiness} label="Offres ouvertes" value={stats.openJobs} />
      </div>
      <BusinessesAdmin businesses={all.filter((b) => b.status !== "DRAFT")} sectors={sectors} />
    </div>
  )
}

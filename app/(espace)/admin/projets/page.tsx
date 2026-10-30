import type { Metadata } from "next"
import { FolderKanban, HandCoins, Target } from "lucide-react"

import { ProjectsAdminTable } from "@/components/admin/content-tables"
import { PageHeader } from "@/components/espace/page-header"
import { StatCard } from "@/components/espace/stat-card"
import { getAssociations } from "@/lib/data/associations"
import { getProjects } from "@/lib/data/projects"
import { formatMoney, percent } from "@/lib/format"

export const metadata: Metadata = { title: "Projets" }

export default async function AdminProjetsPage() {
  const [projects, associations] = await Promise.all([getProjects(), getAssociations()])
  const raised = projects.reduce((s, p) => s + p.raisedXaf, 0)
  const goal = projects.reduce((s, p) => s + p.goalXaf, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Projets du village" description="Définissez les projets, leurs objectifs de collecte et publiez leur avancement." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FolderKanban} label="Projets" value={projects.length} hint={`${projects.filter((p) => p.status === "EN_COURS").length} en cours`} />
        <StatCard icon={HandCoins} label="Collecté" value={formatMoney(raised)} tone="olive" />
        <StatCard icon={Target} label="Taux global" value={`${percent(raised, goal)} %`} tone="or" hint={`Objectif cumulé ${formatMoney(goal)}`} />
      </div>
      <ProjectsAdminTable data={projects} associations={associations.map((a) => ({ value: a.id, label: a.name }))} />
    </div>
  )
}

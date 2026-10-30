import type { Metadata } from "next"
import { FolderKanban, HandCoins, Users } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHeader } from "@/components/espace/page-header"
import { StatCard } from "@/components/espace/stat-card"
import { ProjectCard } from "@/components/shared/project-card"
import { getProjects } from "@/lib/data/projects"
import { formatMoney } from "@/lib/format"

export const metadata: Metadata = { title: "Projets du village" }

export default async function ProjetsPage() {
  const projects = await getProjects()
  const raised = projects.reduce((s, p) => s + p.raisedXaf, 0)
  const contributors = projects.reduce((s, p) => s + p.contributorsCount, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Développement"
        title="Projets du village"
        description="Chaque projet est piloté avec la chefferie et suivi publiquement. Chaque franc est affecté au projet choisi."
        actions={
          <CtaLink href="/espace/contribuer" size="sm" diamond>
            Contribuer
          </CtaLink>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FolderKanban} label="Projets" value={projects.length} hint={`${projects.filter((p) => p.status === "EN_COURS").length} en cours`} />
        <StatCard icon={HandCoins} label="Collecté" value={formatMoney(raised)} tone="or" />
        <StatCard icon={Users} label="Contributions" value={contributors} hint="depuis 2024" tone="olive" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} href={`/espace/projets/${p.slug}`} />
        ))}
      </div>
    </div>
  )
}

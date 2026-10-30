import type { Metadata } from "next"
import { Clock, HandCoins, Users, Wallet } from "lucide-react"

import { ContributionsTable } from "@/components/admin/contributions-table"
import { PageHeader } from "@/components/espace/page-header"
import { StatCard } from "@/components/espace/stat-card"
import { fullName, getMembers, memberById } from "@/lib/data/members"
import { getContributionStats, getContributions, getProjects, projectById } from "@/lib/data/projects"
import { formatMoney } from "@/lib/format"

export const metadata: Metadata = { title: "Contributions" }

export default async function AdminContributionsPage() {
  const [contributions, stats, members, projects] = await Promise.all([getContributions(), getContributionStats(), getMembers({ status: "ACTIVE" }), getProjects()])
  const rows = contributions.map((c) => {
    const member = memberById(c.memberId)
    const recorder = c.recordedById ? memberById(c.recordedById) : undefined
    return {
      ...c,
      memberName: member ? fullName(member) : "—",
      projectTitle: projectById(c.projectId)?.title ?? "—",
      recordedByName: recorder ? fullName(recorder) : undefined,
    }
  })
  const cash = contributions.filter((c) => c.method === "CASH" && c.status === "COMPLETED").reduce((s, c) => s + c.amountXaf, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Trésorerie"
        title="Contributions"
        description="Suivez tous les paiements, confirmez les espèces reçues et exportez la comptabilité."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={HandCoins} label="Total confirmé" value={formatMoney(stats.totalXaf)} hint={`${stats.count} contributions`} />
        <StatCard icon={Clock} label="En attente" value={stats.pending} tone="or" hint="Promesses et paiements en cours" />
        <StatCard icon={Wallet} label="Espèces" value={formatMoney(cash)} tone="olive" hint="Saisies par les trésoriers" />
        <StatCard icon={Users} label="Contributeurs" value={stats.contributors} tone="indigo" />
      </div>
      <ContributionsTable
        data={rows}
        members={members.map((m) => ({ value: m.id, label: fullName(m) }))}
        projects={projects.filter((p) => p.status !== "TERMINE").map((p) => ({ value: p.id, label: p.title }))}
      />
    </div>
  )
}

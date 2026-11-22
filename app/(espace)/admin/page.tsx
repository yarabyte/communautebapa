import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, FolderKanban, HandCoins, Users } from "lucide-react"

import { MethodChart, MonthlyChart } from "@/components/admin/dashboard-charts"
import { MemberAvatar } from "@/components/espace/member-avatar"
import { PageHeader } from "@/components/espace/page-header"
import { SectionCard } from "@/components/espace/section-card"
import { StatCard } from "@/components/espace/stat-card"
import { PaymentMethodIcon } from "@/components/shared/payment-method-icon"
import { ProjectProgress } from "@/components/shared/project-card"
import { getMembers, getPendingRegistrations, getQuartierName, memberById, memberPlace } from "@/lib/data/members"
import { getContributionStats, getContributions, getProjects, projectById } from "@/lib/data/projects"
import { formatMoney, fromNow } from "@/lib/format"

export const metadata: Metadata = { title: "Vue d'ensemble" }

export default async function AdminDashboard() {
  const [members, pending, stats, recent, projects] = await Promise.all([
    getMembers({ status: "ACTIVE" }),
    getPendingRegistrations(),
    getContributionStats(),
    getContributions(),
    getProjects(),
  ])
  const activeProjects = projects.filter((p) => p.status !== "TERMINE")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Vue d'ensemble" description="L'activité de la communauté en un coup d'œil." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Membres actifs" value={members.length} hint="+6 ce mois-ci" />
        <StatCard icon={BadgeCheck} label="Inscriptions à valider" value={pending.length} tone="or" hint={<Link href="/admin/inscriptions" className="text-terre hover:underline">Traiter les demandes</Link>} />
        <StatCard icon={HandCoins} label="Collecté (6 mois)" value={formatMoney(stats.totalXaf)} tone="olive" hint={`${stats.count} contributions · ${stats.pending} en attente`} />
        <StatCard icon={FolderKanban} label="Projets en cours" value={activeProjects.length} tone="indigo" hint={<Link href="/admin/projets" className="text-terre hover:underline">Gérer les projets</Link>} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_1fr]">
        <SectionCard title="Contributions par mois" description="Montants confirmés, contre-valeur en FCFA">
          <MonthlyChart data={stats.byMonth} />
        </SectionCard>
        <SectionCard title="Moyens de paiement" description="Répartition des montants">
          <MethodChart data={stats.byMethod} />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Demandes d'adhésion" href="/admin/inscriptions" contentClassName="flex flex-col gap-3">
          {pending.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <MemberAvatar member={m} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brun">
                  {m.firstName} {m.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {getQuartierName(m.quartierId)} · {memberPlace(m)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{fromNow(m.joinedAt)}</span>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Dernières contributions" href="/admin/contributions" contentClassName="flex flex-col gap-3">
          {recent.slice(0, 5).map((c) => {
            const m = memberById(c.memberId)
            return (
              <div key={c.id} className="flex items-center gap-3">
                <PaymentMethodIcon method={c.method} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brun">
                    {m?.firstName} {m?.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{projectById(c.projectId)?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-terre">{formatMoney(c.amount, c.currency)}</p>
                  <p className="text-xs text-muted-foreground">{fromNow(c.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </SectionCard>
      </div>

      <SectionCard title="Avancement des projets" href="/admin/projets" contentClassName="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {projects
          .filter((p) => p.status !== "TERMINE")
          .map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <p className="font-medium text-brun">{p.title}</p>
              <ProjectProgress project={p} />
            </div>
          ))}
      </SectionCard>
    </div>
  )
}

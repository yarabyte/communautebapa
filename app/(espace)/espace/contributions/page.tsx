import type { Metadata } from "next"
import { CalendarClock, FolderKanban, HandCoins } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHeader } from "@/components/espace/page-header"
import { ReceiptDialog } from "@/components/espace/receipt-dialog"
import { StatCard } from "@/components/espace/stat-card"
import { PaymentMethodIcon } from "@/components/shared/payment-method-icon"
import { ContributionStatusBadge } from "@/components/shared/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCurrentMember } from "@/lib/data/members"
import { getContributions, projectById } from "@/lib/data/projects"
import { formatDate, formatMoney } from "@/lib/format"
import { paymentMethodLabels } from "@/lib/labels"

export const metadata: Metadata = { title: "Mes contributions" }

export default async function ContributionsPage() {
  const member = await getCurrentMember()
  const contributions = await getContributions({ memberId: member.id })
  const done = contributions.filter((c) => c.status === "COMPLETED")
  const total = done.reduce((s, c) => s + c.amountXaf, 0)
  const projectsCount = new Set(done.map((c) => c.projectId)).size

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Village"
        title="Mes contributions"
        description="L'historique de vos dons aux projets du village et vos reçus."
        actions={
          <CtaLink href="/espace/contribuer" size="sm" diamond>
            Nouvelle contribution
          </CtaLink>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={HandCoins} label="Total versé" value={formatMoney(total)} hint="Contre-valeur en FCFA" />
        <StatCard icon={FolderKanban} label="Projets soutenus" value={projectsCount} tone="olive" />
        <StatCard icon={CalendarClock} label="Dernier versement" value={done[0] ? formatDate(done[0].createdAt, "d MMM yyyy") : "—"} tone="or" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="pl-4">Projet</TableHead>
              <TableHead className="hidden md:table-cell">Moyen</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.map((c) => {
              const project = projectById(c.projectId)
              return (
                <TableRow key={c.id}>
                  <TableCell className="pl-4">
                    <p className="font-medium whitespace-normal text-brun">{project?.title}</p>
                    <p className="text-xs text-muted-foreground">{c.reference}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="flex items-center gap-2">
                      <PaymentMethodIcon method={c.method} className="size-7" />
                      {paymentMethodLabels[c.method]}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(c.createdAt, "d MMM yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(c.amount, c.currency)}
                    {c.currency !== "XAF" && <p className="text-xs font-normal text-muted-foreground">{formatMoney(c.amountXaf)}</p>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <ContributionStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <ReceiptDialog contribution={c} projectTitle={project?.title ?? ""} memberName={`${member.firstName} ${member.lastName}`} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

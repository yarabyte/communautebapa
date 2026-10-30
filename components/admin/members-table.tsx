"use client"

import { useMemo, useState } from "react"
import { Ban, Download, Eye, MessageCircle, RotateCcw, ShieldCheck, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { MemberAvatar } from "@/components/espace/member-avatar"
import { MemberStatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import { memberStatusLabels, roleLabels } from "@/lib/labels"
import type { Member, MemberStatus } from "@/lib/types"
import { DataTable, type DataTableColumn } from "./data-table"
import { EntityFormDialog } from "./entity-form-dialog"
import { RowActions } from "./row-actions"

export type MemberRow = Member & { quartierName: string; associationsCount: number }

const columns: DataTableColumn<MemberRow>[] = [
  {
    id: "membre",
    header: "Membre",
    accessorFn: (m) => `${m.firstName} ${m.lastName} ${m.email}`,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <MemberAvatar member={row.original} />
        <div className="min-w-0">
          <p className="font-medium text-brun">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { id: "quartier", header: "Quartier", accessorKey: "quartierName" },
  {
    id: "residence",
    header: "Résidence",
    accessorFn: (m) => [m.city, m.country].filter(Boolean).join(", ") || "—",
  },
  {
    id: "role",
    header: "Rôle",
    accessorFn: (m) => roleLabels[m.role],
    cell: ({ row }) =>
      row.original.role === "MEMBER" ? (
        <span className="text-muted-foreground">Membre</span>
      ) : (
        <Badge className="bg-terre/10 text-terre">{roleLabels[row.original.role]}</Badge>
      ),
  },
  {
    id: "statut",
    header: "Statut",
    accessorFn: (m) => memberStatusLabels[m.status],
    cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
  },
  {
    id: "inscription",
    header: "Inscrit le",
    accessorKey: "joinedAt",
    sortFn: "datetime",
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.joinedAt, "d MMM yyyy")}</span>,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const m = row.original
      return (
        <RowActions
          actions={[
            { label: "Voir le profil", icon: Eye, href: `/espace/annuaire/${m.id}` },
            { label: "Envoyer un message", icon: MessageCircle, href: `/espace/messages?a=${m.id}` },
            { label: "Modifier le rôle", icon: ShieldCheck, toast: "Rôle mis à jour" },
            m.status === "SUSPENDED"
              ? { label: "Réactiver", icon: RotateCcw, toast: `${m.firstName} a été réactivé(e)`, separator: true }
              : { label: "Suspendre", icon: Ban, toast: `${m.firstName} a été suspendu(e)`, separator: true },
            { label: "Supprimer", icon: Trash2, toast: "Compte supprimé", destructive: true },
          ]}
        />
      )
    },
  },
]

export function MembersTable({ members, quartiers }: { members: MemberRow[]; quartiers: { value: string; label: string }[] }) {
  const [status, setStatus] = useState<MemberStatus | "ALL">("ALL")
  const data = useMemo(() => (status === "ALL" ? members : members.filter((m) => m.status === status)), [members, status])

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Nom, email…"
      toolbar={
        <>
          <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus | "ALL")}>
            <SelectTrigger className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {Object.entries(memberStatusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full" onClick={() => toast.success("Export CSV généré", { description: `${data.length} membres exportés.` })}>
            <Download /> Exporter
          </Button>
          <EntityFormDialog
            title="Inviter un membre"
            description="Le membre recevra un lien d'inscription pré-rempli, validé d'office."
            trigger={
              <Button className="rounded-full">
                <UserPlus /> Inviter
              </Button>
            }
            submitLabel="Envoyer l'invitation"
            successMessage="Invitation envoyée"
            fields={[
              { name: "firstName", label: "Prénom", required: true },
              { name: "lastName", label: "Nom", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "phone", label: "Téléphone" },
              { name: "quartier", label: "Quartier d'origine", type: "select", options: quartiers },
              {
                name: "role",
                label: "Rôle",
                type: "select",
                defaultValue: "MEMBER",
                options: Object.entries(roleLabels).map(([value, label]) => ({ value, label })),
              },
            ]}
          />
        </>
      }
    />
  )
}

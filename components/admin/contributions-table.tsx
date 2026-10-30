"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Download, ReceiptText, RotateCcw, Send } from "lucide-react"
import { toast } from "sonner"

import { PaymentMethodIcon } from "@/components/shared/payment-method-icon"
import { ContributionStatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDateTime, formatMoney } from "@/lib/format"
import { contributionStatusLabels, paymentMethodLabels } from "@/lib/labels"
import type { Contribution, ContributionStatus, PaymentMethod } from "@/lib/types"
import { CashEntryDialog } from "./cash-entry-dialog"
import { DataTable, type DataTableColumn } from "./data-table"
import { RowActions } from "./row-actions"

export type ContributionRow = Contribution & { memberName: string; projectTitle: string; recordedByName?: string }

const columns: DataTableColumn<ContributionRow>[] = [
  {
    id: "reference",
    header: "Référence",
    accessorKey: "reference",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-brun">{row.original.reference}</p>
        <p className="text-xs whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
      </div>
    ),
  },
  {
    id: "contributeur",
    header: "Contributeur",
    accessorKey: "memberName",
    cell: ({ row }) => (
      <span>
        {row.original.memberName}
        {row.original.anonymous && <span className="block text-xs text-muted-foreground">Anonyme en public</span>}
      </span>
    ),
  },
  { id: "projet", header: "Projet", accessorKey: "projectTitle", cell: ({ row }) => <span className="whitespace-normal">{row.original.projectTitle}</span> },
  {
    id: "moyen",
    header: "Moyen",
    accessorFn: (c) => paymentMethodLabels[c.method],
    cell: ({ row }) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <PaymentMethodIcon method={row.original.method} className="size-7" />
        <span>
          {paymentMethodLabels[row.original.method]}
          {row.original.recordedByName && <span className="block text-xs text-muted-foreground">par {row.original.recordedByName}</span>}
        </span>
      </span>
    ),
  },
  {
    id: "montant",
    header: "Montant",
    accessorKey: "amountXaf",
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        <p className="font-medium">{formatMoney(row.original.amount, row.original.currency)}</p>
        {row.original.currency !== "XAF" && <p className="text-xs text-muted-foreground">{formatMoney(row.original.amountXaf)}</p>}
      </div>
    ),
  },
  {
    id: "statut",
    header: "Statut",
    accessorFn: (c) => contributionStatusLabels[c.status],
    cell: ({ row }) => <ContributionStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const c = row.original
      return (
        <RowActions
          actions={[
            ...(c.status === "PENDING" ? [{ label: "Confirmer la réception", icon: CheckCircle2, toast: `Contribution ${c.reference} confirmée` }] : []),
            { label: "Voir le reçu", icon: ReceiptText, toast: "Reçu ouvert dans un nouvel onglet" },
            { label: "Renvoyer le reçu", icon: Send, toast: "Reçu renvoyé par email et SMS" },
            ...(c.status === "COMPLETED"
              ? [{ label: "Rembourser", icon: RotateCcw, toast: "Remboursement initié", separator: true, destructive: true }]
              : []),
          ]}
        />
      )
    },
  },
]

type Option = { value: string; label: string }

export function ContributionsTable({ data, members, projects }: { data: ContributionRow[]; members: Option[]; projects: Option[] }) {
  const [status, setStatus] = useState<ContributionStatus | "ALL">("ALL")
  const [method, setMethod] = useState<PaymentMethod | "ALL">("ALL")
  const rows = useMemo(
    () => data.filter((c) => (status === "ALL" || c.status === status) && (method === "ALL" || c.method === method)),
    [data, status, method]
  )

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Référence, membre, projet…"
      toolbar={
        <>
          <Select value={status} onValueChange={(v) => setStatus(v as ContributionStatus | "ALL")}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous statuts</SelectItem>
              {Object.entries(contributionStatusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod | "ALL")}>
            <SelectTrigger className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous moyens</SelectItem>
              {Object.entries(paymentMethodLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full" onClick={() => toast.success("Export comptable généré", { description: `${rows.length} lignes (CSV).` })}>
            <Download /> Exporter
          </Button>
          <CashEntryDialog members={members} projects={projects} />
        </>
      }
    />
  )
}

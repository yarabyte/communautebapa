"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, Download, Eye, MessageCircle, Pencil, RotateCcw, ShieldCheck, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { MemberAvatar } from "@/components/espace/member-avatar"
import { MemberStatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import { memberStatusLabels, roleLabels } from "@/lib/labels"
import type { Member, MemberStatus, Role } from "@/lib/types"
import { DataTable, type DataTableColumn } from "./data-table"
import { EntityFormDialog } from "./entity-form-dialog"
import { RowActions } from "./row-actions"

export type MemberRow = Member & { quartierName: string; associationsCount: number }

export function MembersTable({ members, quartiers }: { members: MemberRow[]; quartiers: { value: string; label: string }[] }) {
  const router = useRouter()
  const [status, setStatus] = useState<MemberStatus | "ALL">("ALL")
  const [editingRole, setEditingRole] = useState<MemberRow>()
  const [editingMember, setEditingMember] = useState<MemberRow>()
  const [roleValue, setRoleValue] = useState<Role>("MEMBER")
  const [pending, setPending] = useState(false)

  const data = useMemo(() => (status === "ALL" ? members : members.filter((m) => m.status === status)), [members, status])

  const refresh = () => router.refresh()

  const patchMember = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(payload.error || "Action impossible")
      return false
    }
    return true
  }

  const invite = async (values: Record<string, string>) => {
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || null,
        quartierId: values.quartier || null,
        role: values.role || "MEMBER",
        status: "ACTIVE",
      }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(payload.error || "Invitation impossible")
      return false
    }
    refresh()
    return true
  }

  const saveEdit = async (values: Record<string, string>) => {
    if (!editingMember) return false
    const ok = await patchMember(editingMember.id, {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || null,
      quartierId: values.quartier || null,
      city: values.city || null,
      country: values.country || null,
      profession: values.profession || null,
      role: values.role,
      status: values.status,
    })
    if (!ok) return false
    setEditingMember(undefined)
    refresh()
    return true
  }

  const saveRole = async () => {
    if (!editingRole) return
    setPending(true)
    try {
      const ok = await patchMember(editingRole.id, { role: roleValue })
      if (!ok) return
      toast.success("Rôle mis à jour", { description: `${editingRole.firstName} est maintenant « ${roleLabels[roleValue]} ».` })
      setEditingRole(undefined)
      refresh()
    } finally {
      setPending(false)
    }
  }

  const setMemberStatus = async (m: MemberRow, next: MemberStatus) => {
    const ok = await patchMember(m.id, { status: next })
    if (!ok) return
    toast.success(next === "ACTIVE" ? `${m.firstName} a été réactivé(e)` : `${m.firstName} a été suspendu(e)`)
    refresh()
  }

  const removeMember = async (m: MemberRow) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${m.firstName} ${m.lastName} ?`)) return
    const res = await fetch(`/api/admin/members/${m.id}`, { method: "DELETE" })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(payload.error || "Suppression impossible")
      return
    }
    toast.success("Compte supprimé")
    refresh()
  }

  const exportCsv = () => {
    const header = ["Prénom", "Nom", "Email", "Téléphone", "Quartier", "Ville", "Pays", "Rôle", "Statut", "Inscrit le"]
    const lines = data.map((m) =>
      [
        m.firstName,
        m.lastName,
        m.email,
        m.phone,
        m.quartierName,
        m.city ?? "",
        m.country ?? "",
        roleLabels[m.role],
        memberStatusLabels[m.status],
        formatDate(m.joinedAt, "yyyy-MM-dd"),
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    )
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `membres-bapa-${formatDate(new Date().toISOString(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export CSV généré", { description: `${data.length} membres exportés.` })
  }

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
              {
                label: "Modifier",
                icon: Pencil,
                onSelect: () => setEditingMember(m),
              },
              {
                label: "Modifier le rôle",
                icon: ShieldCheck,
                onSelect: () => {
                  setRoleValue(m.role)
                  setEditingRole(m)
                },
              },
              m.status === "SUSPENDED"
                ? {
                    label: "Réactiver",
                    icon: RotateCcw,
                    separator: true,
                    onSelect: () => setMemberStatus(m, "ACTIVE"),
                  }
                : {
                    label: "Suspendre",
                    icon: Ban,
                    separator: true,
                    onSelect: () => setMemberStatus(m, "SUSPENDED"),
                  },
              {
                label: "Supprimer",
                icon: Trash2,
                destructive: true,
                onSelect: () => removeMember(m),
              },
            ]}
          />
        )
      },
    },
  ]

  return (
    <>
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
            <Button variant="outline" className="rounded-full" onClick={exportCsv}>
              <Download /> Exporter
            </Button>
            <EntityFormDialog
              title="Inviter un membre"
              description="Le membre reçoit un mot de passe temporaire par email. Le compte est activé immédiatement."
              trigger={
                <Button className="rounded-full">
                  <UserPlus /> Inviter
                </Button>
              }
              submitLabel="Créer et envoyer"
              successMessage="Membre créé — identifiants envoyés par email"
              onSubmit={invite}
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

      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Modifier le rôle</DialogTitle>
            <DialogDescription>
              {editingRole ? `${editingRole.firstName} ${editingRole.lastName}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-role">Rôle</Label>
            <Select value={roleValue} onValueChange={(v) => setRoleValue(v as Role)}>
              <SelectTrigger id="member-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingRole(undefined)} disabled={pending}>
              Annuler
            </Button>
            <Button onClick={saveRole} disabled={pending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingMember && (
        <EntityFormDialog
          key={editingMember.id}
          title="Modifier le membre"
          description={`${editingMember.firstName} ${editingMember.lastName}`}
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(undefined)}
          submitLabel="Enregistrer"
          successMessage="Membre mis à jour"
          onSubmit={saveEdit}
          fields={[
            { name: "firstName", label: "Prénom", required: true, defaultValue: editingMember.firstName },
            { name: "lastName", label: "Nom", required: true, defaultValue: editingMember.lastName },
            { name: "email", label: "Email", type: "email", required: true, defaultValue: editingMember.email },
            { name: "phone", label: "Téléphone", defaultValue: editingMember.phone },
            {
              name: "quartier",
              label: "Quartier d'origine",
              type: "select",
              options: quartiers,
              defaultValue: editingMember.quartierId,
            },
            { name: "city", label: "Ville", defaultValue: editingMember.city },
            { name: "country", label: "Pays", defaultValue: editingMember.country },
            { name: "profession", label: "Profession", defaultValue: editingMember.profession },
            {
              name: "role",
              label: "Rôle",
              type: "select",
              defaultValue: editingMember.role,
              options: Object.entries(roleLabels).map(([value, label]) => ({ value, label })),
            },
            {
              name: "status",
              label: "Statut",
              type: "select",
              defaultValue: editingMember.status,
              options: Object.entries(memberStatusLabels).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      )}
    </>
  )
}

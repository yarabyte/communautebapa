"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff, Lock, Mail, MapPin, Pencil, Phone, ShieldCheck, Star, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { BusinessLogo, SECTOR_ICON_KEYS, SectorIcon } from "@/components/shared/business-card"
import { BusinessStatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { BusinessWithMeta } from "@/lib/data/businesses"
import { formatDate } from "@/lib/format"
import { businessVisibilityLabels } from "@/lib/labels"
import type { BusinessSector, BusinessStatus } from "@/lib/types"
import { DataTable, type DataTableColumn } from "./data-table"
import { EntityFormDialog, type FieldConfig } from "./entity-form-dialog"
import { RowActions } from "./row-actions"

const iconOptions = SECTOR_ICON_KEYS.map((k) => ({ value: k, label: k }))

export function BusinessesAdmin({ businesses, sectors }: { businesses: BusinessWithMeta[]; sectors: BusinessSector[] }) {
  const router = useRouter()
  const [statuses, setStatuses] = useState<Record<string, BusinessStatus>>({})
  const [featuredId, setFeaturedId] = useState(businesses.find((b) => b.featured)?.id)
  const [rejecting, setRejecting] = useState<BusinessWithMeta | null>(null)
  const [reason, setReason] = useState("")
  const [, setBusy] = useState(false)

  const rows = useMemo(
    () => businesses.map((b) => ({ ...b, status: statuses[b.id] ?? b.status, featured: b.id === featuredId })),
    [businesses, statuses, featuredId],
  )
  const queue = rows.filter((b) => b.status === "PENDING")

  const patchBusiness = async (id: string, body: Record<string, unknown>) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Action impossible")
        return false
      }
      router.refresh()
      return true
    } finally {
      setBusy(false)
    }
  }

  const approve = async (b: BusinessWithMeta) => {
    if (!(await patchBusiness(b.id, { status: "PUBLISHED" }))) return
    setStatuses((s) => ({ ...s, [b.id]: "PUBLISHED" }))
    toast.success(`${b.name} est publiée`)
  }

  const confirmReject = async () => {
    if (!rejecting || reason.trim().length < 10) return
    if (!(await patchBusiness(rejecting.id, { status: "REJECTED", reviewNote: reason.trim() }))) return
    setStatuses((s) => ({ ...s, [rejecting.id]: "REJECTED" }))
    toast.success("Fiche refusée", { description: "Le motif a été enregistré. Le membre peut corriger et soumettre à nouveau." })
    setRejecting(null)
    setReason("")
  }

  const feature = async (b: BusinessWithMeta) => {
    if (b.status !== "PUBLISHED" || b.visibility !== "PUBLIC") {
      toast.error("Seule une fiche publiée et publique peut être mise en avant")
      return
    }
    if (!(await patchBusiness(b.id, { featured: true }))) return
    setFeaturedId(b.id)
    toast.success(`${b.name} devient l'entrepreneur du mois`)
  }

  const columns: DataTableColumn<BusinessWithMeta>[] = [
    {
      id: "entreprise",
      header: "Entreprise",
      accessorFn: (b) => `${b.name} ${b.sectorName}`,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <BusinessLogo business={row.original} className="size-10 text-xs" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium whitespace-normal text-brun">
              {row.original.name}
              {row.original.featured && <Star className="size-3.5 fill-or text-or" aria-label="Entrepreneur du mois" />}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.sectorName}</p>
          </div>
        </div>
      ),
    },
    { id: "proprietaire", header: "Membre", accessorKey: "ownerName" },
    { id: "lieu", header: "Lieu", accessorFn: (b) => `${b.city}, ${b.country}` },
    {
      id: "visibilite",
      header: "Visibilité",
      accessorFn: (b) => businessVisibilityLabels[b.visibility],
      cell: ({ row }) =>
        row.original.visibility === "PUBLIC" ? (
          <Badge className="bg-olive/15 text-olive">Publique</Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Lock className="size-3" /> Membres
          </Badge>
        ),
    },
    { id: "statut", header: "Statut", accessorKey: "status", cell: ({ row }) => <BusinessStatusBadge status={row.original.status} /> },
    { id: "reco", header: "Reco.", accessorKey: "recommendationsCount", enableGlobalFilter: false },
    { id: "date", header: "Créée le", accessorKey: "createdAt", sortFn: "datetime", cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const b = row.original
        return (
          <RowActions
            actions={[
              ...(b.status === "PUBLISHED" ? [{ label: "Voir la fiche", icon: Eye, href: `/espace/entrepreneurs/${b.slug}` }] : []),
              ...(b.status === "PENDING" ? [{ label: "Approuver", icon: Check, onSelect: () => approve(b) }] : []),
              { label: "Mettre en avant (entrepreneur du mois)", icon: Star, onSelect: () => feature(b) },
              ...(b.status === "PUBLISHED"
                ? [
                    {
                      label: "Dépublier",
                      icon: EyeOff,
                      separator: true,
                      destructive: true,
                      onSelect: async () => {
                        if (!(await patchBusiness(b.id, { status: "PENDING" }))) return
                        setStatuses((s) => ({ ...s, [b.id]: "PENDING" }))
                        toast.success("Fiche dépubliée")
                      },
                    },
                  ]
                : [{ label: "Refuser", icon: X, separator: true, destructive: true, onSelect: () => setRejecting(b) }]),
            ]}
          />
        )
      },
    },
  ]

  const sectorFields = (s?: BusinessSector): FieldConfig[] => [
    { name: "name", label: "Nom du secteur", required: true, full: true, defaultValue: s?.name },
    { name: "icon", label: "Icône", type: "select", options: iconOptions, required: true, defaultValue: s?.icon },
  ]
  const countBySector = (id: string) => rows.filter((b) => b.sectorId === id && b.status === "PUBLISHED").length

  return (
    <>
      <Tabs defaultValue={queue.length ? "file" : "toutes"} className="gap-6">
        <TabsList variant="line" className="w-full justify-start gap-4 border-b border-border">
          <TabsTrigger value="file" className="flex-none px-1">
            À valider
            {queue.length > 0 && <Badge className="ml-1 bg-or/20 text-or-dark">{queue.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="toutes" className="flex-none px-1">
            Toutes les entreprises
          </TabsTrigger>
          <TabsTrigger value="secteurs" className="flex-none px-1">
            Secteurs ({sectors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="flex flex-col gap-4">
          {queue.length === 0 ? (
            <div className="flex items-center gap-3 rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              <ShieldCheck className="size-5 text-olive" /> Aucune fiche en attente de validation.
            </div>
          ) : (
            queue.map((b) => (
              <article key={b.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <BusinessLogo business={b} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg text-brun">{b.name}</h3>
                      <Badge variant="outline" className="gap-1">
                        <SectorIcon icon={b.sectorIcon} className="size-3" /> {b.sectorName}
                      </Badge>
                      <Badge variant="outline">{b.visibility === "PUBLIC" ? "Publique" : "Réservée aux membres"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Par <span className="text-brun">{b.ownerName}</span> · soumise le {formatDate(b.createdAt)}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-brun-soft">{b.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4 text-or" /> {[b.address, b.city, b.country].filter(Boolean).join(", ")}
                      </span>
                      {b.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-4 text-or" /> {b.phone}
                        </span>
                      )}
                      {b.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-4 text-or" /> {b.email}
                        </span>
                      )}
                    </div>
                    {b.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {b.services.map((s) => (
                          <Badge key={s.name} variant="secondary">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  <Button variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => setRejecting(b)}>
                    <X /> Refuser
                  </Button>
                  <Button className="rounded-full" onClick={() => approve(b)}>
                    <Check /> Approuver et publier
                  </Button>
                </div>
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="toutes">
          <DataTable columns={columns} data={rows} searchPlaceholder="Entreprise, secteur, membre…" emptyLabel="Aucune entreprise." />
        </TabsContent>

        <TabsContent value="secteurs" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Liste proposée aux membres lors de la création d&apos;une fiche.</p>
            <EntityFormDialog title="Nouveau secteur" triggerLabel="Nouveau secteur" fields={sectorFields()} successMessage="Secteur ajouté" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sectors.map((s) => {
              const count = countBySector(s.id)
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent">
                    <SectorIcon icon={s.icon} className="size-5 text-terre" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brun">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} entreprise{count > 1 ? "s" : ""} publiée{count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <EntityFormDialog
                    title={`Modifier « ${s.name} »`}
                    fields={sectorFields(s)}
                    successMessage="Secteur mis à jour"
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${s.name}`}>
                        <Pencil />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Supprimer ${s.name}`}
                    onClick={() =>
                      count > 0
                        ? toast.error("Secteur utilisé", { description: "Réaffectez d'abord les entreprises concernées à un autre secteur." })
                        : toast.success(`Secteur « ${s.name} » supprimé`)
                    }
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejecting} onOpenChange={(v) => !v && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Refuser « {rejecting?.name} »</DialogTitle>
            <DialogDescription>Expliquez ce qu&apos;il faut corriger : le membre verra ce motif et pourra soumettre à nouveau.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reject-reason">Motif</Label>
            <Textarea
              id="reject-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. : merci d'ajouter un moyen de contact professionnel et de détailler vos services."
            />
            {reason.length > 0 && reason.trim().length < 10 && <p className="text-xs text-destructive">10 caractères minimum.</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setRejecting(null)}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-full" disabled={reason.trim().length < 10} onClick={confirmReject}>
              Refuser la fiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

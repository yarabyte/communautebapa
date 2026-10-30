"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Archive, Copy, Download, Eye, Pencil, Pin, Send, Trash2, Users } from "lucide-react"

import { AssociationMonogram } from "@/components/shared/association-browser"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, formatDateTime, formatFileSize, formatMoney, percent } from "@/lib/format"
import {
  associationCategoryLabels,
  associationZoneLabels,
  documentTypeLabels,
  eventCategoryLabels,
  postCategoryLabels,
  projectCategoryLabels,
  projectStatusLabels,
} from "@/lib/labels"
import type { Association, BapaDocument, BapaEvent, Post, Project } from "@/lib/types"
import { DataTable, type DataTableColumn } from "./data-table"
import { EntityFormDialog, type FieldConfig } from "./entity-form-dialog"
import { RowActions } from "./row-actions"

type Option = { value: string; label: string }

const toOptions = (labels: Record<string, string>): Option[] => Object.entries(labels).map(([value, label]) => ({ value, label }))

function Thumb({ src }: { src: string }) {
  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
      <Image src={src} alt="" fill sizes="44px" className="object-cover" />
    </div>
  )
}

function Visibility({ isPublic }: { isPublic: boolean }) {
  return isPublic ? <Badge className="bg-olive/15 text-olive">Public</Badge> : <Badge variant="outline">Membres</Badge>
}

/* ---------- Associations ---------- */

export type AssociationRow = Association & { membersCount: number; presidentName: string }

const associationColumns: DataTableColumn<AssociationRow>[] = [
  {
    id: "nom",
    header: "Association",
    accessorFn: (a) => [a.name, a.shortName, a.fullName].filter(Boolean).join(" "),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <AssociationMonogram association={row.original} />
        <div className="min-w-0">
          <p className="font-medium whitespace-normal text-brun">{row.original.name}</p>
          {row.original.fullName && <p className="text-xs whitespace-normal text-muted-foreground">{row.original.fullName}</p>}
        </div>
      </div>
    ),
  },
  { id: "pays", header: "Pays", accessorKey: "country" },
  {
    id: "ville",
    header: "Ville / région",
    accessorFn: (a) => a.city ?? a.region ?? "",
    cell: ({ row }) =>
      row.original.city || row.original.region ? (
        <span className="whitespace-normal">
          {row.original.city ?? row.original.region}
          {row.original.city && row.original.region && <span className="block text-xs text-muted-foreground">{row.original.region}</span>}
        </span>
      ) : (
        <span className="text-muted-foreground">Non précisée</span>
      ),
  },
  { id: "categorie", header: "Catégorie", accessorFn: (a) => associationCategoryLabels[a.category] },
  { id: "responsable", header: "Responsable", accessorKey: "presidentName" },
  { id: "membres", header: "Membres", accessorKey: "membersCount", enableGlobalFilter: false },
  {
    id: "source",
    header: "Source",
    accessorFn: (a) => `${a.source} ${a.adevipa ? "ADEVIPA" : ""}`,
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        {row.original.adevipa ? <Badge className="bg-or/15 text-or-dark">ADEVIPA</Badge> : <Badge variant="outline">Liste Douala</Badge>}
        {row.original.notes && <span className="max-w-48 text-xs whitespace-normal text-muted-foreground">{row.original.notes}</span>}
      </div>
    ),
  },
  { id: "visibilite", header: "Visibilité", accessorFn: (a) => (a.isPublic ? "Public" : "Privé"), cell: ({ row }) => <Visibility isPublic={row.original.isPublic} /> },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <RowActions
        actions={[
          { label: "Voir l'espace", icon: Eye, href: `/espace/associations/${row.original.slug}` },
          { label: "Modifier", icon: Pencil, toast: "Modifications enregistrées" },
          { label: "Gérer les membres", icon: Users, href: `/espace/associations/${row.original.slug}?onglet=membres` },
          { label: "Archiver", icon: Archive, toast: "Association archivée", separator: true, destructive: true },
        ]}
      />
    ),
  },
]

const ALL_COUNTRIES = "TOUS"

export function AssociationsAdminTable({ data, members }: { data: AssociationRow[]; members: Option[] }) {
  const [country, setCountry] = useState(ALL_COUNTRIES)
  const countries = useMemo(() => [...new Set(data.map((a) => a.country))], [data])
  const rows = useMemo(() => (country === ALL_COUNTRIES ? data : data.filter((a) => a.country === country)), [data, country])

  const fields: FieldConfig[] = [
    { name: "name", label: "Nom", required: true, full: true },
    { name: "fullName", label: "Nom complet / signification du sigle", full: true },
    { name: "shortName", label: "Nom court", required: true },
    { name: "category", label: "Catégorie", type: "select", options: toOptions(associationCategoryLabels), required: true },
    { name: "zone", label: "Zone", type: "select", options: toOptions(associationZoneLabels), required: true },
    { name: "country", label: "Pays", required: true },
    { name: "region", label: "Région / province" },
    { name: "city", label: "Ville" },
    { name: "president", label: "Responsable", type: "select", options: members },
    { name: "foundedYear", label: "Année de création", type: "number" },
    { name: "description", label: "Présentation", type: "textarea", required: true },
    { name: "meetingInfo", label: "Réunions", placeholder: "Ex. : chaque 2e dimanche du mois", full: true },
    { name: "cover", label: "Image de couverture", type: "file" },
    { name: "adevipa", label: "Rattachée à l'ADEVIPA", type: "switch" },
    { name: "isPublic", label: "Visible sur le site public", type: "switch", defaultValue: "true" },
  ]
  return (
    <DataTable
      columns={associationColumns}
      data={rows}
      pageSize={15}
      searchPlaceholder="Nom, ville, région…"
      toolbar={
        <>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-44 bg-card" aria-label="Filtrer par pays">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_COUNTRIES}>Tous les pays ({data.length})</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c} ({data.filter((a) => a.country === c).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <EntityFormDialog title="Nouvelle association" triggerLabel="Nouvelle association" fields={fields} successMessage="Association créée" />
        </>
      }
    />
  )
}

/* ---------- Événements ---------- */

export type EventRow = BapaEvent & { associationName?: string; past: boolean }

const eventColumns: DataTableColumn<EventRow>[] = [
  {
    id: "titre",
    header: "Événement",
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumb src={row.original.image} />
        <div className="min-w-0">
          <p className="font-medium whitespace-normal text-brun">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.location}</p>
        </div>
      </div>
    ),
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "startsAt",
    sortFn: "datetime",
    cell: ({ row }) => (
      <span className={row.original.past ? "text-muted-foreground" : "text-brun"}>
        {formatDateTime(row.original.startsAt)}
        {row.original.past && <span className="block text-xs">Passé</span>}
      </span>
    ),
  },
  { id: "categorie", header: "Catégorie", accessorFn: (e) => eventCategoryLabels[e.category] },
  {
    id: "inscrits",
    header: "Inscrits",
    accessorFn: (e) => e.registered,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <div className="flex w-28 flex-col gap-1">
        <span className="text-xs">
          {row.original.registered} / {row.original.capacity}
        </span>
        <Progress value={percent(row.original.registered, row.original.capacity)} className="h-1.5" />
      </div>
    ),
  },
  { id: "visibilite", header: "Visibilité", accessorFn: (e) => (e.isPublic ? "Public" : "Privé"), cell: ({ row }) => <Visibility isPublic={row.original.isPublic} /> },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <RowActions
        actions={[
          { label: "Voir", icon: Eye, href: `/espace/evenements/${row.original.slug}` },
          { label: "Modifier", icon: Pencil, toast: "Événement mis à jour" },
          { label: "Exporter les inscrits", icon: Download, toast: "Liste des inscrits exportée" },
          { label: "Dupliquer", icon: Copy, toast: "Événement dupliqué" },
          { label: "Annuler l'événement", icon: Trash2, toast: "Événement annulé, les inscrits sont prévenus", separator: true, destructive: true },
        ]}
      />
    ),
  },
]

export function EventsAdminTable({ data, associations }: { data: EventRow[]; associations: Option[] }) {
  const fields: FieldConfig[] = [
    { name: "title", label: "Titre", required: true, full: true },
    { name: "category", label: "Catégorie", type: "select", options: toOptions(eventCategoryLabels), required: true },
    { name: "association", label: "Association organisatrice", type: "select", options: [{ value: "none", label: "Communauté (général)" }, ...associations] },
    { name: "startsAt", label: "Début", type: "datetime-local", required: true },
    { name: "endsAt", label: "Fin", type: "datetime-local" },
    { name: "location", label: "Lieu", required: true },
    { name: "capacity", label: "Capacité", type: "number" },
    { name: "excerpt", label: "Résumé", full: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "image", label: "Visuel", type: "file" },
    { name: "isPublic", label: "Afficher sur le site public", type: "switch", defaultValue: "true", full: true },
  ]
  return (
    <DataTable
      columns={eventColumns}
      data={data}
      searchPlaceholder="Rechercher un événement…"
      toolbar={<EntityFormDialog title="Nouvel événement" triggerLabel="Nouvel événement" fields={fields} successMessage="Événement publié" />}
    />
  )
}

/* ---------- Actualités ---------- */

export type PostRow = Post & { authorName: string; associationName?: string }

const postColumns: DataTableColumn<PostRow>[] = [
  {
    id: "titre",
    header: "Article",
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumb src={row.original.image} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium whitespace-normal text-brun">
            {row.original.pinned && <Pin className="size-3.5 shrink-0 text-terre" />}
            {row.original.title}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.associationName ?? "Communauté"}</p>
        </div>
      </div>
    ),
  },
  { id: "categorie", header: "Catégorie", accessorFn: (p) => postCategoryLabels[p.category], cell: ({ getValue }) => <Badge variant="outline">{String(getValue())}</Badge> },
  { id: "auteur", header: "Auteur", accessorKey: "authorName" },
  {
    id: "date",
    header: "Publié le",
    accessorKey: "publishedAt",
    sortFn: "datetime",
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.publishedAt, "d MMM yyyy")}</span>,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <RowActions
        actions={[
          { label: "Voir", icon: Eye, href: `/espace/actualites/${row.original.slug}` },
          { label: "Modifier", icon: Pencil, toast: "Article mis à jour" },
          { label: row.original.pinned ? "Désépingler" : "Épingler", icon: Pin, toast: "Mise en avant modifiée" },
          { label: "Notifier les membres", icon: Send, toast: "Notification envoyée aux membres" },
          { label: "Supprimer", icon: Trash2, toast: "Article supprimé", separator: true, destructive: true },
        ]}
      />
    ),
  },
]

export function PostsAdminTable({ data, associations }: { data: PostRow[]; associations: Option[] }) {
  const fields: FieldConfig[] = [
    { name: "title", label: "Titre", required: true, full: true },
    { name: "category", label: "Catégorie", type: "select", options: toOptions(postCategoryLabels), required: true },
    { name: "association", label: "Association", type: "select", options: [{ value: "none", label: "Communauté (général)" }, ...associations] },
    { name: "excerpt", label: "Chapô", full: true, required: true },
    { name: "content", label: "Contenu", type: "textarea", required: true },
    { name: "image", label: "Image à la une", type: "file" },
    { name: "pinned", label: "Épingler en tête du fil", type: "switch", full: true },
    { name: "notify", label: "Notifier les membres par email", type: "switch", full: true },
  ]
  return (
    <DataTable
      columns={postColumns}
      data={data}
      searchPlaceholder="Rechercher un article…"
      toolbar={<EntityFormDialog title="Nouvel article" triggerLabel="Rédiger" fields={fields} submitLabel="Publier" successMessage="Article publié" />}
    />
  )
}

/* ---------- Projets ---------- */

const statusTone: Record<Project["status"], string> = {
  A_VENIR: "bg-or/20 text-or-dark",
  EN_COURS: "bg-terre/10 text-terre",
  TERMINE: "bg-olive/15 text-olive",
}

const projectColumns: DataTableColumn<Project>[] = [
  {
    id: "titre",
    header: "Projet",
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumb src={row.original.image} />
        <div className="min-w-0">
          <p className="font-medium whitespace-normal text-brun">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{projectCategoryLabels[row.original.category]}</p>
        </div>
      </div>
    ),
  },
  {
    id: "statut",
    header: "Statut",
    accessorFn: (p) => projectStatusLabels[p.status],
    cell: ({ row }) => <Badge className={statusTone[row.original.status]}>{projectStatusLabels[row.original.status]}</Badge>,
  },
  {
    id: "collecte",
    header: "Collecte",
    accessorFn: (p) => p.raisedXaf / p.goalXaf,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <div className="flex w-44 flex-col gap-1">
        <span className="text-xs">
          {formatMoney(row.original.raisedXaf)} / {formatMoney(row.original.goalXaf)}
        </span>
        <Progress value={percent(row.original.raisedXaf, row.original.goalXaf)} className="h-1.5" />
      </div>
    ),
  },
  { id: "contributeurs", header: "Contributions", accessorKey: "contributorsCount", enableGlobalFilter: false },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <RowActions
        actions={[
          { label: "Voir", icon: Eye, href: `/espace/projets/${row.original.slug}` },
          { label: "Modifier", icon: Pencil, toast: "Projet mis à jour" },
          { label: "Publier une nouvelle", icon: Send, toast: "Nouvelle publiée sur le suivi du projet" },
          { label: "Exporter les contributions", icon: Download, toast: "Export généré" },
          { label: "Clôturer la collecte", icon: Archive, toast: "Collecte clôturée", separator: true, destructive: true },
        ]}
      />
    ),
  },
]

export function ProjectsAdminTable({ data, associations }: { data: Project[]; associations: Option[] }) {
  const fields: FieldConfig[] = [
    { name: "title", label: "Intitulé", required: true, full: true },
    { name: "category", label: "Domaine", type: "select", options: toOptions(projectCategoryLabels), required: true },
    { name: "status", label: "Statut", type: "select", options: toOptions(projectStatusLabels), defaultValue: "A_VENIR" },
    { name: "goal", label: "Objectif (FCFA)", type: "number", required: true },
    { name: "association", label: "Association porteuse", type: "select", options: [{ value: "none", label: "Chefferie / communauté" }, ...associations] },
    { name: "startDate", label: "Début", type: "date" },
    { name: "endDate", label: "Fin prévue", type: "date" },
    { name: "summary", label: "Résumé", full: true, required: true },
    { name: "description", label: "Description détaillée", type: "textarea" },
    { name: "image", label: "Visuel", type: "file" },
  ]
  return (
    <DataTable
      columns={projectColumns}
      data={data}
      searchPlaceholder="Rechercher un projet…"
      toolbar={<EntityFormDialog title="Nouveau projet" triggerLabel="Nouveau projet" fields={fields} successMessage="Projet créé" />}
    />
  )
}

/* ---------- Documents ---------- */

export type DocumentRow = BapaDocument & { associationName?: string; uploaderName: string }

const documentColumns: DataTableColumn<DocumentRow>[] = [
  {
    id: "titre",
    header: "Document",
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-terre/10 text-[10px] font-bold text-terre uppercase">
          {row.original.fileType}
        </span>
        <div className="min-w-0">
          <p className="font-medium whitespace-normal text-brun">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(row.original.sizeKb)}</p>
        </div>
      </div>
    ),
  },
  { id: "type", header: "Type", accessorFn: (d) => documentTypeLabels[d.type], cell: ({ getValue }) => <Badge variant="outline">{String(getValue())}</Badge> },
  { id: "association", header: "Association", accessorFn: (d) => d.associationName ?? "Communauté" },
  { id: "auteur", header: "Déposé par", accessorKey: "uploaderName" },
  {
    id: "date",
    header: "Date",
    accessorKey: "uploadedAt",
    sortFn: "datetime",
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.uploadedAt, "d MMM yyyy")}</span>,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: () => (
      <RowActions
        actions={[
          { label: "Télécharger", icon: Download, toast: "Téléchargement démarré" },
          { label: "Renommer", icon: Pencil, toast: "Document renommé" },
          { label: "Supprimer", icon: Trash2, toast: "Document supprimé", separator: true, destructive: true },
        ]}
      />
    ),
  },
]

export function DocumentsAdminTable({ data, associations }: { data: DocumentRow[]; associations: Option[] }) {
  const fields: FieldConfig[] = [
    { name: "title", label: "Titre", required: true, full: true },
    { name: "type", label: "Type", type: "select", options: toOptions(documentTypeLabels), required: true },
    { name: "association", label: "Association", type: "select", options: [{ value: "none", label: "Communauté (tous les membres)" }, ...associations] },
    { name: "file", label: "Fichier (PDF, Word, Excel — 20 Mo max.)", type: "file", required: true },
  ]
  return (
    <DataTable
      columns={documentColumns}
      data={data}
      searchPlaceholder="Rechercher un document…"
      toolbar={<EntityFormDialog title="Déposer un document" triggerLabel="Déposer" fields={fields} submitLabel="Déposer" successMessage="Document déposé" />}
    />
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Eye, Flag, Lock, Pin, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { MemberAvatar } from "@/components/espace/member-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fromNow } from "@/lib/format"
import { forumCategoryLabels } from "@/lib/labels"
import type { ForumThread, Member } from "@/lib/types"
import { DataTable, type DataTableColumn } from "./data-table"
import { RowActions } from "./row-actions"

export type ModerationThread = ForumThread & {
  repliesCount: number
  author?: Pick<Member, "id" | "firstName" | "lastName" | "avatar">
  authorName: string
}

const columns: DataTableColumn<ModerationThread>[] = [
  {
    id: "sujet",
    header: "Sujet",
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.pinned && <Pin className="size-3.5 shrink-0 text-terre" />}
        {row.original.locked && <Lock className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="font-medium whitespace-normal text-brun">{row.original.title}</span>
      </div>
    ),
  },
  { id: "categorie", header: "Catégorie", accessorFn: (t) => forumCategoryLabels[t.category], cell: ({ getValue }) => <Badge variant="outline">{String(getValue())}</Badge> },
  { id: "auteur", header: "Auteur", accessorKey: "authorName" },
  { id: "reponses", header: "Réponses", accessorKey: "repliesCount", enableGlobalFilter: false },
  { id: "activite", header: "Activité", accessorKey: "lastReplyAt", sortFn: "datetime", cell: ({ row }) => <span className="text-muted-foreground">{fromNow(row.original.lastReplyAt)}</span> },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <RowActions
        actions={[
          { label: "Ouvrir", icon: Eye, href: `/espace/forum/${row.original.id}` },
          { label: row.original.pinned ? "Désépingler" : "Épingler", icon: Pin, toast: "Sujet mis à jour" },
          { label: row.original.locked ? "Déverrouiller" : "Verrouiller", icon: Lock, toast: "Sujet mis à jour" },
          { label: "Supprimer", icon: Trash2, toast: "Sujet supprimé", separator: true, destructive: true },
        ]}
      />
    ),
  },
]

export function ModerationQueue({ reported, threads }: { reported: ModerationThread[]; threads: ModerationThread[] }) {
  const [queue, setQueue] = useState(reported)

  const resolve = (id: string, message: string) => {
    setQueue((q) => q.filter((t) => t.id !== id))
    toast.success(message)
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-heading text-lg text-brun">
          <Flag className="size-4 text-destructive" /> Signalements à traiter
          <Badge className="bg-destructive/10 text-destructive">{queue.length}</Badge>
        </h2>
        {queue.length === 0 ? (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 text-olive" /> Aucun signalement en attente. La communauté est sereine.
          </div>
        ) : (
          queue.map((t) => (
            <article key={t.id} className="flex flex-col gap-4 rounded-3xl border border-destructive/30 bg-card p-5">
              <div className="flex items-start gap-3">
                {t.author && <MemberAvatar member={t.author} className="size-10" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-brun">{t.authorName}</span>{" "}
                    <span className="text-muted-foreground">· {fromNow(t.createdAt)}</span>
                  </p>
                  <Link href={`/espace/forum/${t.id}`} className="font-heading text-lg text-brun hover:text-terre">
                    {t.title}
                  </Link>
                </div>
                <Badge variant="outline">{forumCategoryLabels[t.category]}</Badge>
              </div>
              <p className="rounded-2xl bg-secondary p-4 text-sm text-brun-soft">{t.content}</p>
              <p className="text-xs text-destructive">Signalé par 3 membres · motif : propos hors charte</p>
              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" className="rounded-full" onClick={() => resolve(t.id, "Signalement classé sans suite")}>
                  <Check /> Conserver
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => resolve(t.id, "Sujet verrouillé, l'auteur a été averti")}>
                  <Lock /> Verrouiller
                </Button>
                <Button variant="destructive" className="rounded-full" onClick={() => resolve(t.id, "Sujet supprimé, l'auteur a été averti")}>
                  <Trash2 /> Supprimer
                </Button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg text-brun">Tous les sujets</h2>
        <DataTable columns={columns} data={threads} searchPlaceholder="Rechercher un sujet…" />
      </section>
    </div>
  )
}

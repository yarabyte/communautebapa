import type { Metadata } from "next"
import Link from "next/link"
import { AlertCircle, Building2, Clock, Eye, Lock, Pencil, Plus } from "lucide-react"

import { PageHeader } from "@/components/espace/page-header"
import { BusinessLogo, SectorIcon } from "@/components/shared/business-card"
import { BusinessStatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { getBusinesses } from "@/lib/data/businesses"
import { getCurrentMember } from "@/lib/data/members"
import { businessVisibilityLabels } from "@/lib/labels"

export const metadata: Metadata = { title: "Mes entreprises" }

export default async function MesEntreprisesPage() {
  const me = await getCurrentMember()
  const list = await getBusinesses({ ownerId: me.id })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Économie"
        title="Mes entreprises"
        description="Présentez votre activité à la communauté : services, contacts, offres d'emploi. Chaque fiche est vérifiée avant publication."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/espace/mes-entreprises/nouvelle">
              <Plus /> Nouvelle entreprise
            </Link>
          </Button>
        }
      />

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent">
            <Building2 className="size-7 text-terre" />
          </span>
          <div>
            <p className="font-heading text-xl text-brun">Vous avez une entreprise ou une activité ?</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Commerce, cabinet, atelier, exploitation agricole… Créez sa fiche pour qu&apos;elle apparaisse dans « Entrepreneurs Bapa ».
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/espace/mes-entreprises/nouvelle">
              <Plus /> Créer ma première fiche
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((b) => (
            <article key={b.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center">
              <BusinessLogo business={b} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg text-brun">{b.name}</h2>
                  <BusinessStatusBadge status={b.status} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <SectorIcon icon={b.sectorIcon} className="size-4 text-or" /> {b.sectorName}
                  </span>
                  <span>
                    {b.city}, {b.country}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {b.visibility === "MEMBERS" ? <Lock className="size-3.5" /> : <Eye className="size-3.5" />}
                    {businessVisibilityLabels[b.visibility]}
                  </span>
                  {b.status === "PUBLISHED" && (
                    <span>
                      {b.recommendationsCount} recommandation{b.recommendationsCount > 1 ? "s" : ""} · {b.openJobs} offre{b.openJobs > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                {b.status === "REJECTED" && b.reviewNote && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" /> {b.reviewNote}
                  </p>
                )}
                {b.status === "PENDING" && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-or-dark">
                    <Clock className="size-4" /> Un administrateur vérifie votre fiche, généralement sous 48 heures.
                  </p>
                )}
                {b.status === "DRAFT" && <p className="mt-3 text-sm text-muted-foreground">Brouillon : complétez la fiche puis soumettez-la pour validation.</p>}
              </div>
              <div className="flex gap-2">
                {b.status === "PUBLISHED" && (
                  <Button asChild variant="ghost" className="rounded-full">
                    <Link href={`/espace/entrepreneurs/${b.slug}`}>
                      <Eye /> Voir
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/espace/mes-entreprises/${b.id}`}>
                    <Pencil /> {b.status === "REJECTED" ? "Corriger" : "Modifier"}
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

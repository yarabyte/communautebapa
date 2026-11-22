import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Lock } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { DocumentsTable } from "@/components/espace/documents-table"
import { PageHeader } from "@/components/espace/page-header"
import { getMemberAssociations } from "@/lib/data/associations"
import { getDocuments } from "@/lib/data/content"
import { getCurrentMember } from "@/lib/data/members"

export const metadata: Metadata = { title: "Documents" }

export default async function DocumentsPage() {
  const member = await getCurrentMember()
  const memberAssociations = await getMemberAssociations(member.id)
  const associationIds = memberAssociations.map(({ association }) => association.id)
  const documents = await getDocuments({ associationIds })

  const groups = memberAssociations
    .map(({ association }) => ({
      association,
      documents: documents.filter((d) => d.associationId === association.id),
    }))
    .filter((g) => g.documents.length > 0)
    .sort((a, b) => a.association.name.localeCompare(b.association.name, "fr"))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Espace membre"
        title="Documents"
        description="Statuts, procès-verbaux et rapports classés par association. Seuls les membres de chaque association y ont accès."
      />

      {groups.length > 0 ? (
        <div className="flex flex-col gap-8">
          {groups.map(({ association, documents: docs }) => (
            <section key={association.id} className="relative overflow-hidden rounded-3xl border border-or/25 bg-card shadow-[0_12px_28px_-24px_rgba(57,37,23,0.4)]">
              <BapaMotif tone="gold" fade="corner" className="opacity-[0.12]" />
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/50 to-transparent" />
              <header className="relative flex flex-wrap items-end justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.12em] text-or-dark uppercase">Association</p>
                  <h2 className="mt-1 font-heading text-xl tracking-wide text-brun">
                    <Link href={`/espace/associations/${association.slug}`} className="hover:text-terre">
                      {association.name}
                    </Link>
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {docs.length} document{docs.length > 1 ? "s" : ""}
                </p>
              </header>
              <div className="relative p-4 sm:p-5">
                <DocumentsTable documents={docs} showAssociation={false} />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-or/40 bg-creme-light/60 px-6 py-16 text-center">
          <BapaMotif tone="gold" fade="radial" className="opacity-20" />
          {associationIds.length === 0 ? (
            <>
              <Lock className="relative mx-auto size-10 text-or" />
              <p className="relative mt-4 font-heading text-lg text-brun">Aucune association pour le moment</p>
              <p className="relative mt-1 text-sm text-muted-foreground">
                Rejoignez une association pour accéder à ses documents.
              </p>
              <Link href="/espace/associations" className="relative mt-5 inline-flex text-sm font-medium text-terre hover:underline">
                Voir les associations
              </Link>
            </>
          ) : (
            <>
              <FileText className="relative mx-auto size-10 text-or" />
              <p className="relative mt-4 font-heading text-lg text-brun">Aucun document disponible</p>
              <p className="relative mt-1 text-sm text-muted-foreground">
                Vos associations n&apos;ont pas encore déposé de documents.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

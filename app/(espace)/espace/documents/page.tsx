import type { Metadata } from "next"

import { DocumentsTable } from "@/components/espace/documents-table"
import { PageHeader } from "@/components/espace/page-header"
import { associationById } from "@/lib/data/associations"
import { getDocuments } from "@/lib/data/content"

export const metadata: Metadata = { title: "Documents" }

export default async function DocumentsPage() {
  const documents = (await getDocuments()).map((d) => ({ ...d, associationName: associationById(d.associationId)?.name }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Transparence"
        title="Documents"
        description="Statuts, procès-verbaux, rapports d'activité et rapports financiers de la communauté et de vos associations."
      />
      <DocumentsTable documents={documents} />
    </div>
  )
}

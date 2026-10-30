import type { Metadata } from "next"

import { DocumentsAdminTable } from "@/components/admin/content-tables"
import { PageHeader } from "@/components/espace/page-header"
import { associationById, getAssociations } from "@/lib/data/associations"
import { getDocuments } from "@/lib/data/content"
import { fullName, memberById } from "@/lib/data/members"

export const metadata: Metadata = { title: "Documents" }

export default async function AdminDocumentsPage() {
  const [documents, associations] = await Promise.all([getDocuments(), getAssociations()])
  const rows = documents.map((d) => {
    const uploader = memberById(d.uploadedById)
    return { ...d, uploaderName: uploader ? fullName(uploader) : "—", associationName: associationById(d.associationId)?.name }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Documents" description="Statuts, procès-verbaux, rapports : partagez les documents avec les bons membres." />
      <DocumentsAdminTable data={rows} associations={associations.map((a) => ({ value: a.id, label: a.name }))} />
    </div>
  )
}

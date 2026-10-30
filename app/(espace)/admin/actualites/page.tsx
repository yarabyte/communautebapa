import type { Metadata } from "next"

import { PostsAdminTable } from "@/components/admin/content-tables"
import { PageHeader } from "@/components/espace/page-header"
import { associationById, getAssociations } from "@/lib/data/associations"
import { getPosts } from "@/lib/data/content"
import { fullName, memberById } from "@/lib/data/members"

export const metadata: Metadata = { title: "Actualités" }

export default async function AdminActualitesPage() {
  const [posts, associations] = await Promise.all([getPosts(), getAssociations()])
  const rows = posts.map((p) => {
    const author = memberById(p.authorId)
    return { ...p, authorName: author ? fullName(author) : "—", associationName: associationById(p.associationId)?.name }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Actualités" description="Rédigez les annonces et nouvelles du village, épinglez l'essentiel." />
      <PostsAdminTable data={rows} associations={associations.map((a) => ({ value: a.id, label: a.name }))} />
    </div>
  )
}

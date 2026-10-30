import type { Metadata } from "next"

import { PageHeader } from "@/components/espace/page-header"
import { ForumThreadList } from "@/components/espace/forum-thread-list"
import { NewThreadDialog } from "@/components/espace/new-thread-dialog"
import { FilterPills } from "@/components/shared/filter-pills"
import { getForumThreads } from "@/lib/data/community"
import { forumCategoryLabels } from "@/lib/labels"
import type { ForumCategory } from "@/lib/types"

export const metadata: Metadata = { title: "Forum" }

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams
  const category = categorie && categorie in forumCategoryLabels ? (categorie as ForumCategory) : undefined
  const threads = await getForumThreads({ category })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Communauté"
        title="Forum"
        description="Débattez, proposez des idées et entraidez-vous entre fils et filles de Bapa."
        actions={<NewThreadDialog />}
      />
      <FilterPills
        options={Object.entries(forumCategoryLabels).map(([value, label]) => ({ value, label }))}
        current={category}
        param="categorie"
        basePath="/espace/forum"
        allLabel="Tous les sujets"
      />
      <ForumThreadList threads={threads} />
    </div>
  )
}

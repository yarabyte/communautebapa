import type { Metadata } from "next"

import { ModerationQueue } from "@/components/admin/moderation-queue"
import { PageHeader } from "@/components/espace/page-header"
import { getForumThreads } from "@/lib/data/community"
import { fullName, memberById } from "@/lib/data/members"

export const metadata: Metadata = { title: "Modération" }

export default async function AdminForumPage() {
  const threads = (await getForumThreads()).map((t) => {
    const author = memberById(t.authorId)
    return {
      ...t,
      author: author && { id: author.id, firstName: author.firstName, lastName: author.lastName, avatar: author.avatar },
      authorName: author ? fullName(author) : "—",
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Administration" title="Modération du forum" description="Traitez les signalements et veillez au respect de la charte de la communauté." />
      <ModerationQueue reported={threads.filter((t) => t.reported)} threads={threads} />
    </div>
  )
}

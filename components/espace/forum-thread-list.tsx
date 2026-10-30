import Link from "next/link"
import { Eye, Lock, MessageSquare, Pin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { memberById } from "@/lib/data/members"
import { fromNow } from "@/lib/format"
import { forumCategoryLabels } from "@/lib/labels"
import type { ForumThread } from "@/lib/types"
import { MemberAvatar } from "./member-avatar"

export function ForumThreadList({ threads }: { threads: (ForumThread & { repliesCount: number })[] }) {
  if (threads.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">Aucun sujet pour le moment.</p>
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
      {threads.map((t) => {
        const author = memberById(t.authorId)
        return (
          <li key={t.id} className="relative flex gap-4 p-4 transition-colors hover:bg-secondary/50 sm:p-5">
            {author && <MemberAvatar member={author} className="size-10" />}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {t.pinned && <Pin className="size-3.5 text-terre" aria-label="Épinglé" />}
                {t.locked && <Lock className="size-3.5 text-muted-foreground" aria-label="Verrouillé" />}
                <Link href={`/espace/forum/${t.id}`} className="font-medium text-brun after:absolute after:inset-0 hover:text-terre">
                  {t.title}
                </Link>
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">{t.content}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <Badge variant="outline">{forumCategoryLabels[t.category]}</Badge>
                <span>
                  {author?.firstName} {author?.lastName} · {fromNow(t.createdAt)}
                </span>
              </div>
            </div>
            <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3.5" /> {t.repliesCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" /> {t.views}
              </span>
              <span>{fromNow(t.lastReplyAt)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

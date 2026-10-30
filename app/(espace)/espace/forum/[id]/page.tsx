import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Eye, Flag, Lock, Pin } from "lucide-react"

import { MemberAvatar } from "@/components/espace/member-avatar"
import { ReplyForm } from "@/components/espace/reply-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { associationById } from "@/lib/data/associations"
import { getForumThread } from "@/lib/data/community"
import { memberById } from "@/lib/data/members"
import { formatDateTime, fromNow } from "@/lib/format"
import { forumCategoryLabels } from "@/lib/labels"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await getForumThread((await params).id)
  return { title: data?.thread.title ?? "Sujet" }
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getForumThread(id)
  if (!data) notFound()
  const { thread, replies } = data
  const author = memberById(thread.authorId)
  const association = thread.associationId ? associationById(thread.associationId) : undefined

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link href="/espace/forum" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Retour au forum
      </Link>

      <article className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{forumCategoryLabels[thread.category]}</Badge>
          {association && <Badge variant="secondary">{association.shortName ?? association.name}</Badge>}
          {thread.pinned && (
            <Badge className="bg-terre/10 text-terre">
              <Pin /> Épinglé
            </Badge>
          )}
          {thread.locked && (
            <Badge className="bg-muted text-muted-foreground">
              <Lock /> Verrouillé
            </Badge>
          )}
        </div>
        <h1 className="font-heading text-2xl leading-tight text-brun sm:text-3xl">{thread.title}</h1>
        <div className="flex items-center gap-3">
          {author && <MemberAvatar member={author} className="size-10" />}
          <div className="flex-1 text-sm">
            <p className="font-medium text-brun">
              {author?.firstName} {author?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(thread.createdAt)}</p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> {thread.views}
          </span>
        </div>
        <p className="leading-relaxed whitespace-pre-line text-brun-soft">{thread.content}</p>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag /> Signaler
          </Button>
        </div>
      </article>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg text-brun">
          {replies.length} réponse{replies.length > 1 ? "s" : ""}
        </h2>
        {replies.map((r) => {
          const a = memberById(r.authorId)
          return (
            <div key={r.id} className="flex gap-3">
              {a && <MemberAvatar member={a} className="size-9" />}
              <div className="flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-4">
                <p className="text-sm">
                  <span className="font-medium text-brun">
                    {a?.firstName} {a?.lastName}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">· {fromNow(r.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-brun-soft">{r.content}</p>
              </div>
            </div>
          )
        })}
        <ReplyForm locked={thread.locked} />
      </section>
    </div>
  )
}

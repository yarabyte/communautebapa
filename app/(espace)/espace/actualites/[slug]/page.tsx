import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Pill } from "@/components/brand/pill"
import { MemberAvatar } from "@/components/espace/member-avatar"
import { associationById } from "@/lib/data/associations"
import { getPost, getPosts } from "@/lib/data/content"
import { memberById } from "@/lib/data/members"
import { formatDate } from "@/lib/format"
import { postCategoryLabels } from "@/lib/labels"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPost((await params).slug)
  return { title: p?.title ?? "Actualité" }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const author = memberById(post.authorId)
  const association = associationById(post.associationId)
  const others = (await getPosts()).filter((p) => p.id !== post.id).slice(0, 3)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_1fr]">
      <article className="flex flex-col gap-6">
        <Link href="/espace/actualites" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
          <ArrowLeft className="size-4" /> Toutes les actualités
        </Link>
        <Pill>{postCategoryLabels[post.category]}</Pill>
        <h1 className="font-heading text-3xl leading-tight text-brun sm:text-4xl">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {author && <MemberAvatar member={author} />}
          <span>
            {author && (
              <span className="font-medium text-brun">
                {author.firstName} {author.lastName}
              </span>
            )}
            <br />
            {formatDate(post.publishedAt)}
            {association && <> · {association.name}</>}
          </span>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
          <Image src={post.image} alt="" fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
        </div>
        <p className="text-lg leading-relaxed text-brun">{post.excerpt}</p>
        {post.content.map((para, i) => (
          <p key={i} className="leading-relaxed text-brun-soft">
            {para}
          </p>
        ))}
      </article>
      <aside className="flex flex-col gap-4 lg:pt-12">
        <h2 className="font-heading text-lg text-brun">À lire aussi</h2>
        {others.map((p) => (
          <Link key={p.id} href={`/espace/actualites/${p.slug}`} className="flex gap-3 rounded-2xl border border-border bg-card p-3 hover:border-terre/40">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
              <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium text-brun">{p.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(p.publishedAt, "d MMM yyyy")}</p>
            </div>
          </Link>
        ))}
      </aside>
    </div>
  )
}

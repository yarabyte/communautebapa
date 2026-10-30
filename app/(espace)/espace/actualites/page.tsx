import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Pin } from "lucide-react"

import { Pill } from "@/components/brand/pill"
import { PageHeader } from "@/components/espace/page-header"
import { FilterPills } from "@/components/shared/filter-pills"
import { associationById } from "@/lib/data/associations"
import { getPosts } from "@/lib/data/content"
import { formatDate } from "@/lib/format"
import { postCategoryLabels } from "@/lib/labels"

export const metadata: Metadata = { title: "Actualités" }

export default async function ActualitesPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams
  const all = await getPosts()
  const posts = categorie ? all.filter((p) => p.category === categorie) : all
  const [featured, ...rest] = posts

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Vie de la communauté" title="Actualités" description="Annonces de la chefferie, nouvelles des projets et des associations, carnet de la communauté." />
      <FilterPills
        basePath="/espace/actualites"
        param="categorie"
        current={categorie}
        options={Object.entries(postCategoryLabels).map(([value, label]) => ({ value, label }))}
      />
      {featured && (
        <Link href={`/espace/actualites/${featured.slug}`} className="group relative isolate grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
          <div className="relative aspect-[16/10] lg:aspect-auto">
            <Image src={featured.image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{postCategoryLabels[featured.category]}</Pill>
              {featured.pinned && (
                <span className="flex items-center gap-1 text-xs text-terre">
                  <Pin className="size-3.5" /> Épinglé
                </span>
              )}
            </div>
            <h2 className="font-heading text-2xl leading-snug text-brun sm:text-3xl">{featured.title}</h2>
            <p className="text-brun-soft">{featured.excerpt}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(featured.publishedAt)}
              {featured.associationId && <> · {associationById(featured.associationId)?.name}</>}
            </p>
          </div>
        </Link>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.id} href={`/espace/actualites/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card hover:shadow-[0_16px_32px_rgba(57,37,23,0.1)]">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src={p.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <span className="text-xs text-or-dark">
                {postCategoryLabels[p.category]} · {formatDate(p.publishedAt, "d MMM yyyy")}
              </span>
              <h3 className="font-heading text-lg leading-snug text-brun">{p.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="text-center text-muted-foreground">Aucune actualité dans cette catégorie.</p>}
    </div>
  )
}

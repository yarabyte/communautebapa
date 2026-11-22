import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Newspaper, Pin } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { Pill } from "@/components/brand/pill"
import { PageHeader } from "@/components/espace/page-header"
import { FilterPills } from "@/components/shared/filter-pills"
import { associationById } from "@/lib/data/associations"
import { getPosts } from "@/lib/data/content"
import { formatDate } from "@/lib/format"
import { postCategoryLabels } from "@/lib/labels"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Actualités" }

export default async function ActualitesPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams
  const all = await getPosts()
  const posts = categorie ? all.filter((p) => p.category === categorie) : all
  const [featured, ...rest] = posts

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Vie de la communauté"
        title="Actualités"
        description="Annonces de la chefferie, nouvelles des projets et des associations, carnet de la communauté."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          basePath="/espace/actualites"
          param="categorie"
          current={categorie}
          options={Object.entries(postCategoryLabels).map(([value, label]) => ({ value, label }))}
        />
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {posts.length} actualité{posts.length > 1 ? "s" : ""}
        </p>
      </div>

      {featured && (
        <Link
          href={`/espace/actualites/${featured.slug}`}
          className="group relative isolate grid overflow-hidden rounded-3xl border border-or/25 bg-card shadow-[0_16px_36px_-26px_rgba(57,37,23,0.45)] lg:grid-cols-2"
        >
          <BapaMotif tone="gold" fade="corner" className="opacity-[0.12]" />
          <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-or/55 to-transparent" />
          <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
            <Image
              src={featured.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-nuit/10" />
          </div>
          <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{postCategoryLabels[featured.category]}</Pill>
              {featured.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full border border-terre/30 bg-accent px-2.5 py-0.5 text-xs text-terre">
                  <Pin className="size-3.5" /> Épinglé
                </span>
              )}
            </div>
            <h2 className="font-heading text-2xl leading-snug tracking-wide text-brun transition-colors group-hover:text-terre sm:text-3xl">
              {featured.title}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-brun-soft sm:text-base">{featured.excerpt}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {formatDate(featured.publishedAt)}
                {featured.associationId && <> · {associationById(featured.associationId)?.name}</>}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-terre">
                Lire l&apos;article
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.id}
              href={`/espace/actualites/${p.slug}`}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl border border-or/25 bg-card",
                "shadow-[0_12px_28px_-24px_rgba(57,37,23,0.4)] transition-shadow hover:shadow-[0_18px_36px_-22px_rgba(57,37,23,0.45)]",
              )}
            >
              <BapaMotif tone="gold" fade="corner" className="opacity-[0.12]" />
              <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-or/50 to-transparent" />
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="relative flex flex-1 flex-col gap-2.5 p-5">
                <span className="text-[11px] font-medium tracking-[0.08em] text-or-dark uppercase">
                  {postCategoryLabels[p.category]} · {formatDate(p.publishedAt, "d MMM yyyy")}
                </span>
                <h3 className="font-heading text-lg leading-snug tracking-wide text-brun transition-colors group-hover:text-terre">
                  {p.title}
                </h3>
                <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-terre opacity-80 transition-opacity group-hover:opacity-100">
                  Lire
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-or/40 bg-creme-light/60 px-6 py-16 text-center">
          <BapaMotif tone="gold" fade="radial" className="opacity-20" />
          <Newspaper className="relative mx-auto size-10 text-or" />
          <p className="relative mt-4 font-heading text-lg text-brun">Aucune actualité dans cette catégorie</p>
          <p className="relative mt-1 text-sm text-muted-foreground">Essayez un autre filtre ou revenez plus tard.</p>
        </div>
      )}
    </div>
  )
}

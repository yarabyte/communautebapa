import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarRange, Users } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { Pill } from "@/components/brand/pill"
import { MemberAvatar } from "@/components/espace/member-avatar"
import { SectionCard } from "@/components/espace/section-card"
import { ProjectProgress } from "@/components/shared/project-card"
import { associationById } from "@/lib/data/associations"
import { memberById } from "@/lib/data/members"
import { getContributions, getProject } from "@/lib/data/projects"
import { formatDate, formatMoney, fromNow } from "@/lib/format"
import { projectCategoryLabels, projectStatusLabels } from "@/lib/labels"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProject((await params).slug)
  return { title: p?.title ?? "Projet" }
}

export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()
  const association = associationById(project.associationId)
  const recent = (await getContributions({ projectId: project.id, status: "COMPLETED" })).slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <Link href="/espace/projets" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Tous les projets
      </Link>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_1fr]">
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
            <Image src={project.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Pill tone="glass">{projectCategoryLabels[project.category]}</Pill>
              <Pill tone="glass">{projectStatusLabels[project.status]}</Pill>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-3xl leading-tight text-brun">{project.title}</h1>
            <p className="text-lg text-brun-soft">{project.summary}</p>
            {project.description.map((d, i) => (
              <p key={i} className="leading-relaxed text-brun-soft">
                {d}
              </p>
            ))}
          </div>
          <SectionCard title="Suivi du projet">
            {project.updates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Les premières nouvelles du chantier seront publiées ici.</p>
            ) : (
              <ol className="relative flex flex-col gap-6 border-l border-or/40 pl-6">
                {project.updates.map((u) => (
                  <li key={u.date} className="relative">
                    <span className="absolute top-1.5 -left-[29px] size-2.5 rotate-45 bg-terre" />
                    <p className="text-xs text-or-dark">{formatDate(u.date)}</p>
                    <h3 className="font-medium text-brun">{u.title}</h3>
                    <p className="text-sm text-brun-soft">{u.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <ProjectProgress project={project} />
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CalendarRange className="size-4 text-or" /> Depuis le {formatDate(project.startDate)}
                {project.endDate && ` · fin prévue le ${formatDate(project.endDate)}`}
              </li>
              {association && (
                <li className="flex items-center gap-2">
                  <Users className="size-4 text-or" /> Porté par {association.name}
                </li>
              )}
            </ul>
            {project.status !== "TERMINE" ? (
              <CtaLink href={`/espace/contribuer?projet=${project.slug}`} diamond>
                Contribuer à ce projet
              </CtaLink>
            ) : (
              <p className="rounded-xl bg-olive/10 p-3 text-center text-sm text-olive">Projet réalisé. Merci à tous les contributeurs !</p>
            )}
            <p className="text-center text-xs text-muted-foreground">Orange Money · MTN MoMo · Carte · PayPal · Espèces</p>
          </div>
          <SectionCard title="Derniers contributeurs" contentClassName="flex flex-col gap-3">
            {recent.map((c) => {
              const m = memberById(c.memberId)
              return (
                <div key={c.id} className="flex items-center gap-3">
                  {m && !c.anonymous ? <MemberAvatar member={m} className="size-8" /> : <span className="size-8 rounded-full bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-brun">{c.anonymous || !m ? "Contributeur anonyme" : `${m.firstName} ${m.lastName}`}</p>
                    <p className="text-xs text-muted-foreground">{fromNow(c.createdAt)}</p>
                  </div>
                  <span className="text-sm font-medium text-terre">{formatMoney(c.amount, c.currency)}</span>
                </div>
              )
            })}
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}

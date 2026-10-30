import Image from "next/image"
import Link from "next/link"
import { Users } from "lucide-react"

import { Pill } from "@/components/brand/pill"
import { Progress } from "@/components/ui/progress"
import { formatMoney, percent } from "@/lib/format"
import { projectCategoryLabels, projectStatusLabels } from "@/lib/labels"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ProjectProgress({ project, className }: { project: Project; className?: string }) {
  const pct = percent(project.raisedXaf, project.goalXaf)
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-heading text-lg text-terre">{formatMoney(project.raisedXaf)}</span>
        <span className="text-xs text-muted-foreground">sur {formatMoney(project.goalXaf)}</span>
      </div>
      <Progress value={pct} className="h-2 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-terre [&>[data-slot=progress-indicator]]:to-or" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{pct} % atteint</span>
        <span className="flex items-center gap-1">
          <Users className="size-3.5" /> {project.contributorsCount} contributeurs
        </span>
      </div>
    </div>
  )
}

export function ProjectCard({ project, href }: { project: Project; href: string }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_2px_6px_rgba(57,37,23,0.05)] transition-shadow hover:shadow-[0_20px_40px_rgba(57,37,23,0.14)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={project.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit/55 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Pill tone="glass">{projectCategoryLabels[project.category]}</Pill>
        </div>
        <span
          className={cn(
            "absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-medium",
            project.status === "EN_COURS" && "bg-olive text-creme-light",
            project.status === "A_VENIR" && "bg-or-light text-brun",
            project.status === "TERMINE" && "bg-nuit/75 text-creme-light"
          )}
        >
          {projectStatusLabels[project.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-lg leading-snug text-brun">
          <Link href={href} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-brun-soft">{project.summary}</p>
        <ProjectProgress project={project} className="mt-auto pt-2" />
      </div>
    </article>
  )
}

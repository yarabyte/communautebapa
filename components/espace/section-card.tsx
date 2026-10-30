import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type SectionCardProps = {
  title: string
  description?: string
  href?: string
  linkLabel?: string
  action?: React.ReactNode
  className?: string
  contentClassName?: string
  children: React.ReactNode
}

export function SectionCard({ title, description, href, linkLabel = "Voir tout", action, className, contentClassName, children }: SectionCardProps) {
  return (
    <section className={cn("flex flex-col rounded-3xl border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-heading text-lg text-brun">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action ??
          (href && (
            <Link href={href} className="flex shrink-0 items-center gap-1 text-sm text-terre hover:text-terre-dark">
              {linkLabel} <ArrowRight className="size-3.5" />
            </Link>
          ))}
      </header>
      <div className={cn("flex-1 p-5", contentClassName)}>{children}</div>
    </section>
  )
}

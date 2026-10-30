import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  tone?: "terre" | "olive" | "or" | "indigo"
  className?: string
}

const tones = {
  terre: "bg-terre/10 text-terre",
  olive: "bg-olive/10 text-olive",
  or: "bg-or/15 text-or-dark",
  indigo: "bg-indigo-bapa/10 text-indigo-bapa",
}

export function StatCard({ icon: Icon, label, value, hint, tone = "terre", className }: StatCardProps) {
  return (
    <div className={cn("flex items-start gap-4 rounded-2xl border border-border bg-card p-5", className)}>
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs tracking-[0.12em] text-muted-foreground uppercase">{label}</span>
        <span className="font-heading text-2xl leading-tight text-brun">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}

import { Eyebrow } from "@/components/brand/pill"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex flex-col gap-2">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-heading text-2xl leading-tight text-brun sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-brun-soft sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

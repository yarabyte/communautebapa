import { cn } from "@/lib/utils"
import { Eyebrow } from "./pill"

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  action?: React.ReactNode
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = "left", action, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="font-heading text-3xl leading-tight tracking-[0.02em] text-brun sm:text-4xl">{title}</h2>
        {description && <p className="text-base leading-relaxed text-brun-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}

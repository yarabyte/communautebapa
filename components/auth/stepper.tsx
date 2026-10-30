import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Étapes">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className={cn("flex items-center gap-2", i < steps.length - 1 && "flex-1")} aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                done && "border-olive bg-olive text-creme-light",
                active && "border-terre bg-terre text-creme-light shadow-[0_0_0_4px_rgba(156,91,52,0.15)]",
                !done && !active && "border-border bg-card text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn("hidden text-xs xl:inline", active ? "font-medium text-brun" : "text-muted-foreground")}>{label}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", done ? "bg-olive" : "bg-border")} />}
          </li>
        )
      })}
    </ol>
  )
}

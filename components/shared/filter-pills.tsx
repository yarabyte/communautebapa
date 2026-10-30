import Link from "next/link"

import { cn } from "@/lib/utils"

type FilterPillsProps = {
  options: { value: string; label: string }[]
  current?: string
  param: string
  basePath: string
  allLabel?: string
}

export function FilterPills({ options, current, param, basePath, allLabel = "Toutes" }: FilterPillsProps) {
  const items = [{ value: "", label: allLabel }, ...options]
  return (
    <nav aria-label="Filtres" className="flex flex-wrap gap-2">
      {items.map((o) => {
        const active = (current ?? "") === o.value
        return (
          <Link
            key={o.value || "all"}
            href={o.value ? `${basePath}?${param}=${o.value}` : basePath}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              active ? "border-terre bg-terre text-creme-light" : "border-border bg-card text-brun hover:border-terre/50 hover:bg-secondary"
            )}
          >
            {o.label}
          </Link>
        )
      })}
    </nav>
  )
}

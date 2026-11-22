"use client"

import { X } from "lucide-react"

import { AssociationFilterBar, EmptyAssociations, useAssociationFilter } from "@/components/shared/association-browser"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cityGroupLabel } from "@/lib/association-utils"
import { associationCategoryLabels } from "@/lib/labels"
import type { Association } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AssociationPicker({
  associations,
  value,
  onChange,
  initialCountry,
}: {
  associations: Association[]
  value: string[]
  onChange: (ids: string[]) => void
  initialCountry?: string
}) {
  const state = useAssociationFilter(associations, initialCountry)
  const selected = value.map((id) => associations.find((a) => a.id === id)).filter((a) => !!a)
  const toggle = (id: string, on: boolean) => onChange(on ? [...value, id] : value.filter((x) => x !== id))

  return (
    <div className="min-w-0 space-y-3">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Associations sélectionnées">
          {selected.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => toggle(a.id, false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-terre/40 bg-accent py-1 pr-2 pl-3 text-xs text-brun hover:border-terre"
              >
                {a.shortName}
                <X className="size-3" aria-label={`Retirer ${a.name}`} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AssociationFilterBar state={state} total={associations.length} />

      <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-card">
        {state.groups.length === 0 && (
          <div className="p-3">
            <EmptyAssociations onReset={state.reset} />
          </div>
        )}
        {state.groups.map((group) => (
          <section key={group.country}>
            <h3 className="sticky top-0 z-10 flex items-center justify-between border-b bg-secondary/95 px-3 py-2 text-sm font-semibold text-brun backdrop-blur">
              {group.country}
              <span className="text-xs font-normal text-muted-foreground">{group.count}</span>
            </h3>
            {group.cities.map((city) => {
              const label = cityGroupLabel(city, group.country)
              return (
                <div key={city.key} className="border-b last:border-b-0">
                  <p className="px-3 pt-2.5 pb-1 text-xs tracking-wide text-muted-foreground uppercase">
                    {label.title}
                    {label.subtitle && <span className="normal-case"> · {label.subtitle}</span>}
                  </p>
                  {city.associations.map((a) => {
                    const checked = value.includes(a.id)
                    return (
                      <Label
                        key={a.id}
                        className={cn("flex cursor-pointer items-center gap-3 px-3 py-2 font-normal hover:bg-muted/60", checked && "bg-accent")}
                      >
                        <Checkbox checked={checked} onCheckedChange={(v) => toggle(a.id, v === true)} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm leading-snug text-brun">{a.name}</span>
                          <span className="block text-xs text-muted-foreground">{associationCategoryLabels[a.category]}</span>
                        </span>
                      </Label>
                    )
                  })}
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
